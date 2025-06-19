import React, { useState, useEffect } from 'react';
import { Settings, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { tradingService } from '../../services/tradingService';
import { TradingSettings as TradingSettingsType } from '../../types';

interface TradingSettingsProps {
  onPriceUpdate: (change: number, type: 'percentage' | 'absolute') => void;
}

export const TradingSettings: React.FC<TradingSettingsProps> = ({ onPriceUpdate }) => {
  const [settings, setSettings] = useState<TradingSettingsType | null>(null);
  const [priceChange, setPriceChange] = useState('');
  const [changeType, setChangeType] = useState<'percentage' | 'absolute'>('percentage');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await tradingService.getTradingSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setLoading(true);
    try {
      await tradingService.updateTradingSettings(settings);
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceUpdate = (direction: 'up' | 'down') => {
    const changeValue = parseFloat(priceChange);
    if (isNaN(changeValue) || changeValue <= 0) return;

    const finalChange = direction === 'up' ? changeValue : -changeValue;
    onPriceUpdate(finalChange, changeType);
    setPriceChange('');
  };

  if (!settings) {
    return <div className="text-amber-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Price Control */}
      <div className="bg-stone-800 rounded-lg border-2 border-amber-600/30 p-6 shadow-lg">
        <h3 className="text-xl font-bold text-amber-100 mb-4 font-mono flex items-center">
          <Zap className="w-5 h-5 mr-2 text-amber-400" />
          Price Control
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-amber-300 mb-2">
              Change Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="percentage"
                  checked={changeType === 'percentage'}
                  onChange={(e) => setChangeType(e.target.value as 'percentage')}
                  className="text-amber-500"
                />
                <span className="text-amber-100">Percentage (%)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="absolute"
                  checked={changeType === 'absolute'}
                  onChange={(e) => setChangeType(e.target.value as 'absolute')}
                  className="text-amber-500"
                />
                <span className="text-amber-100">Absolute (AC)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-amber-300 mb-2">
              Change Amount
            </label>
            <input
              type="number"
              value={priceChange}
              onChange={(e) => setPriceChange(e.target.value)}
              step={changeType === 'percentage' ? '0.1' : '1'}
              className="w-full px-3 py-2 bg-stone-700 border-2 border-amber-600/30 rounded-lg text-amber-100 font-mono focus:ring-2 focus:ring-amber-500"
              placeholder={changeType === 'percentage' ? '5.0' : '100'}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="block text-sm font-bold text-amber-300 mb-2">
              Actions
            </label>
            <button
              onClick={() => handlePriceUpdate('up')}
              disabled={!priceChange}
              className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-600 text-white py-2 rounded font-bold transition-all duration-200 disabled:cursor-not-allowed"
            >
              <TrendingUp className="w-4 h-4" />
              <span>PUMP</span>
            </button>
            <button
              onClick={() => handlePriceUpdate('down')}
              disabled={!priceChange}
              className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-stone-600 text-white py-2 rounded font-bold transition-all duration-200 disabled:cursor-not-allowed"
            >
              <TrendingDown className="w-4 h-4" />
              <span>DUMP</span>
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {[1, 2, 5, 10].map((preset) => (
            <button
              key={preset}
              onClick={() => setPriceChange(preset.toString())}
              className="py-2 px-3 bg-stone-700 hover:bg-stone-600 text-amber-100 text-sm rounded transition-all duration-200 border border-amber-600/30 font-bold"
            >
              {changeType === 'percentage' ? `${preset}%` : `${preset} AC`}
            </button>
          ))}
        </div>
      </div>

      {/* Trading Settings */}
      <div className="bg-stone-800 rounded-lg border-2 border-amber-600/30 p-6 shadow-lg">
        <h3 className="text-xl font-bold text-amber-100 mb-4 font-mono flex items-center">
          <Settings className="w-5 h-5 mr-2 text-amber-400" />
          Trading Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-amber-300 mb-2">
                Spread (%)
              </label>
              <input
                type="number"
                value={settings.spread}
                onChange={(e) => setSettings({...settings, spread: parseFloat(e.target.value)})}
                step="0.01"
                className="w-full px-3 py-2 bg-stone-700 border-2 border-amber-600/30 rounded-lg text-amber-100 font-mono focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-xs text-amber-500 mt-1">Protects exchange from losses</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-300 mb-2">
                Max Leverage
              </label>
              <input
                type="number"
                value={settings.maxLeverage}
                onChange={(e) => setSettings({...settings, maxLeverage: parseInt(e.target.value)})}
                min="1"
                max="100"
                className="w-full px-3 py-2 bg-stone-700 border-2 border-amber-600/30 rounded-lg text-amber-100 font-mono focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-300 mb-2">
                Min Trade Amount (AC)
              </label>
              <input
                type="number"
                value={settings.minTradeAmount}
                onChange={(e) => setSettings({...settings, minTradeAmount: parseInt(e.target.value)})}
                className="w-full px-3 py-2 bg-stone-700 border-2 border-amber-600/30 rounded-lg text-amber-100 font-mono focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-amber-300 mb-2">
                Trading Fee (%)
              </label>
              <input
                type="number"
                value={settings.tradingFee}
                onChange={(e) => setSettings({...settings, tradingFee: parseFloat(e.target.value)})}
                step="0.01"
                className="w-full px-3 py-2 bg-stone-700 border-2 border-amber-600/30 rounded-lg text-amber-100 font-mono focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-300 mb-2">
                Price Update Interval (ms)
              </label>
              <input
                type="number"
                value={settings.priceUpdateInterval}
                onChange={(e) => setSettings({...settings, priceUpdateInterval: parseInt(e.target.value)})}
                step="1000"
                className="w-full px-3 py-2 bg-stone-700 border-2 border-amber-600/30 rounded-lg text-amber-100 font-mono focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-300 mb-2">
                Base Volatility (%)
              </label>
              <input
                type="number"
                value={settings.volatilitySettings.baseVolatility}
                onChange={(e) => setSettings({
                  ...settings, 
                  volatilitySettings: {
                    ...settings.volatilitySettings,
                    baseVolatility: parseFloat(e.target.value)
                  }
                })}
                step="0.01"
                className="w-full px-3 py-2 bg-stone-700 border-2 border-amber-600/30 rounded-lg text-amber-100 font-mono focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        <button
          onClick={saveSettings}
          disabled={loading}
          className="mt-6 w-full bg-amber-600 hover:bg-amber-700 disabled:bg-stone-600 text-white py-3 rounded-lg font-bold transition-all duration-200 disabled:cursor-not-allowed border-2 border-amber-500 disabled:border-stone-500 shadow-lg"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};