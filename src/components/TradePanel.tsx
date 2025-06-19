import React, { useState } from 'react';
import { ShoppingCart, Coins } from 'lucide-react';
import { Order } from '../types';

interface TradePanelProps {
  coinSymbol: string;
  currentPrice: number;
  balance: number;
  onPlaceOrder: (order: Omit<Order, 'id' | 'timestamp' | 'status'>) => void;
}

export const TradePanel: React.FC<TradePanelProps> = ({ 
  coinSymbol, 
  currentPrice, 
  balance, 
  onPlaceOrder 
}) => {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState(currentPrice.toString());

  const calculateTotal = () => {
    const amountNum = parseFloat(amount) || 0;
    const priceNum = orderType === 'market' ? currentPrice : parseFloat(price) || 0;
    return amountNum * priceNum;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    const priceNum = orderType === 'market' ? currentPrice : parseFloat(price);
    const total = calculateTotal();

    if (amountNum <= 0 || priceNum <= 0) return;
    if (tradeType === 'buy' && total > balance) return;

    onPlaceOrder({
      type: tradeType,
      orderType,
      coin: coinSymbol,
      amount: amountNum,
      price: priceNum,
      total
    });

    setAmount('');
    if (orderType === 'limit') {
      setPrice(currentPrice.toString());
    }
  };

  return (
    <div className="bg-stone-800 rounded-lg border-2 border-amber-600/30 p-4 shadow-lg">
      <h3 className="text-lg font-bold text-amber-100 mb-4 font-mono flex items-center">
        <ShoppingCart className="w-5 h-5 mr-2 text-amber-400" />
        Trade {coinSymbol}
      </h3>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setTradeType('buy')}
          className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all duration-200 border-2 ${
            tradeType === 'buy'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
              : 'bg-stone-700 text-amber-300 hover:bg-stone-600 border-emerald-600/30'
          }`}
        >
          <Coins className="w-4 h-4 inline mr-1" />
          BUY
        </button>
        <button
          onClick={() => setTradeType('sell')}
          className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all duration-200 border-2 ${
            tradeType === 'sell'
              ? 'bg-red-600 text-white border-red-500 shadow-md'
              : 'bg-stone-700 text-amber-300 hover:bg-stone-600 border-red-600/30'
          }`}
        >
          <Coins className="w-4 h-4 inline mr-1" />
          SELL
        </button>
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setOrderType('market')}
          className={`flex-1 py-2 px-3 rounded text-sm font-bold transition-all duration-200 border ${
            orderType === 'market'
              ? 'bg-amber-600 text-white border-amber-500'
              : 'bg-stone-700 text-amber-300 hover:bg-stone-600 border-amber-600/30'
          }`}
        >
          Market
        </button>
        <button
          onClick={() => setOrderType('limit')}
          className={`flex-1 py-2 px-3 rounded text-sm font-bold transition-all duration-200 border ${
            orderType === 'limit'
              ? 'bg-amber-600 text-white border-amber-500'
              : 'bg-stone-700 text-amber-300 hover:bg-stone-600 border-amber-600/30'
          }`}
        >
          Limit
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {orderType === 'limit' && (
          <div>
            <label className="block text-sm font-bold text-amber-300 mb-2">
              Price (AC)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="1"
              className="w-full px-3 py-2 bg-stone-700 border-2 border-amber-600/30 rounded-lg text-amber-100 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="0"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-amber-300 mb-2">
            Amount ({coinSymbol})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.001"
            className="w-full px-3 py-2 bg-stone-700 border-2 border-amber-600/30 rounded-lg text-amber-100 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="0.000"
            required
          />
        </div>

        <div className="bg-stone-700 p-3 rounded-lg border border-amber-600/30">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-amber-400 font-bold">Total:</span>
            <span className="text-amber-100 font-mono font-bold">{calculateTotal().toFixed(0)} AC</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-amber-400 font-bold">Available:</span>
            <span className="text-emerald-400 font-mono font-bold">{balance.toLocaleString()} AC</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!amount || calculateTotal() > balance}
          className={`w-full py-3 rounded-lg font-bold transition-all duration-200 border-2 ${
            tradeType === 'buy'
              ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-600 text-white border-emerald-500 disabled:border-stone-500'
              : 'bg-red-600 hover:bg-red-700 disabled:bg-stone-600 text-white border-red-500 disabled:border-stone-500'
          } disabled:cursor-not-allowed shadow-lg`}
        >
          {tradeType === 'buy' ? 'BUY' : 'SELL'} {coinSymbol}
        </button>
      </form>
    </div>
  );
};