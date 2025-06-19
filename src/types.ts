export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  role: 'admin' | 'player';
  rank: string;
  createdAt: number;
  lastLogin: number;
}

export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface Position {
  id: string;
  userId: string;
  symbol: string;
  type: 'long' | 'short';
  amount: number;
  entryPrice: number;
  currentPrice: number;
  leverage: number;
  margin: number;
  pnl: number;
  pnlPercentage: number;
  timestamp: number;
  status: 'open' | 'closed';
  stopLoss?: number;
  takeProfit?: number;
}

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  volume_24h: number;
  high_24h: number;
  low_24h: number;
  image: string;
  rarity?: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  proofImage?: string;
  adminNotes?: string;
}

export interface TradingSettings {
  minTradeAmount: number;
  maxTradeAmount: number;
  tradingFee: number;
  maintenanceMode: boolean;
  allowedSymbols: string[];
  maxLeverage: number;
  marginRequirement: number;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

// Additional interfaces for backward compatibility
export interface ChartData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Order {
  id: string;
  coin: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface Portfolio {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  holdings: {
    [symbol: string]: {
      amount: number;
      value: number;
      averagePrice: number;
      pnl: number;
      pnlPercent: number;
    };
  };
}