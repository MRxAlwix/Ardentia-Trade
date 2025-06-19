import { useState, useEffect, useCallback } from 'react';
import { CoinData, ChartData, Order, Portfolio, User } from '../types';

// Ardentia-specific coins for Minecraft community
const initialCoins: CoinData[] = [
  {
    id: 'ardentia-gold',
    symbol: 'AGC',
    name: 'Ardentia Gold Coin',
    price: 1000,
    change24h: 2.5,
    volume: 50000,
    marketCap: 1000000,
    icon: '🪙',
    rarity: 'legendary'
  },
  {
    id: 'ardentia-diamond',
    symbol: 'ADC',
    name: 'Ardentia Diamond Coin',
    price: 2500,
    change24h: -1.2,
    volume: 30000,
    marketCap: 750000,
    icon: '💎',
    rarity: 'epic'
  },
  {
    id: 'ardentia-emerald',
    symbol: 'AEC',
    name: 'Ardentia Emerald Coin',
    price: 1500,
    change24h: 5.8,
    volume: 25000,
    marketCap: 500000,
    icon: '💚',
    rarity: 'rare'
  },
  {
    id: 'ardentia-iron',
    symbol: 'AIC',
    name: 'Ardentia Iron Coin',
    price: 500,
    change24h: 3.4,
    volume: 75000,
    marketCap: 2000000,
    icon: '⚙️',
    rarity: 'common'
  },
  {
    id: 'ardentia-redstone',
    symbol: 'ARC',
    name: 'Ardentia Redstone Coin',
    price: 750,
    change24h: -2.1,
    volume: 40000,
    marketCap: 600000,
    icon: '🔴',
    rarity: 'rare'
  }
];

const generateChartData = (basePrice: number): ChartData[] => {
  const data: ChartData[] = [];
  let price = basePrice;
  
  for (let i = 0; i < 50; i++) {
    const change = (Math.random() - 0.5) * price * 0.03; // Smaller changes for stability
    const open = price;
    price += change;
    const close = Math.max(1, Math.round(price)); // Ensure minimum price of 1 AC
    const high = Math.max(open, close) + Math.random() * price * 0.01;
    const low = Math.max(1, Math.min(open, close) - Math.random() * price * 0.01);
    
    data.push({
      timestamp: Date.now() - (49 - i) * 3600000,
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close,
      volume: Math.random() * 10000
    });
  }
  
  return data;
};

export const useTradingData = () => {
  const [coins, setCoins] = useState<CoinData[]>(initialCoins);
  const [chartData, setChartData] = useState<{ [key: string]: ChartData[] }>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio>({
    totalValue: 50000,
    totalPnL: 0,
    totalPnLPercent: 0,
    holdings: {}
  });

  const user: User = {
    id: '1',
    username: 'ArdenPlayer',
    balance: 50000,
    role: 'admin',
    rank: 'Server Owner'
  };

  // Initialize chart data
  useEffect(() => {
    const data: { [key: string]: ChartData[] } = {};
    coins.forEach(coin => {
      data[coin.id] = generateChartData(coin.price);
    });
    setChartData(data);
  }, []);

  // Simulate real-time price updates (slower for Minecraft theme)
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(prevCoins => 
        prevCoins.map(coin => {
          const change = (Math.random() - 0.5) * 0.01; // ±1% change
          const newPrice = Math.max(1, Math.round(coin.price * (1 + change)));
          const change24h = change * 100;
          
          return {
            ...coin,
            price: newPrice,
            change24h: coin.change24h + change24h * 0.1
          };
        })
      );
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const updateCoinPrice = useCallback((coinId: string, newPrice: number, changePercent: number) => {
    setCoins(prevCoins =>
      prevCoins.map(coin =>
        coin.id === coinId
          ? { ...coin, price: newPrice, change24h: changePercent }
          : coin
      )
    );

    // Update chart data
    setChartData(prevData => {
      const coinData = prevData[coinId] || [];
      const lastCandle = coinData[coinData.length - 1];
      
      if (lastCandle) {
        const newCandle: ChartData = {
          timestamp: Date.now(),
          open: lastCandle.close,
          high: Math.max(lastCandle.close, newPrice),
          low: Math.min(lastCandle.close, newPrice),
          close: newPrice,
          volume: Math.random() * 10000
        };

        return {
          ...prevData,
          [coinId]: [...coinData.slice(-49), newCandle]
        };
      }

      return prevData;
    });
  }, []);

  const placeOrder = useCallback((orderData: Omit<Order, 'id' | 'timestamp' | 'status'>) => {
    const newOrder: Order = {
      ...orderData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      status: 'completed'
    };

    setOrders(prevOrders => [newOrder, ...prevOrders]);

    // Update portfolio
    setPortfolio(prevPortfolio => {
      const holdings = { ...prevPortfolio.holdings };
      const coin = orderData.coin;

      if (!holdings[coin]) {
        holdings[coin] = {
          amount: 0,
          value: 0,
          averagePrice: 0,
          pnl: 0,
          pnlPercent: 0
        };
      }

      if (orderData.type === 'buy') {
        const newAmount = holdings[coin].amount + orderData.amount;
        const newAveragePrice = ((holdings[coin].amount * holdings[coin].averagePrice) + 
                               (orderData.amount * orderData.price)) / newAmount;
        
        holdings[coin] = {
          ...holdings[coin],
          amount: newAmount,
          averagePrice: newAveragePrice
        };
      } else {
        holdings[coin] = {
          ...holdings[coin],
          amount: Math.max(0, holdings[coin].amount - orderData.amount)
        };
      }

      // Update current values and P&L
      const currentCoin = coins.find(c => c.symbol === coin);
      if (currentCoin && holdings[coin].amount > 0) {
        holdings[coin].value = Math.round(holdings[coin].amount * currentCoin.price);
        holdings[coin].pnl = holdings[coin].value - Math.round(holdings[coin].amount * holdings[coin].averagePrice);
        holdings[coin].pnlPercent = (holdings[coin].pnl / (holdings[coin].amount * holdings[coin].averagePrice)) * 100;
      }

      const totalValue = Object.values(holdings).reduce((sum, holding) => sum + holding.value, 0);
      const totalPnL = Object.values(holdings).reduce((sum, holding) => sum + holding.pnl, 0);

      return {
        ...prevPortfolio,
        holdings,
        totalValue,
        totalPnL,
        totalPnLPercent: totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0
      };
    });
  }, [coins]);

  return {
    coins,
    chartData,
    orders,
    portfolio,
    user,
    updateCoinPrice,
    placeOrder
  };
};