import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Clock, BarChart3, Award } from 'lucide-react';
import { Position, TradingStats } from '../../types';

interface TradingStatsProps {
  positions: Position[];
}

export const TradingStatsComponent: React.FC<TradingStatsProps> = ({ positions }) => {
  const [stats, setStats] = useState<TradingStats>({
    totalTrades: 0,
    winRate: 0,
    totalPnL: 0,
    bestTrade: 0,
    worstTrade: 0,
    averageHoldTime: 0
  });

  useEffect(() => {
    calculateStats();
  }, [positions]);

  const calculateStats = () => {
    const closedPositions = positions.filter(p => p.status === 'closed');
    
    if (closedPositions.length === 0) {
      setStats({
        totalTrades: 0,
        winRate: 0,
        totalPnL: 0,
        bestTrade: 0,
        worstTrade: 0,
        averageHoldTime: 0
      });
      return;
    }

    const totalTrades = closedPositions.length;
    const winningTrades = closedPositions.filter(p => p.pnl > 0).length;
    const winRate = (winningTrades / totalTrades) * 100;
    
    const totalPnL = closedPositions.reduce((sum, p) => sum + p.pnl, 0);
    const bestTrade = Math.max(...closedPositions.map(p => p.pnl));
    const worstTrade = Math.min(...closedPositions.map(p => p.pnl));
    
    const totalHoldTime = closedPositions.reduce((sum, p) => {
      return sum + ((p.closeTime || 0) - p.openTime);
    }, 0);
    const averageHoldTime = totalHoldTime / totalTrades;

    setStats({
      totalTrades,
      winRate,
      totalPnL,
      bestTrade,
      worstTrade,
      averageHoldTime
    });
  };

  const formatHoldTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getRankByWinRate = (winRate: number) => {
    if (winRate >= 80) return { rank: 'Master Trader', color: 'text-amber-400', icon: Award };
    if (winRate >= 70) return { rank: 'Expert', color: 'text-purple-400', icon: Target };
    if (winRate >= 60) return { rank: 'Advanced', color: 'text-blue-400', icon: TrendingUp };
    if (winRate >= 50) return { rank: 'Intermediate', color: 'text-emerald-400', icon: BarChart3 };
    return { rank: 'Beginner', color: 'text-amber-300', icon: Clock };
  };

  const rankInfo = getRankByWinRate(stats.winRate);
  const RankIcon = rankInfo.icon;

  return (
    <div className="bg-stone-800 rounded-lg border-2 border-amber-600/30 p-6 shadow-lg">
      <h3 className="text-xl font-bold text-amber-100 mb-4 font-mono flex items-center">
        <BarChart3 className="w-5 h-5 mr-2 text-amber-400" />
        Trading Statistics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-stone-700 p-4 rounded border border-amber-600/20">
          <p className="text-amber-400 text-sm font-bold">Total Trades</p>
          <p className="text-2xl font-bold text-amber-100 font-mono">{stats.totalTrades}</p>
        </div>

        <div className="bg-stone-700 p-4 rounded border border-amber-600/20">
          <p className="text-amber-400 text-sm font-bold">Win Rate</p>
          <p className={`text-2xl font-bold font-mono ${
            stats.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {stats.winRate.toFixed(1)}%
          </p>
        </div>

        <div className="bg-stone-700 p-4 rounded border border-amber-600/20">
          <p className="text-amber-400 text-sm font-bold">Total P&L</p>
          <p className={`text-2xl font-bold font-mono ${
            stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {stats.totalPnL >= 0 ? '+' : ''}{stats.totalPnL.toFixed(0)} AC
          </p>
        </div>

        <div className="bg-stone-700 p-4 rounded border border-amber-600/20">
          <p className="text-amber-400 text-sm font-bold">Best Trade</p>
          <p className="text-emerald-400 text-xl font-bold font-mono">
            +{stats.bestTrade.toFixed(0)} AC
          </p>
        </div>

        <div className="bg-stone-700 p-4 rounded border border-amber-600/20">
          <p className="text-amber-400 text-sm font-bold">Worst Trade</p>
          <p className="text-red-400 text-xl font-bold font-mono">
            {stats.worstTrade.toFixed(0)} AC
          </p>
        </div>

        <div className="bg-stone-700 p-4 rounded border border-amber-600/20">
          <p className="text-amber-400 text-sm font-bold">Avg Hold Time</p>
          <p className="text-amber-100 text-xl font-bold font-mono">
            {formatHoldTime(stats.averageHoldTime)}
          </p>
        </div>
      </div>

      {/* Trader Rank */}
      <div className="bg-gradient-to-r from-stone-700 to-stone-600 p-4 rounded-lg border border-amber-600/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <RankIcon className={`w-6 h-6 ${rankInfo.color}`} />
            <div>
              <p className="text-amber-400 text-sm font-bold">Trader Rank</p>
              <p className={`text-lg font-bold ${rankInfo.color}`}>{rankInfo.rank}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-amber-400 text-sm">Performance</p>
            <div className="flex items-center space-x-2">
              {stats.totalPnL >= 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={`font-bold ${
                stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {stats.totalPnL >= 0 ? 'Profitable' : 'Needs Improvement'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};