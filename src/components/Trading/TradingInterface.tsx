import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, X, Clock, BarChart3, AlertTriangle } from 'lucide-react';
import { CandlestickChart } from './CandlestickChart';
import { tradingService } from '../../services/tradingService';
import { Position, ChartData, User } from '../../types';

interface TradingInterfaceProps {
  user: User;
  currentPrice: number;
  chartData: ChartData[];
  onPriceUpdate: (change: number, type: 'percentage' | 'absolute') => void;
}

export const TradingInterface: React.FC<TradingInterfaceProps> = ({ 
  user, 
  currentPrice, 
  chartData,
  onPriceUpdate 
}) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [tradeAmount, setTradeAmount] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d' | '1w'>('1h');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = tradingService.getUserPositions(user.id, (fetchedPositions) => {
      setPositions(fetchedPositions);
    });
    return () => unsubscribe();
  }, [user.id]);

  // Update position P&L when price changes
  useEffect(() => {
    positions.forEach(position => {
      if (position.status === 'open') {
        tradingService.updatePositionPnL(position.id, currentPrice);
      }
    });
  }, [currentPrice, positions]);

  const openPosition = async (type: 'long' | 'short') => {
    setLoading(true);
    setError('');
    
    try {
      const amount = parseFloat(tradeAmount);
      if (amount <= 0) throw new Error('Invalid amount');
      if (amount < 100) throw new Error('Minimum trade amount is 100 AC');
      
      const margin = amount / leverage;
      if (margin > user.balance) throw new Error('Insufficient balance');

      await tradingService.openPosition(user.id, type, amount, leverage, currentPrice);
      setTradeAmount('');
      setError('');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const closePosition = async (positionId: string) => {
    try {
      await tradingService.closePosition(positionId, currentPrice);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const openPositions = positions.filter(p => p.status === 'open');
  const closedPositions = positions.filter(p => p.status === 'closed').slice(0, 10);

  const calculateMargin = () => {
    const amount = parseFloat(tradeAmount) || 0;
    return amount / leverage;
  };

  const calculateLiquidationPrice = (type: 'long' | 'short') => {
    const amount = parseFloat(tradeAmount) || 0;
    const margin = amount / leverage;
    
    if (type === 'long') {
      return currentPrice * (1 - 1 / leverage);
    } else {
      return currentPrice * (1 + 1 / leverage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart */}
      <CandlestickChart 
        data={chartData}
        currentPrice={currentPrice}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trading Panel */}
        <div className="bg-stone-800 rounded-lg border-2 border-amber-600/30 p-6 shadow-lg">
          <h3 className="text-xl font-bold text-amber-100 mb-4 font-mono">Open Position</h3>
          
          {error && (
            <div className="mb-4 bg-red-600/20 border border-red-500/50 rounded-lg p-3 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-amber-300 mb-2">
                Position Size (AC)
              </label>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                className="w-full px-4 py-3 bg-stone-700 border-2 border-amber-600/30 rounded-lg text-amber-100 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="1000"
                min="100"
                step="100"
              />
              <p className="text-xs text-amber-500 mt-1">Minimum: 100 AC</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-300 mb-2">
                Leverage: {leverage}x
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-amber-400 mt-1">
                <span>1x</span>
                <span>5x</span>
                <span>10x</span>
              </div>
            </div>

            <div className="bg-stone-700 p-4 rounded border border-amber-600/30 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-amber-400">Margin Required:</span>
                <span className="text-amber-100 font-mono">
                  {calculateMargin().toFixed(0)} AC
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-amber-400">Available Balance:</span>
                <span className="text-emerald-400 font-mono">{user.balance.toLocaleString()} AC</span>
              </div>
              {tradeAmount && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-400">Long Liquidation:</span>
                    <span className="text-red-400 font-mono">
                      {calculateLiquidationPrice('long').toFixed(0)} AC
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-400">Short Liquidation:</span>
                    <span className="text-red-400 font-mono">
                      {calculateLiquidationPrice('short').toFixed(0)} AC
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => openPosition('long')}
                disabled={loading || !tradeAmount || calculateMargin() > user.balance}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-600 text-white py-3 rounded-lg font-bold transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2 border-2 border-emerald-500 disabled:border-stone-500"
              >
                <TrendingUp className="w-5 h-5" />
                <span>{loading ? 'Opening...' : 'LONG'}</span>
              </button>
              
              <button
                onClick={() => openPosition('short')}
                disabled={loading || !tradeAmount || calculateMargin() > user.balance}
                className="bg-red-600 hover:bg-red-700 disabled:bg-stone-600 text-white py-3 rounded-lg font-bold transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2 border-2 border-red-500 disabled:border-stone-500"
              >
                <TrendingDown className="w-5 h-5" />
                <span>{loading ? 'Opening...' : 'SHORT'}</span>
              </button>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[500, 1000, 2500, 5000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTradeAmount(amount.toString())}
                  className="py-2 px-3 bg-stone-700 hover:bg-stone-600 text-amber-100 text-sm rounded transition-all duration-200 border border-amber-600/30 font-bold"
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Open Positions */}
        <div className="bg-stone-800 rounded-lg border-2 border-amber-600/30 p-6 shadow-lg">
          <h3 className="text-xl font-bold text-amber-100 mb-4 font-mono">Open Positions</h3>
          
          {openPositions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <p className="text-amber-400">No open positions</p>
              <p className="text-amber-500 text-sm">Open your first position to start trading</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {openPositions.map((position) => (
                <div key={position.id} className="bg-stone-700 p-4 rounded border border-amber-600/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {position.type === 'long' ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`font-bold ${
                        position.type === 'long' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {position.type.toUpperCase()}
                      </span>
                      <span className="text-amber-100">{position.leverage}x</span>
                    </div>
                    
                    <button
                      onClick={() => closePosition(position.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-1 rounded transition-all duration-200"
                      title="Close Position"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-amber-400">Size:</p>
                      <p className="text-amber-100 font-mono">{position.amount.toLocaleString()} AC</p>
                    </div>
                    <div>
                      <p className="text-amber-400">Entry:</p>
                      <p className="text-amber-100 font-mono">{position.entryPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-amber-400">Current:</p>
                      <p className="text-amber-100 font-mono">{position.currentPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-amber-400">Margin:</p>
                      <p className="text-amber-100 font-mono">{position.margin.toFixed(0)} AC</p>
                    </div>
                    <div>
                      <p className="text-amber-400">P&L:</p>
                      <p className={`font-mono font-bold ${
                        position.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {position.pnl >= 0 ? '+' : ''}{position.pnl.toFixed(0)} AC
                      </p>
                    </div>
                    <div>
                      <p className="text-amber-400">ROE:</p>
                      <p className={`font-mono font-bold ${
                        position.pnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Liquidation Warning */}
                  {Math.abs(position.pnlPercent) > 80 && (
                    <div className="mt-2 bg-red-600/20 border border-red-500/50 rounded p-2 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <p className="text-red-400 text-xs">Near liquidation!</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Position History */}
      <div className="bg-stone-800 rounded-lg border-2 border-amber-600/30 p-6 shadow-lg">
        <h3 className="text-xl font-bold text-amber-100 mb-4 font-mono">Recent Trades</h3>
        
        {closedPositions.length === 0 ? (
          <p className="text-amber-400 text-center py-8">No closed positions</p>
        ) : (
          <div className="space-y-2">
            {closedPositions.map((position) => (
              <div key={position.id} className="bg-stone-700 p-3 rounded border border-amber-600/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {position.type === 'long' ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${
                          position.type === 'long' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {position.type.toUpperCase()}
                        </span>
                        <span className="text-amber-100">{position.leverage}x</span>
                      </div>
                      <p className="text-xs text-amber-400">
                        {new Date(position.openTime).toLocaleString()}
                        {position.closeTime && ` - ${new Date(position.closeTime).toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-bold font-mono ${
                      position.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {position.pnl >= 0 ? '+' : ''}{position.pnl.toFixed(0)} AC
                    </p>
                    <p className="text-xs text-amber-400">
                      {position.amount.toLocaleString()} @ {position.entryPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};