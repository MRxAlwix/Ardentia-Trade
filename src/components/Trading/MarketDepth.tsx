import React, { useState, useEffect } from 'react';
import { OrderBook, OrderBookEntry } from '../../types';

interface MarketDepthProps {
  symbol: string;
}

export const MarketDepth: React.FC<MarketDepthProps> = ({ symbol }) => {
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });

  // Generate mock order book data
  useEffect(() => {
    const generateOrderBook = () => {
      const basePrice = Math.random() * 50000 + 20000; // Random price between 20k-70k
      const bids: OrderBookEntry[] = [];
      const asks: OrderBookEntry[] = [];

      // Generate bids (buy orders) - prices below current price
      for (let i = 0; i < 10; i++) {
        const price = basePrice - (i + 1) * (Math.random() * 50 + 10);
        const amount = Math.random() * 5 + 0.1;
        bids.push({
          price,
          amount,
          total: price * amount
        });
      }

      // Generate asks (sell orders) - prices above current price
      for (let i = 0; i < 10; i++) {
        const price = basePrice + (i + 1) * (Math.random() * 50 + 10);
        const amount = Math.random() * 5 + 0.1;
        asks.push({
          price,
          amount,
          total: price * amount
        });
      }

      setOrderBook({ bids, asks });
    };

    generateOrderBook();
    const interval = setInterval(generateOrderBook, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [symbol]);

  const formatPrice = (price: number) => price.toFixed(2);
  const formatAmount = (amount: number) => amount.toFixed(4);
  const formatTotal = (total: number) => total.toFixed(2);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Market Depth - {symbol}</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Bids (Buy Orders) */}
        <div>
          <h4 className="text-sm font-medium text-green-600 mb-2">Bids (Buy)</h4>
          <div className="space-y-1">
            <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-600 pb-1 border-b">
              <span>Price</span>
              <span>Amount</span>
              <span>Total</span>
            </div>
            {orderBook.bids.map((bid, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 text-xs">
                <span className="text-green-600 font-medium">${formatPrice(bid.price)}</span>
                <span>{formatAmount(bid.amount)}</span>
                <span>${formatTotal(bid.total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Asks (Sell Orders) */}
        <div>
          <h4 className="text-sm font-medium text-red-600 mb-2">Asks (Sell)</h4>
          <div className="space-y-1">
            <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-600 pb-1 border-b">
              <span>Price</span>
              <span>Amount</span>
              <span>Total</span>
            </div>
            {orderBook.asks.map((ask, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 text-xs">
                <span className="text-red-600 font-medium">${formatPrice(ask.price)}</span>
                <span>{formatAmount(ask.amount)}</span>
                <span>${formatTotal(ask.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};