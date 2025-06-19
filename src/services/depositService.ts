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
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { DepositRequest, User } from '../types';

export const depositService = {
  // Create deposit request
  async createDepositRequest(
    userId: string, 
    username: string, 
    amount: number, 
    method: 'discord' | 'manual',
    proof?: string
  ): Promise<string> {
    try {
      const depositData: Omit<DepositRequest, 'id'> = {
        userId,
        username,
        amount,
        method,
        status: 'pending',
        proof,
        createdAt: Date.now()
      };

      const docRef = await addDoc(collection(db, 'deposits'), depositData);
      
      // Send Discord notification if method is discord
      if (method === 'discord') {
        await this.sendDiscordNotification(depositData, docRef.id);
      }

      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Process deposit (approve/reject)
  async processDeposit(
    depositId: string, 
    status: 'approved' | 'rejected', 
    processedBy: string,
    notes?: string
  ): Promise<void> {
    try {
      const depositRef = doc(db, 'deposits', depositId);
      const depositDoc = await getDoc(depositRef);
      
      if (!depositDoc.exists()) {
        throw new Error('Deposit request not found');
      }

      const depositData = depositDoc.data() as DepositRequest;

      // Update deposit status
      await updateDoc(depositRef, {
        status,
        processedAt: Date.now(),
        processedBy,
        notes
      });

      // If approved, add balance to user
      if (status === 'approved') {
        const userRef = doc(db, 'users', depositData.userId);
        await updateDoc(userRef, {
          balance: increment(depositData.amount)
        });

        // Send success notification to Discord
        await this.sendDiscordNotification({
          ...depositData,
          status: 'approved'
        }, depositId);
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get user deposits
  getUserDeposits(userId: string, callback: (deposits: DepositRequest[]) => void) {
    const q = query(
      collection(db, 'deposits'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const deposits: DepositRequest[] = [];
      snapshot.forEach((doc) => {
        deposits.push({ id: doc.id, ...doc.data() } as DepositRequest);
      });
      callback(deposits);
    });
  },

  // Get all deposits (admin)
  getAllDeposits(callback: (deposits: DepositRequest[]) => void) {
    const q = query(
      collection(db, 'deposits'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const deposits: DepositRequest[] = [];
      snapshot.forEach((doc) => {
        deposits.push({ id: doc.id, ...doc.data() } as DepositRequest);
      });
      callback(deposits);
    });
  },

  // Send Discord notification (webhook)
  async sendDiscordNotification(deposit: Omit<DepositRequest, 'id'>, depositId: string): Promise<void> {
    try {
      // Discord webhook URL - replace with your actual webhook
      const webhookUrl = 'YOUR_DISCORD_WEBHOOK_URL';
      
      if (!webhookUrl || webhookUrl === 'YOUR_DISCORD_WEBHOOK_URL') {
        console.log('Discord webhook not configured');
        return;
      }

      const embed = {
        title: deposit.status === 'approved' ? '✅ Deposit Approved' : '💰 New Deposit Request',
        color: deposit.status === 'approved' ? 0x00ff00 : 0xffaa00,
        fields: [
          { name: 'Player', value: deposit.username, inline: true },
          { name: 'Amount', value: `${deposit.amount.toLocaleString()} AC`, inline: true },
          { name: 'Method', value: deposit.method, inline: true },
          { name: 'Status', value: deposit.status.toUpperCase(), inline: true }
        ],
        timestamp: new Date().toISOString(),
        footer: { text: `Deposit ID: ${depositId}` }
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
      });
    } catch (error) {
      console.error('Failed to send Discord notification:', error);
    }
  }
};