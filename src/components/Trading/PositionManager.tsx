import React, { useState, useEffect } from 'react';
import { Position } from '../../types';
import { positionService } from '../../services/positionService';
import { authService } from '../../services/authService';

interface PositionManagerProps {
  currentPrices: { [symbol: string]: number };
}

export const PositionManager: React.FC<PositionManagerProps> = ({ currentPrices }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = positionService.onPositionsChange(user.id, (updatedPositions) => {
      setPositions(updatedPositions);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Update positions with current prices
  useEffect(() => {
    positions.forEach(position => {
      const currentPrice = currentPrices[position.symbol];
      if (currentPrice && currentPrice !== position.currentPrice) {
        positionService.updatePosition(position.id, currentPrice);
      }
    });
  }, [currentPrices, positions]);

  const handleClosePosition = async (positionId: string, symbol: string) => {
    try {
      const currentPrice = currentPrices[symbol];
      if (!currentPrice) {
        alert('Unable to get current price');
        return;
      }
      
      await positionService.closePosition(positionId, currentPrice, 'Manual Close');
    } catch (error) {
      console.error('Error closing position:', error);
      alert('Failed to close position');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Open Positions</h3>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Open Positions</h3>
        <div className="text-sm text-gray-600">
          {positions.length} position{positions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {positions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>No open positions</p>
          <p className="text-sm">Start trading to see your positions here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {positions.map((position) => {
            const pnlColor = position.pnl >= 0 ? 'text-green-600' : 'text-red-600';
            const pnlBgColor = position.pnl >= 0 ? 'bg-green-50' : 'bg-red-50';
            const typeColor = position.type === 'long' ? 'text-green-600' : 'text-red-600';
            const typeBgColor = position.type === 'long' ? 'bg-green-100' : 'bg-red-100';

            return (
              <div key={position.id} className={`border rounded-lg p-4 ${pnlBgColor} border-gray-200`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-lg">{position.symbol}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeBgColor} ${typeColor}`}>
                        {position.type.toUpperCase()}
                      </span>
                      {position.leverage > 1 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                          {position.leverage}x
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleClosePosition(position.id, position.symbol)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Amount</p>
                    <p className="font-medium">{formatCurrency(position.amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Entry Price</p>
                    <p className="font-medium">{formatCurrency(position.entryPrice)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Current Price</p>
                    <p className="font-medium">{formatCurrency(position.currentPrice)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Margin</p>
                    <p className="font-medium">{formatCurrency(position.margin)}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-600 text-sm">Unrealized P&L</p>
                      <p className={`font-bold text-lg ${pnlColor}`}>
                        {formatCurrency(position.pnl)} ({formatPercentage(position.pnlPercentage)})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600 text-sm">Position Size</p>
                      <p className="font-medium">{formatCurrency(position.amount * position.leverage)}</p>
                    </div>
                  </div>
                </div>

                {(position.stopLoss || position.takeProfit) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex space-x-4 text-sm">
                      {position.stopLoss && (
                        <div>
                          <p className="text-gray-600">Stop Loss</p>
                          <p className="font-medium text-red-600">{formatCurrency(position.stopLoss)}</p>
                        </div>
                      )}
                      {position.takeProfit && (
                        <div>
                          <p className="text-gray-600">Take Profit</p>
                          <p className="font-medium text-green-600">{formatCurrency(position.takeProfit)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-2 text-xs text-gray-500">
                  Opened: {new Date(position.timestamp).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};