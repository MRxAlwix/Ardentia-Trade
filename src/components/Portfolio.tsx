import React from 'react';
import { TrendingUp, TrendingDown, Package, Gem } from 'lucide-react';
import { Portfolio as PortfolioType } from '../types';

interface PortfolioProps {
  portfolio: PortfolioType;
}

export const Portfolio: React.FC<PortfolioProps> = ({ portfolio }) => {
  return (
    <div className="bg-stone-800 rounded-lg border-2 border-amber-600/30 p-4 shadow-lg">
      <div className="flex items-center space-x-2 mb-4">
        <Package className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-bold text-amber-100 font-mono">Inventory</h3>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-4">
        <div className="bg-stone-700 p-3 rounded-lg border border-amber-600/30">
          <p className="text-sm text-amber-400 font-bold">Total Value</p>
          <p className="text-xl font-bold text-emerald-400 font-mono">
            {portfolio.totalValue.toLocaleString()} AC
          </p>
        </div>
        <div className="bg-stone-700 p-3 rounded-lg border border-amber-600/30">
          <p className="text-sm text-amber-400 font-bold">Profit/Loss</p>
          <div className={`flex items-center space-x-1 ${
            portfolio.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {portfolio.totalPnL >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <p className="text-xl font-bold font-mono">
              {Math.abs(portfolio.totalPnL).toLocaleString()} AC
            </p>
            <span className="text-sm font-bold">
              ({portfolio.totalPnLPercent >= 0 ? '+' : ''}{portfolio.totalPnLPercent.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-bold text-amber-300 flex items-center">
          <Gem className="w-4 h-4 mr-1" />
          Holdings
        </h4>
        {Object.keys(portfolio.holdings).length === 0 ? (
          <p className="text-amber-400 text-center py-4 text-sm">No coins in inventory</p>
        ) : (
          Object.entries(portfolio.holdings).map(([coin, holding]) => (
            <div key={coin} className="flex items-center justify-between bg-stone-700 p-3 rounded-lg border border-amber-600/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{coin}</span>
                </div>
                <div>
                  <p className="font-bold text-amber-100 font-mono">{coin}</p>
                  <p className="text-xs text-amber-400 font-mono">{holding.amount.toFixed(3)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-amber-100 font-mono">{holding.value.toLocaleString()} AC</p>
                <div className={`flex items-center space-x-1 text-xs ${
                  holding.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {holding.pnl >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span className="font-bold">{holding.pnlPercent >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};