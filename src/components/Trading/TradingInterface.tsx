import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, X, Clock, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { tradingService } from '../../services/tradingService';
import { Position, ChartData, User } from '../../types';

interface TradingInterfaceProps {
  user: User;
  currentPrice: number;
  chartData: ChartData[];
  onPriceUpdate: (price: number) => void;
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

  useEffect(() => {
    const unsubscribe = tradingService.getUserPositions(user.id, setPositions);
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
    try {
      const amount = parseFloat(tradeAmount);
      if (amount <= 0) throw new Error('Invalid amount');
      
      const margin = amount / leverage;
      if (margin > user.balance) throw new Error('Insufficient balance');

      await tradingService.openPosition(user.id, type, amount, leverage, currentPrice);
      setTradeAmount('');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const closePosition = async (positionId: string) => {
    try {
      await tradingService.closePosition(positionId, currentPrice);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const openPositions = positions.filter(p => p.status === 'open');
  const closedPositions = positions.filter(p => p.status === 'closed').slice(0, 10);

  const formatChartData = () => {
    return chartData.map(data => ({
      time: new Date(data.timestamp).toLocaleTimeString(),
      price: data.close
    }));
  };

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="bg-stone-800 rounded-lg border-2 border-amber-600/30 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-amber-100 font-mono flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-amber-400" />
            AGC/AC Chart
          </h3>
          
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              {(['1h', '4h', '1d', '1w'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                    timeframe === tf
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-700 text-amber-300 hover:bg-stone-600'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            
            <div className="text-right bg-stone-700 px-4 py-2 rounded border border-amber-600/30">
              <p className="text-sm text-amber-300">Current Price</p>
              <p className="text-2xl font-bold text-emerald-400 font-mono">
                {currentPrice.toLocaleString()} AC
              </p>
            </div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formatChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d97706" opacity={0.3} />
              <XAxis dataKey="time" stroke="#f59e0b" />
              <YAxis stroke="#f59e0b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1c1917', 
                  border: '1px solid #d97706',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trading Panel */}
        <div className="bg-stone-800 rounded-lg border-2 border-amber-600/30 p-6 shadow-lg">
          <h3 className="text-xl font-bold text-amber-100 mb-4 font-mono">Open Position</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-amber-300 mb-2">
                Trade Amount (AC)
              </label>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                className="w-full px-4 py-3 bg-stone-700 border-2 border-amber-600/30 rounded-lg text-amber-100 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="1000"
              />
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
                className="w-full"
              />
              <div className="flex justify-between text-xs text-amber-400 mt-1">
                <span>1x</span>
                <span>5x</span>
                <span>10x</span>
              </div>
            </div>

            <div className="bg-stone-700 p-3 rounded border border-amber-600/30">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-amber-400">Margin Required:</span>
                <span className="text-amber-100 font-mono">
                  {tradeAmount ? (parseFloat(tradeAmount) / leverage).toFixed(0) : '0'} AC
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-amber-400">Available Balance:</span>
                <span className="text-emerald-400 font-mono">{user.balance.toLocaleString()} AC</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => openPosition('long')}
                disabled={loading || !tradeAmount}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-600 text-white py-3 rounded-lg font-bold transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <TrendingUp className="w-5 h-5" />
                <span>LONG</span>
              </button>
              
              <button
                onClick={() => openPosition('short')}
                disabled={loading || !tradeAmount}
                className="bg-red-600 hover:bg-red-700 disabled:bg-stone-600 text-white py-3 rounded-lg font-bold transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <TrendingDown className="w-5 h-5" />
                <span>SHORT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Open Positions */}
        <div className="bg-stone-800 rounded-lg border-2 border-amber-600/30 p-6 shadow-lg">
          <h3 className="text-xl font-bold text-amber-100 mb-4 font-mono">Open Positions</h3>
          
          {openPositions.length === 0 ? (
            <p className="text-amber-400 text-center py-8">No open positions</p>
          ) : (
            <div className="space-y-3">
              {openPositions.map((position) => (
                <div key={position.id} className="bg-stone-700 p-4 rounded border border-amber-600/20">
                  <div className="flex items-center justify-between mb-2">
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
                      className="bg-red-600 hover:bg-red-700 text-white p-1 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-amber-400">Amount:</p>
                      <p className="text-amber-100 font-mono">{position.amount.toLocaleString()} AC</p>
                    </div>
                    <div>
                      <p className="text-amber-400">Entry:</p>
                      <p className="text-amber-100 font-mono">{position.entryPrice.toLocaleString()}</p>
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
                      <p className="text-amber-400">%:</p>
                      <p className={`font-mono font-bold ${
                        position.pnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(1)}%
                      </p>
                    </div>
                  </div>
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
                      <span className={`font-bold ${
                        position.type === 'long' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {position.type.toUpperCase()}
                      </span>
                      <span className="text-amber-100 ml-2">{position.leverage}x</span>
                      <p className="text-xs text-amber-400">
                        {new Date(position.openTime).toLocaleString()}
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