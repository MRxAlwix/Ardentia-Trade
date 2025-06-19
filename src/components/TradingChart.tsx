import React, { useEffect, useRef } from 'react';
import { ChartData } from '../types';
import { BarChart3 } from 'lucide-react';

interface TradingChartProps {
  data: ChartData[];
  coinSymbol: string;
  currentPrice: number;
}

export const TradingChart: React.FC<TradingChartProps> = ({ data, coinSymbol, currentPrice }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas with Minecraft-style background
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (data.length < 2) return;

    // Calculate price range
    const prices = data.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;

    // Draw grid lines (Minecraft-style)
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 2]);
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(rect.width - padding, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
      const x = padding + (chartWidth / 6) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, rect.height - padding);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw candlesticks (Minecraft block style)
    const candleWidth = Math.max(4, chartWidth / data.length * 0.7);
    
    data.forEach((candle, index) => {
      const x = padding + (chartWidth / data.length) * index + (chartWidth / data.length) * 0.5 - candleWidth / 2;
      
      const openY = padding + (1 - (candle.open - minPrice) / priceRange) * chartHeight;
      const closeY = padding + (1 - (candle.close - minPrice) / priceRange) * chartHeight;
      const highY = padding + (1 - (candle.high - minPrice) / priceRange) * chartHeight;
      const lowY = padding + (1 - (candle.low - minPrice) / priceRange) * chartHeight;

      const isGreen = candle.close > candle.open;
      
      // Draw wick
      ctx.strokeStyle = isGreen ? '#10b981' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();

      // Draw body (block style)
      ctx.fillStyle = isGreen ? '#10b981' : '#ef4444';
      ctx.strokeStyle = isGreen ? '#059669' : '#dc2626';
      ctx.lineWidth = 1;
      
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(Math.abs(closeY - openY), 2);
      
      ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
      ctx.strokeRect(x, bodyTop, candleWidth, bodyHeight);
    });

    // Draw price labels
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const price = maxPrice - (priceRange / 5) * i;
      const y = padding + (chartHeight / 5) * i;
      ctx.fillText(`${price.toLocaleString()} AC`, rect.width - padding - 5, y + 4);
    }

  }, [data, currentPrice]);

  return (
    <div className="bg-stone-800 rounded-lg border-2 border-amber-600/30 p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-amber-100 font-mono flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-amber-400" />
          {coinSymbol} Price Chart
        </h3>
        <div className="text-right bg-stone-700 px-3 py-2 rounded border border-amber-600/30">
          <p className="text-sm text-amber-300">Current Price</p>
          <p className="text-xl font-bold text-emerald-400 font-mono">{currentPrice.toLocaleString()} AC</p>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-80 rounded border border-amber-600/20"
        style={{ background: '#1c1917' }}
      />
    </div>
  );
};