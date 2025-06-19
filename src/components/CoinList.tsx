import React from 'react';
import { TrendingUp, TrendingDown, Gem, Star, Crown, Zap } from 'lucide-react';
import { CoinData } from '../types';

interface CoinListProps {
  coins: CoinData[];
  selectedCoin: string;
  onCoinSelect: (coinId: string) => void;
}

export const CoinList: React.FC<CoinListProps> = ({ coins, selectedCoin, onCoinSelect }) => {
  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return <Gem className="w-4 h-4 text-gray-400" />;
      case 'rare':
        return <Star className="w-4 h-4 text-blue-400" />;
      case 'epic':
        return <Crown className="w-4 h-4 text-purple-400" />;
      case 'legendary':
        return <Zap className="w-4 h-4 text-amber-400" />;
      default:
        return <Gem className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-600 to-gray-700';
      case 'rare':
        return 'from-blue-600 to-blue-700';
      case 'epic':
        return 'from-purple-600 to-purple-700';
      case 'legendary':
        return 'from-amber-600 to-orange-700';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  return (
    <div className="bg-stone-800 rounded-lg border-2 border-amber-600/30 p-4 shadow-lg">
      <h3 className="text-lg font-bold text-amber-100 mb-4 font-mono flex items-center">
        <Gem className="w-5 h-5 mr-2 text-amber-400" />
        Ardentia Markets
      </h3>
      <div className="space-y-2">
        {coins.map((coin) => (
          <div
            key={coin.id}
            onClick={() => onCoinSelect(coin.id)}
            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
              selectedCoin === coin.id
                ? 'bg-amber-600/20 border-amber-500/50 shadow-md'
                : 'bg-stone-700 hover:bg-stone-600 border-transparent hover:border-amber-600/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${getRarityColor(coin.rarity)} rounded-lg flex items-center justify-center shadow-md`}>
                  {getRarityIcon(coin.rarity)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-amber-100 font-mono">{coin.symbol}</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      coin.rarity === 'legendary' ? 'bg-amber-600/20 text-amber-300' :
                      coin.rarity === 'epic' ? 'bg-purple-600/20 text-purple-300' :
                      coin.rarity === 'rare' ? 'bg-blue-600/20 text-blue-300' :
                      'bg-gray-600/20 text-gray-300'
                    }`}>
                      {coin.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-amber-400">{coin.name}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-amber-100 font-mono">
                  {coin.price.toLocaleString()} AC
                </p>
                <div className={`flex items-center space-x-1 text-xs ${
                  coin.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {coin.change24h >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{Math.abs(coin.change24h).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};