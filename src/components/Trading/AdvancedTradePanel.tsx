import React, { useState, useEffect } from 'react';
import { CoinData, User } from '../../types';
import { positionService } from '../../services/positionService';
import { authService } from '../../services/authService';

interface AdvancedTradePanelProps {
  selectedCoin: CoinData | null;
  user: User | null;
  onTradeComplete: () => void;
}

export const AdvancedTradePanel: React.FC<AdvancedTradePanelProps> = ({
  selectedCoin,
  user,
  onTradeComplete
}) => {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [positionType, setPositionType] = useState<'long' | 'short'>('long');
  const [amount, setAmount] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [limitPrice, setLimitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [loading, setLoading] = useState(false);

  const maxLeverage = 100;
  const currentPrice = selectedCoin?.current_price || 0;
  const amountValue = parseFloat(amount) || 0;
  const margin = amountValue / leverage;
  const positionSize = amountValue * leverage;

  const handleTrade = async () => {
    if (!selectedCoin || !user || !amount) {
      alert('Please fill in all required fields');
      return;
    }

    if (amountValue <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    if (margin > user.balance) {
      alert('Insufficient balance for margin requirement');
      return;
    }

    setLoading(true);
    try {
      const entryPrice = orderType === 'market' ? currentPrice : parseFloat(limitPrice);
      
      if (!entryPrice || entryPrice <= 0) {
        alert('Invalid entry price');
        return;
      }

      // Deduct margin from user balance
      await authService.updateUserBalance(user.id, user.balance - margin);

      // Open position
      await positionService.openPosition(
        user.id,
        selectedCoin.symbol.toUpperCase(),
        positionType,
        amountValue,
        entryPrice,
        leverage,
        stopLoss ? parseFloat(stopLoss) : undefined,
        takeProfit ? parseFloat(takeProfit) : undefined
      );

      // Reset form
      setAmount('');
      setLimitPrice('');
      setStopLoss('');
      setTakeProfit('');
      
      onTradeComplete();
      alert(`${positionType.toUpperCase()} position opened successfully!`);
    } catch (error) {
      console.error('Error opening position:', error);
      alert('Failed to open position');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(value);
  };

  if (!selectedCoin) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Advanced Trading</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📈</div>
          <p>Select a coin to start trading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Advanced Trading</h3>
        <div className="flex items-center space-x-2">
          <img src={selectedCoin.image} alt={selectedCoin.name} className="w-6 h-6" />
          <span className="font-medium">{selectedCoin.symbol.toUpperCase()}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Order Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
          <div className="flex space-x-2">
            <button
              onClick={() => setOrderType('market')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                orderType === 'market'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Market
            </button>
            <button
              onClick={() => setOrderType('limit')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                orderType === 'limit'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Limit
            </button>
          </div>
        </div>

        {/* Position Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
          <div className="flex space-x-2">
            <button
              onClick={() => setPositionType('long')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                positionType === 'long'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Long (Buy)
            </button>
            <button
              onClick={() => setPositionType('short')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                positionType === 'short'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Short (Sell)
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (USD)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Leverage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Leverage: {leverage}x
          </label>
          <input
            type="range"
            min="1"
            max={maxLeverage}
            value={leverage}
            onChange={(e) => setLeverage(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1x</span>
            <span>{maxLeverage}x</span>
          </div>
        </div>

        {/* Limit Price (only for limit orders) */}
        {orderType === 'limit' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limit Price
            </label>
            <input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder={`Current: ${formatCurrency(currentPrice)}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Stop Loss */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stop Loss (Optional)
          </label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            placeholder="Stop loss price"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Take Profit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Take Profit (Optional)
          </label>
          <input
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            placeholder="Take profit price"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Trade Summary */}
        {amountValue > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-gray-900">Trade Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Position Size:</span>
                <span className="font-medium">{formatCurrency(positionSize)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Margin Required:</span>
                <span className="font-medium">{formatCurrency(margin)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Entry Price:</span>
                <span className="font-medium">
                  {formatCurrency(orderType === 'market' ? currentPrice : parseFloat(limitPrice) || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available Balance:</span>
                <span className="font-medium">{formatCurrency(user?.balance || 0)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Trade Button */}
        <button
          onClick={handleTrade}
          disabled={loading || !amount || (orderType === 'limit' && !limitPrice)}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            positionType === 'long'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Opening Position...
            </div>
          ) : (
            `Open ${positionType.toUpperCase()} Position`
          )}
        </button>
      </div>
    </div>
  );
};