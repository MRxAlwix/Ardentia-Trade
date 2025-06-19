import React, { useState } from 'react';
import { Shield, AlertTriangle, Target, TrendingDown } from 'lucide-react';

interface RiskManagementProps {
  currentPrice: number;
  leverage: number;
  amount: string;
  onStopLossChange: (stopLoss: number | null) => void;
  onTakeProfitChange: (takeProfit: number | null) => void;
}

export const RiskManagement: React.FC<RiskManagementProps> = ({
  currentPrice,
  leverage,
  amount,
  onStopLossChange,
  onTakeProfitChange
}) => {
  const [stopLossEnabled, setStopLossEnabled] = useState(false);
  const [takeProfitEnabled, setTakeProfitEnabled] = useState(false);
  const [stopLossPercent, setStopLossPercent] = useState(5);
  const [takeProfitPercent, setTakeProfitPercent] = useState(10);

  const tradeAmount = parseFloat(amount) || 0;
  const margin = tradeAmount / leverage;

  const calculateStopLoss = (type: 'long' | 'short') => {
    if (type === 'long') {
      return currentPrice * (1 - stopLossPercent / 100);
    } else {
      return currentPrice * (1 + stopLossPercent / 100);
    }
  };

  const calculateTakeProfit = (type: 'long' | 'short') => {
    if (type === 'long') {
      return currentPrice * (1 + takeProfitPercent / 100);
    } else {
      return currentPrice * (1 - takeProfitPercent / 100);
    }
  };

  const calculatePnL = (exitPrice: number, type: 'long' | 'short') => {
    const priceDiff = type === 'long' 
      ? exitPrice - currentPrice
      : currentPrice - exitPrice;
    
    return (priceDiff / currentPrice) * tradeAmount;
  };

  const handleStopLossToggle = (enabled: boolean) => {
    setStopLossEnabled(enabled);
    if (enabled) {
      onStopLossChange(stopLossPercent);
    } else {
      onStopLossChange(null);
    }
  };

  const handleTakeProfitToggle = (enabled: boolean) => {
    setTakeProfitEnabled(enabled);
    if (enabled) {
      onTakeProfitChange(takeProfitPercent);
    } else {
      onTakeProfitChange(null);
    }
  };

  return (
    <div className="bg-stone-800 rounded-lg border-2 border-amber-600/30 p-6 shadow-lg">
      <h3 className="text-xl font-bold text-amber-100 mb-4 font-mono flex items-center">
        <Shield className="w-5 h-5 mr-2 text-amber-400" />
        Risk Management
      </h3>

      <div className="space-y-6">
        {/* Stop Loss */}
        <div className="bg-stone-700 p-4 rounded border border-red-600/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-red-400 font-bold">Stop Loss</span>
            </div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={stopLossEnabled}
                onChange={(e) => handleStopLossToggle(e.target.checked)}
                className="rounded text-red-500 focus:ring-red-500"
              />
              <span className="text-amber-100 text-sm">Enable</span>
            </label>
          </div>

          {stopLossEnabled && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-amber-300 mb-2">
                  Stop Loss Percentage
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={stopLossPercent}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setStopLossPercent(value);
                    onStopLossChange(value);
                  }}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-amber-400 mt-1">
                  <span>1%</span>
                  <span className="font-bold">{stopLossPercent}%</span>
                  <span>20%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-amber-400">Long Stop Loss:</p>
                  <p className="text-red-400 font-mono">{calculateStopLoss('long').toFixed(0)} AC</p>
                  <p className="text-red-400 text-xs">
                    Loss: -{(margin * stopLossPercent / 100 * leverage).toFixed(0)} AC
                  </p>
                </div>
                <div>
                  <p className="text-amber-400">Short Stop Loss:</p>
                  <p className="text-red-400 font-mono">{calculateStopLoss('short').toFixed(0)} AC</p>
                  <p className="text-red-400 text-xs">
                    Loss: -{(margin * stopLossPercent / 100 * leverage).toFixed(0)} AC
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Take Profit */}
        <div className="bg-stone-700 p-4 rounded border border-emerald-600/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Take Profit</span>
            </div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={takeProfitEnabled}
                onChange={(e) => handleTakeProfitToggle(e.target.checked)}
                className="rounded text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-amber-100 text-sm">Enable</span>
            </label>
          </div>

          {takeProfitEnabled && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-amber-300 mb-2">
                  Take Profit Percentage
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={takeProfitPercent}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setTakeProfitPercent(value);
                    onTakeProfitChange(value);
                  }}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-amber-400 mt-1">
                  <span>5%</span>
                  <span className="font-bold">{takeProfitPercent}%</span>
                  <span>50%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-amber-400">Long Take Profit:</p>
                  <p className="text-emerald-400 font-mono">{calculateTakeProfit('long').toFixed(0)} AC</p>
                  <p className="text-emerald-400 text-xs">
                    Profit: +{(margin * takeProfitPercent / 100 * leverage).toFixed(0)} AC
                  </p>
                </div>
                <div>
                  <p className="text-amber-400">Short Take Profit:</p>
                  <p className="text-emerald-400 font-mono">{calculateTakeProfit('short').toFixed(0)} AC</p>
                  <p className="text-emerald-400 text-xs">
                    Profit: +{(margin * takeProfitPercent / 100 * leverage).toFixed(0)} AC
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Risk Summary */}
        <div className="bg-amber-600/10 border border-amber-600/30 rounded p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-bold text-sm">Risk Summary</span>
          </div>
          <div className="text-xs text-amber-300 space-y-1">
            <p>• Maximum loss per trade: {stopLossEnabled ? `${stopLossPercent}%` : 'Unlimited'}</p>
            <p>• Target profit per trade: {takeProfitEnabled ? `${takeProfitPercent}%` : 'Manual close'}</p>
            <p>• Risk-to-reward ratio: {takeProfitEnabled && stopLossEnabled ? `1:${(takeProfitPercent / stopLossPercent).toFixed(1)}` : 'N/A'}</p>
            <p>• Leverage multiplies both profits and losses by {leverage}x</p>
          </div>
        </div>
      </div>
    </div>
  );
};