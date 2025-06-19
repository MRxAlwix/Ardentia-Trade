export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  role: 'player' | 'admin';
  rank: string;
  createdAt: number;
  lastLogin: number;
  discordId?: string;
}

export interface Position {
  id: string;
  userId: string;
  type: 'long' | 'short';
  amount: number;
  entryPrice: number;
  currentPrice: number;
  leverage: number;
  margin: number;
  pnl: number;
  pnlPercent: number;
  status: 'open' | 'closed';
  openTime: number;
  closeTime?: number;
  liquidated?: boolean;
}

export interface ChartData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface DepositRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  method: 'discord' | 'manual';
  status: 'pending' | 'approved' | 'rejected';
  proof?: string;
  discordMessageId?: string;
  createdAt: number;
  processedAt?: number;
  processedBy?: string;
  notes?: string;
}

export interface TradingSettings {
  spread: number;
  maxLeverage: number;
  minTradeAmount: number;
  tradingFee: number;
  priceUpdateInterval: number;
  volatilitySettings: {
    baseVolatility: number;
    trendStrength: number;
    randomFactor: number;
  };
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  createdAt: number;
  createdBy: string;
  active: boolean;
}

export interface TradingStats {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  bestTrade: number;
  worstTrade: number;
  averageHoldTime: number;
}

export interface MarketData {
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  marketCap: number;
}