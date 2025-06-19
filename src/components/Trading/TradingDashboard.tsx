import React, { useState, useEffect } from 'react';
import { CoinData, User, Position } from '../../types';
import { AdvancedTradePanel } from './AdvancedTradePanel';
import { PositionManager } from './PositionManager';
import { ProfitLossIndicator } from './ProfitLossIndicator';
import { positionService } from '../../services/positionService';

interface TradingDashboardProps {
  coins: CoinData[];
  user: User | null;
}

export const TradingDashboard: React.FC<TradingDashboardProps> = ({ coins, user }) => {
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [currentPrices, setCurrentPrices] = useState<{ [symbol: string]: number }>({});
  const [totalPnL, setTotalPnL] = useState(0);
  const [totalPnLPercentage, setTotalPnLPercentage] = useState(0);

  // Update current prices from coins data
  useEffect(() => {
    const prices: { [symbol: string]: number } = {};
    coins.forEach(coin => {
      prices[coin.symbol.toUpperCase()] = coin.current_price;
    });
    setCurrentPrices(prices);
  }, [coins]);

  // Listen to position changes
  useEffect(() => {
    if (!user) return;

    const unsubscribe = positionService.onPositionsChange(user.id, (updatedPositions) => {
      setPositions(updatedPositions);
      
      // Calculate total PnL
      const totalPnL = updatedPositions.reduce((sum, pos) => sum + pos.pnl, 0);
      const totalMargin = updatedPositions.reduce((sum, pos) => sum + pos.margin, 0);
      const totalPnLPercentage = totalMargin > 0 ? (totalPnL / totalMargin) * 100 : 0;
      
      setTotalPnL(totalPnL);
      setTotalPnLPercentage(totalPnLPercentage);
    });

    return () => unsubscribe();
  }, [user]);

  const handleTradeComplete = () => {
    // Refresh positions after trade
    if (user) {
      positionService.getUserPositions(user.id).then(setPositions);
    }
  };

  return (
    <div className="space-y-6">
      {/* Trading Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Account Balance</h3>
          <p className="text-2xl font-bold text-gray-900">
            ${user?.balance.toLocaleString() || '0'}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Open Positions</h3>
          <p className="text-2xl font-bold text-gray-900">{positions.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total P&L</h3>
          <ProfitLossIndicator 
            pnl={totalPnL} 
            pnlPercentage={totalPnLPercentage} 
            size="lg"
            showIcon={false}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Margin Used</h3>
          <p className="text-2xl font-bold text-gray-900">
            ${positions.reduce((sum, pos) => sum + pos.margin, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Coin Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Select Trading Pair</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {coins.slice(0, 12).map((coin) => (
            <button
              key={coin.id}
              onClick={() => setSelectedCoin(coin)}
              className={`p-3 rounded-lg border transition-all ${
                selectedCoin?.id === coin.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <img src={coin.image} alt={coin.name} className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-medium text-sm">{coin.symbol.toUpperCase()}</p>
                  <p className="text-xs text-gray-600">${coin.current_price.toFixed(4)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdvancedTradePanel
          selectedCoin={selectedCoin}
          user={user}
          onTradeComplete={handleTradeComplete}
        />
        
        <PositionManager currentPrices={currentPrices} />
      </div>
    </div>
  );
};