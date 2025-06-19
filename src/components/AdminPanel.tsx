import React, { useState } from 'react';
import { Settings, TrendingUp, TrendingDown, Zap, Crown } from 'lucide-react';
import { CoinData } from '../types';

interface AdminPanelProps {
  coins: CoinData[];
  onPriceUpdate: (coinId: string, newPrice: number, change: number) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ coins, onPriceUpdate }) => {
  const [selectedCoin, setSelectedCoin] = useState(coins[0]?.id || '');
  const [priceChange, setPriceChange] = useState('');
  const [changeType, setChangeType] = useState<'percentage' | 'absolute'>('percentage');

  const handlePriceUpdate = (direction: 'up' | 'down') => {
    const coin = coins.find(c => c.id === selectedCoin);
    if (!coin || !priceChange) return;

    const changeValue = parseFloat(priceChange);
    if (isNaN(changeValue)) return;

    let newPrice: number;
    let actualChange: number;

    if (changeType === 'percentage') {
      const multiplier = direction === 'up' ? (1 + changeValue / 100) : (1 - changeValue / 100);
      newPrice = coin.price * multiplier;
      actualChange = ((newPrice - coin.price) / coin.price) * 100;
    } else {
      newPrice = direction === 'up' ? coin.price + changeValue : coin.price - changeValue;
      actualChange = ((newPrice - coin.price) / coin.price) * 100;
    }

    newPrice = Math.max(1, Math.round(newPrice));
    
    onPriceUpdate(selectedCoin, newPrice, actualChange);
    setPriceChange('');
  };

  const presetChanges = [
    { label: '5%', value: 5 },
    { label: '10%', value: 10 },
    { label: '25%', value: 25 },
    { label: '50%', value: 50 }
  ];

  return (
    <div className="bg-stone-800 rounded-lg border-2 border-amber-600/50 p-4 shadow-lg">
      <div className="flex items-center space-x-2 mb-4">
        <Crown className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-bold text-amber-100 font-mono">Admin Control Panel</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-amber-300 mb-2">
            Select Coin
          </label>
          <select
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className="w-full px-3 py-2 bg-stone-700 border-2 border-amber-600/30 rounded-lg text-amber-100 font-mono focus:ring-2 focus:ring-amber-500"
          >
            {coins.map((coin) => (
              <option key={coin.id} value={coin.id}>
                {coin.symbol} - {coin.price.toLocaleString()} AC
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-amber-300 mb-2">
            Change Type
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => setChangeType('percentage')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-200 border-2 ${
                changeType === 'percentage'
                  ? 'bg-amber-600 text-white border-amber-500'
                  : 'bg-stone-700 text-amber-300 hover:bg-stone-600 border-amber-600/30'
              }`}
            >
              Percentage
            </button>
            <button
              onClick={() => setChangeType('absolute')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-200 border-2 ${
                changeType === 'absolute'
                  ? 'bg-amber-600 text-white border-amber-500'
                  : 'bg-stone-700 text-amber-300 hover:bg-stone-600 border-amber-600/30'
              }`}
            >
              Absolute
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-amber-300 mb-2">
            Price Change {changeType === 'percentage' ? '(%)' : '(AC)'}
          </label>
          <input
            type="number"
            value={priceChange}
            onChange={(e) => setPriceChange(e.target.value)}
            step={changeType === 'percentage' ? '1' : '1'}
            className="w-full px-3 py-2 bg-stone-700 border-2 border-amber-600/30 rounded-lg text-amber-100 font-mono focus:ring-2 focus:ring-amber-500"
            placeholder={changeType === 'percentage' ? '10' : '100'}
          />
        </div>

        {changeType === 'percentage' && (
          <div>
            <label className="block text-sm font-bold text-amber-300 mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-4 gap-2">
              {presetChanges.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setPriceChange(preset.value.toString())}
                  className="py-2 px-3 bg-stone-700 hover:bg-stone-600 text-amber-100 text-sm rounded-lg transition-all duration-200 border border-amber-600/30 font-bold"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={() => handlePriceUpdate('up')}
            disabled={!priceChange}
            className="flex-1 flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-600 text-white py-3 rounded-lg font-bold transition-all duration-200 disabled:cursor-not-allowed border-2 border-emerald-500 disabled:border-stone-500 shadow-lg"
          >
            <TrendingUp className="w-4 h-4" />
            <span>PUMP</span>
          </button>
          <button
            onClick={() => handlePriceUpdate('down')}
            disabled={!priceChange}
            className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-stone-600 text-white py-3 rounded-lg font-bold transition-all duration-200 disabled:cursor-not-allowed border-2 border-red-500 disabled:border-stone-500 shadow-lg"
          >
            <TrendingDown className="w-4 h-4" />
            <span>DUMP</span>
          </button>
        </div>

        <div className="bg-stone-700 p-3 rounded-lg border border-amber-600/30">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-amber-100">Market Control</span>
          </div>
          <p className="text-xs text-amber-400">
            Control Ardentia coin prices for your Minecraft community. 
            Changes will be reflected immediately across all player interfaces.
          </p>
        </div>
      </div>
    </div>
  );
};