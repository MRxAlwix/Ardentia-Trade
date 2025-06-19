import { useState, useEffect, useCallback } from 'react';
import { CoinData, ChartData, Order, Portfolio, User } from '../types';

// Ardentia-specific coins for Minecraft community
const initialCoins: CoinData[] = [
  {
    id: 'ardentia-gold',
    symbol: 'AGC',
    name: 'Ardentia Gold Coin',
    current_price: 1000,
    price_change_24h: 25,
    price_change_percentage_24h: 2.5,
    volume_24h: 50000,
    market_cap: 1000000,
    high_24h: 1050,
    low_24h: 950,
    image: '🪙',
    rarity: 'legendary'
  },
  {
    id: 'ardentia-diamond',
    symbol: 'ADC',
    name: 'Ardentia Diamond Coin',
    current_price: 2500,
    price_change_24h: -30,
    price_change_percentage_24h: -1.2,
    volume_24h: 30000,
    market_cap: 750000,
    high_24h: 2600,
    low_24h: 2400,
    image: '💎',
    rarity: 'epic'
  },
  {
    id: 'ardentia-emerald',
    symbol: 'AEC',
    name: 'Ardentia Emerald Coin',
    current_price: 1500,
    price_change_24h: 87,
    price_change_percentage_24h: 5.8,
    volume_24h: 25000,
    market_cap: 500000,
    high_24h: 1600,
    low_24h: 1400,
    image: '💚',
    rarity: 'rare'
  },
  {
    id: 'ardentia-iron',
    symbol: 'AIC',
    name: 'Ardentia Iron Coin',
    current_price: 500,
    price_change_24h: 17,
    price_change_percentage_24h: 3.4,
    volume_24h: 75000,
    market_cap: 2000000,
    high_24h: 520,
    low_24h: 480,
    image: '⚙️',
    rarity: 'common'
  },
  {
    id: 'ardentia-redstone',
    symbol: 'ARC',
    name: 'Ardentia Redstone Coin',
    current_price: 750,
    price_change_24h: -16,
    price_change_percentage_24h: -2.1,
    volume_24h: 40000,
    market_cap: 600000,
    high_24h: 780,
    low_24h: 720,
    image: '🔴',
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
    email: 'player@ardentia.com',
    balance: 50000,
    role: 'admin',
    rank: 'Server Owner',
    createdAt: Date.now() - 86400000,
    lastLogin: Date.now()
  };

  // Initialize chart data
  useEffect(() => {
    const data: { [key: string]: ChartData[] } = {};
    coins.forEach(coin => {
      data[coin.id] = generateChartData(coin.current_price);
    });
    setChartData(data);
  }, []);

  // Simulate real-time price updates (slower for Minecraft theme)
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(prevCoins => 
        prevCoins.map(coin => {
          const change = (Math.random() - 0.5) * 0.01; // ±1% change
          const newPrice = Math.max(1, Math.round(coin.current_price * (1 + change)));
          const priceChange24h = change * 100;
          
          return {
            ...coin,
            current_price: newPrice,
            price_change_24h: newPrice - coin.current_price,
            price_change_percentage_24h: coin.price_change_percentage_24h + priceChange24h * 0.1,
            high_24h: Math.max(coin.high_24h, newPrice),
            low_24h: Math.min(coin.low_24h, newPrice)
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
          ? { 
              ...coin, 
              current_price: newPrice, 
              price_change_percentage_24h: changePercent,
              price_change_24h: newPrice - coin.current_price,
              high_24h: Math.max(coin.high_24h, newPrice),
              low_24h: Math.min(coin.low_24h, newPrice)
            }
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
        holdings[coin].value = Math.round(holdings[coin].amount * currentCoin.current_price);
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