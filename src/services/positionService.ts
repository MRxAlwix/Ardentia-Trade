import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Position } from '../types';

export const positionService = {
  // Open a new position
  async openPosition(
    userId: string,
    symbol: string,
    type: 'long' | 'short',
    amount: number,
    entryPrice: number,
    leverage: number = 1,
    stopLoss?: number,
    takeProfit?: number
  ): Promise<Position> {
    try {
      const positionId = `${userId}_${symbol}_${Date.now()}`;
      const margin = amount / leverage;
      
      const position: Position = {
        id: positionId,
        userId,
        symbol,
        type,
        amount,
        entryPrice,
        currentPrice: entryPrice,
        leverage,
        margin,
        pnl: 0,
        pnlPercentage: 0,
        timestamp: Date.now(),
        status: 'open',
        stopLoss,
        takeProfit
      };

      await setDoc(doc(db, 'positions', positionId), position);
      return position;
    } catch (error) {
      console.error('Error opening position:', error);
      throw new Error('Failed to open position');
    }
  },

  // Get user's open positions
  async getUserPositions(userId: string): Promise<Position[]> {
    try {
      const q = query(
        collection(db, 'positions'),
        where('userId', '==', userId),
        where('status', '==', 'open'),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Position);
    } catch (error) {
      console.error('Error getting user positions:', error);
      return [];
    }
  },

  // Update position with current price and calculate PnL
  async updatePosition(positionId: string, currentPrice: number): Promise<void> {
    try {
      const positionRef = doc(db, 'positions', positionId);
      
      // Get current position data to calculate PnL
      const positionDoc = await positionRef.get();
      if (!positionDoc.exists()) return;
      
      const position = positionDoc.data() as Position;
      
      // Calculate PnL
      let pnl = 0;
      let pnlPercentage = 0;
      
      if (position.type === 'long') {
        pnl = (currentPrice - position.entryPrice) * position.amount;
        pnlPercentage = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
      } else {
        pnl = (position.entryPrice - currentPrice) * position.amount;
        pnlPercentage = ((position.entryPrice - currentPrice) / position.entryPrice) * 100;
      }
      
      // Apply leverage to PnL
      pnl *= position.leverage;
      pnlPercentage *= position.leverage;
      
      await updateDoc(positionRef, {
        currentPrice,
        pnl,
        pnlPercentage
      });
      
      // Check for stop loss or take profit
      if (position.stopLoss && 
          ((position.type === 'long' && currentPrice <= position.stopLoss) ||
           (position.type === 'short' && currentPrice >= position.stopLoss))) {
        await this.closePosition(positionId, currentPrice, 'Stop Loss Hit');
      }
      
      if (position.takeProfit && 
          ((position.type === 'long' && currentPrice >= position.takeProfit) ||
           (position.type === 'short' && currentPrice <= position.takeProfit))) {
        await this.closePosition(positionId, currentPrice, 'Take Profit Hit');
      }
      
    } catch (error) {
      console.error('Error updating position:', error);
    }
  },

  // Close a position
  async closePosition(positionId: string, closePrice: number, reason?: string): Promise<void> {
    try {
      const positionRef = doc(db, 'positions', positionId);
      await updateDoc(positionRef, {
        status: 'closed',
        closePrice,
        closeReason: reason || 'Manual Close',
        closedAt: Date.now()
      });
    } catch (error) {
      console.error('Error closing position:', error);
      throw new Error('Failed to close position');
    }
  },

  // Listen to position updates
  onPositionsChange(userId: string, callback: (positions: Position[]) => void) {
    const q = query(
      collection(db, 'positions'),
      where('userId', '==', userId),
      where('status', '==', 'open'),
      orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const positions = snapshot.docs.map(doc => doc.data() as Position);
      callback(positions);
    });
  },

  // Get position history
  async getPositionHistory(userId: string): Promise<Position[]> {
    try {
      const q = query(
        collection(db, 'positions'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Position);
    } catch (error) {
      console.error('Error getting position history:', error);
      return [];
    }
  }
};