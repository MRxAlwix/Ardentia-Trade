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
  setDoc,
  runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Position, ChartData, TradingSettings } from '../types';

export const tradingService = {
  // Open position with proper transaction handling
  async openPosition(
    userId: string,
    type: 'long' | 'short',
    amount: number,
    leverage: number,
    currentPrice: number
  ): Promise<string> {
    try {
      const margin = amount / leverage;
      
      // Use transaction to ensure atomicity
      const result = await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('User not found');
        }
        
        const userData = userDoc.data();
        if (userData.balance < margin) {
          throw new Error('Insufficient balance');
        }

        // Create position
        const positionRef = doc(collection(db, 'positions'));
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

        transaction.set(positionRef, positionData);
        
        // Deduct margin from user balance
        transaction.update(userRef, {
          balance: increment(-margin)
        });

        return positionRef.id;
      });

      return result;
    } catch (error: any) {
      console.error('Error opening position:', error);
      throw new Error(error.message || 'Failed to open position');
    }
  },

  // Close position with proper P&L calculation
  async closePosition(positionId: string, currentPrice: number): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const positionRef = doc(db, 'positions', positionId);
        const positionDoc = await transaction.get(positionRef);
        
        if (!positionDoc.exists()) {
          throw new Error('Position not found');
        }

        const position = positionDoc.data() as Position;
        
        if (position.status !== 'open') {
          throw new Error('Position is already closed');
        }

        // Calculate final P&L
        const priceDiff = position.type === 'long' 
          ? currentPrice - position.entryPrice
          : position.entryPrice - currentPrice;
        
        const pnl = (priceDiff / position.entryPrice) * position.amount;
        const pnlPercent = (pnl / position.margin) * 100;
        const finalAmount = Math.max(0, position.margin + pnl); // Prevent negative balance

        // Update position
        transaction.update(positionRef, {
          status: 'closed',
          closeTime: Date.now(),
          currentPrice,
          pnl,
          pnlPercent
        });

        // Return funds to user
        const userRef = doc(db, 'users', position.userId);
        transaction.update(userRef, {
          balance: increment(finalAmount)
        });
      });
    } catch (error: any) {
      console.error('Error closing position:', error);
      throw new Error(error.message || 'Failed to close position');
    }
  },

  // Get user positions with real-time updates
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
    }, (error) => {
      console.error('Error fetching positions:', error);
      callback([]);
    });
  },

  // Update position P&L with better error handling
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
      
      const pnl = (priceDiff / position.entryPrice) * position.amount;
      const pnlPercent = (pnl / position.margin) * 100;

      // Auto-liquidate if loss exceeds 95%
      if (pnlPercent <= -95) {
        await this.liquidatePosition(positionId, currentPrice);
        return;
      }

      await updateDoc(positionRef, {
        currentPrice,
        pnl,
        pnlPercent
      });
    } catch (error: any) {
      console.error('Failed to update position P&L:', error);
    }
  },

  // Liquidate position
  async liquidatePosition(positionId: string, currentPrice: number): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const positionRef = doc(db, 'positions', positionId);
        const positionDoc = await transaction.get(positionRef);
        
        if (!positionDoc.exists()) return;

        const position = positionDoc.data() as Position;
        
        if (position.status !== 'open') return;

        // Calculate liquidation P&L (usually -95% of margin)
        const pnl = -position.margin * 0.95;
        const pnlPercent = -95;

        // Update position as liquidated
        transaction.update(positionRef, {
          status: 'closed',
          closeTime: Date.now(),
          currentPrice,
          pnl,
          pnlPercent,
          liquidated: true
        });

        // Return remaining 5% to user
        const userRef = doc(db, 'users', position.userId);
        transaction.update(userRef, {
          balance: increment(position.margin * 0.05)
        });
      });
    } catch (error: any) {
      console.error('Error liquidating position:', error);
    }
  },

  // Get/Set trading settings with better defaults
  async getTradingSettings(): Promise<TradingSettings> {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'trading'));
      
      if (settingsDoc.exists()) {
        return settingsDoc.data() as TradingSettings;
      } else {
        // Default settings optimized for Minecraft community
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
      console.error('Error getting trading settings:', error);
      throw new Error(error.message);
    }
  },

  async updateTradingSettings(settings: TradingSettings): Promise<void> {
    try {
      await setDoc(doc(db, 'settings', 'trading'), settings);
    } catch (error: any) {
      console.error('Error updating trading settings:', error);
      throw new Error(error.message);
    }
  },

  // Generate realistic chart data
  generateChartData(basePrice: number, timeframe: '1h' | '4h' | '1d' | '1w', count: number = 100): ChartData[] {
    const data: ChartData[] = [];
    let price = basePrice;
    
    // Timeframe multipliers for volatility
    const volatilityMultiplier = {
      '1h': 0.005,  // 0.5%
      '4h': 0.01,   // 1%
      '1d': 0.02,   // 2%
      '1w': 0.05    // 5%
    };

    const timeMultiplier = {
      '1h': 3600000,      // 1 hour
      '4h': 14400000,     // 4 hours
      '1d': 86400000,     // 1 day
      '1w': 604800000     // 1 week
    };

    const volatility = volatilityMultiplier[timeframe];
    const timeStep = timeMultiplier[timeframe];
    
    for (let i = 0; i < count; i++) {
      const timestamp = Date.now() - (count - i) * timeStep;
      
      // Generate more realistic price movement
      const trend = Math.sin(i / 10) * 0.001; // Long-term trend
      const noise = (Math.random() - 0.5) * volatility; // Random noise
      const change = trend + noise;
      
      const open = price;
      price = Math.max(100, price * (1 + change)); // Minimum price of 100 AC
      const close = Math.round(price);
      
      // Generate high and low based on volatility
      const intraVolatility = volatility * 0.5;
      const high = Math.round(Math.max(open, close) * (1 + Math.random() * intraVolatility));
      const low = Math.round(Math.min(open, close) * (1 - Math.random() * intraVolatility));
      
      data.push({
        timestamp,
        open: Math.round(open),
        high,
        low: Math.max(50, low), // Minimum low of 50 AC
        close,
        volume: Math.random() * 10000 + 1000 // Volume between 1000-11000
      });
    }
    
    return data;
  }
};