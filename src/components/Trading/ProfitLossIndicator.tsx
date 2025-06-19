import React from 'react';

interface ProfitLossIndicatorProps {
  pnl: number;
  pnlPercentage: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const ProfitLossIndicator: React.FC<ProfitLossIndicatorProps> = ({
  pnl,
  pnlPercentage,
  size = 'md',
  showIcon = true
}) => {
  const isProfit = pnl >= 0;
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  const formatPercentage = (percentage: number) => {
    return `${Math.abs(percentage).toFixed(2)}%`;
  };

  return (
    <div className={`flex items-center space-x-1 ${sizeClasses[size]}`}>
      {showIcon && (
        <span className={`${isProfit ? 'text-green-600' : 'text-red-600'}`}>
          {isProfit ? '▲' : '▼'}
        </span>
      )}
      <span className={`font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
        {isProfit ? '+' : '-'}{formatCurrency(pnl)}
      </span>
      <span className={`${isProfit ? 'text-green-600' : 'text-red-600'}`}>
        ({isProfit ? '+' : '-'}{formatPercentage(pnlPercentage)})
      </span>
    </div>
  );
};