import React, { useEffect, useRef } from 'react';
import { ChartData } from '../../types';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface CandlestickChartProps {
  data: ChartData[];
  currentPrice: number;
  timeframe: '1h' | '4h' | '1d' | '1w';
  onTimeframeChange: (timeframe: '1h' | '4h' | '1d' | '1w') => void;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({ 
  data, 
  currentPrice, 
  timeframe, 
  onTimeframeChange 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with proper DPI scaling
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (data.length < 2) return;

    // Calculate price range with padding
    const prices = data.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const paddedMin = minPrice - priceRange * 0.1;
    const paddedMax = maxPrice + priceRange * 0.1;
    const paddedRange = paddedMax - paddedMin;

    const padding = { left: 60, right: 20, top: 20, bottom: 40 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Draw grid
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 4]);
    
    // Horizontal grid lines
    for (let i = 0; i <= 8; i++) {
      const y = padding.top + (chartHeight / 8) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(rect.width - padding.right, y);
      ctx.stroke();
    }

    // Vertical grid lines
    const visibleCandles = Math.min(data.length, 50);
    for (let i = 0; i <= 10; i++) {
      const x = padding.left + (chartWidth / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, rect.height - padding.bottom);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw candlesticks
    const candleWidth = Math.max(2, (chartWidth / visibleCandles) * 0.8);
    const candleSpacing = chartWidth / visibleCandles;

    data.slice(-visibleCandles).forEach((candle, index) => {
      const x = padding.left + (candleSpacing * index) + (candleSpacing * 0.5);
      
      const openY = padding.top + (1 - (candle.open - paddedMin) / paddedRange) * chartHeight;
      const closeY = padding.top + (1 - (candle.close - paddedMin) / paddedRange) * chartHeight;
      const highY = padding.top + (1 - (candle.high - paddedMin) / paddedRange) * chartHeight;
      const lowY = padding.top + (1 - (candle.low - paddedMin) / paddedRange) * chartHeight;

      const isGreen = candle.close > candle.open;
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(Math.abs(closeY - openY), 1);

      // Draw wick
      ctx.strokeStyle = isGreen ? '#10b981' : '#ef4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw body
      ctx.fillStyle = isGreen ? '#10b981' : '#ef4444';
      ctx.strokeStyle = isGreen ? '#059669' : '#dc2626';
      ctx.lineWidth = 1;
      
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    });

    // Draw price labels
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= 8; i++) {
      const price = paddedMax - (paddedRange / 8) * i;
      const y = padding.top + (chartHeight / 8) * i;
      if (price > 0) {
        ctx.fillText(`${Math.round(price).toLocaleString()}`, padding.left - 5, y);
      }
    }

    // Draw current price line
    const currentPriceY = padding.top + (1 - (currentPrice - paddedMin) / paddedRange) * chartHeight;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding.left, currentPriceY);
    ctx.lineTo(rect.width - padding.right, currentPriceY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Current price label
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(rect.width - padding.right - 80, currentPriceY - 10, 75, 20);
    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(currentPrice.toLocaleString(), rect.width - padding.right - 42, currentPriceY + 3);

  }, [data, currentPrice]);

  const lastCandle = data[data.length - 1];
  const prevCandle = data[data.length - 2];
  const priceChange = lastCandle && prevCandle ? lastCandle.close - prevCandle.close : 0;
  const priceChangePercent = prevCandle ? (priceChange / prevCandle.close) * 100 : 0;

  return (
    <div className="bg-stone-800 rounded-lg border-2 border-amber-600/30 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-bold text-amber-100 font-mono flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-amber-400" />
            AGC/AC Chart
          </h3>
          
          <div className="flex items-center space-x-2">
            {priceChange >= 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            <span className={`font-bold font-mono ${
              priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-1">
            {(['1h', '4h', '1d', '1w'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
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

      <canvas
        ref={canvasRef}
        className="w-full h-96 rounded border border-amber-600/20 cursor-crosshair"
        style={{ background: '#1c1917' }}
      />

      <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
        <div className="bg-stone-700 p-3 rounded border border-amber-600/20">
          <p className="text-amber-400 font-bold">Open</p>
          <p className="text-amber-100 font-mono">{lastCandle?.open.toLocaleString()}</p>
        </div>
        <div className="bg-stone-700 p-3 rounded border border-amber-600/20">
          <p className="text-amber-400 font-bold">High</p>
          <p className="text-emerald-400 font-mono">{lastCandle?.high.toLocaleString()}</p>
        </div>
        <div className="bg-stone-700 p-3 rounded border border-amber-600/20">
          <p className="text-amber-400 font-bold">Low</p>
          <p className="text-red-400 font-mono">{lastCandle?.low.toLocaleString()}</p>
        </div>
        <div className="bg-stone-700 p-3 rounded border border-amber-600/20">
          <p className="text-amber-400 font-bold">Volume</p>
          <p className="text-amber-100 font-mono">{lastCandle?.volume.toFixed(0)}</p>
        </div>
      </div>
    </div>
  );
};