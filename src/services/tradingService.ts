import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  increment,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Position, ChartData, TradingSettings } from '../types';

export const tradingService = {
  // Open position
  async openPosition(
    userId: string,
    type: 'long' | 'short',
    amount: number,
    leverage: number,
    currentPrice: number
  ): Promise<string> {
    try {
      const margin = amount / leverage;
      
      const positionData: Omit<Position, 'id'> = {
        userId,
        type,
        amount,
        entryPrice: currentPrice,
        currentPrice,
        leverage,
        margin,
        pnl: 0,
        pnlPercent: 0,
        status: 'open',
        openTime: Date.now()
      };

      const docRef = await addDoc(collection(db, 'positions'), positionData);

      // Deduct margin from user balance
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        balance: increment(-margin)
      });

      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Close position
  async closePosition(positionId: string, currentPrice: number): Promise<void> {
    try {
      const positionRef = doc(db, 'positions', positionId);
      const positionDoc = await getDoc(positionRef);
      
      if (!positionDoc.exists()) {
        throw new Error('Position not found');
      }

      const position = positionDoc.data() as Position;
      
      // Calculate final P&L
      const priceDiff = position.type === 'long' 
        ? currentPrice - position.entryPrice
        : position.entryPrice - currentPrice;
      
      const pnl = (priceDiff / position.entryPrice) * position.amount * position.leverage;
      const finalAmount = position.margin + pnl;

      // Update position
      await updateDoc(positionRef, {
        status: 'closed',
        closeTime: Date.now(),
        currentPrice,
        pnl,
        pnlPercent: (pnl / position.margin) * 100
      });

      // Return funds to user
      const userRef = doc(db, 'users', position.userId);
      await updateDoc(userRef, {
        balance: increment(Math.max(0, finalAmount)) // Prevent negative balance
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get user positions
  getUserPositions(userId: string, callback: (positions: Position[]) => void) {
    const q = query(
      collection(db, 'positions'),
      where('userId', '==', userId),
      orderBy('openTime', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const positions: Position[] = [];
      snapshot.forEach((doc) => {
        positions.push({ id: doc.id, ...doc.data() } as Position);
      });
      callback(positions);
    });
  },

  // Update position P&L
  async updatePositionPnL(positionId: string, currentPrice: number): Promise<void> {
    try {
      const positionRef = doc(db, 'positions', positionId);
      const positionDoc = await getDoc(positionRef);
      
      if (!positionDoc.exists()) return;

      const position = positionDoc.data() as Position;
      
      if (position.status !== 'open') return;

      const priceDiff = position.type === 'long' 
        ? currentPrice - position.entryPrice
        : position.entryPrice - currentPrice;
      
      const pnl = (priceDiff / position.entryPrice) * position.amount * position.leverage;
      const pnlPercent = (pnl / position.margin) * 100;

      await updateDoc(positionRef, {
        currentPrice,
        pnl,
        pnlPercent
      });
    } catch (error: any) {
      console.error('Failed to update position P&L:', error);
    }
  },

  // Get/Set trading settings
  async getTradingSettings(): Promise<TradingSettings> {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'trading'));
      
      if (settingsDoc.exists()) {
        return settingsDoc.data() as TradingSettings;
      } else {
        // Default settings
        const defaultSettings: TradingSettings = {
          spread: 0.1, // 0.1%
          maxLeverage: 10,
          minTradeAmount: 100,
          tradingFee: 0.05, // 0.05%
          priceUpdateInterval: 5000, // 5 seconds
          volatilitySettings: {
            baseVolatility: 0.02, // 2%
            trendStrength: 0.3,
            randomFactor: 0.5
          }
        };

        await setDoc(doc(db, 'settings', 'trading'), defaultSettings);
        return defaultSettings;
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async updateTradingSettings(settings: TradingSettings): Promise<void> {
    try {
      await setDoc(doc(db, 'settings', 'trading'), settings);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
};