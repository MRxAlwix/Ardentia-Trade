import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { Header } from './components/Header';
import { DepositPage } from './components/Member/DepositPage';
import { DepositManagement } from './components/Admin/DepositManagement';
import { TradingInterface } from './components/Trading/TradingInterface';
import { TradingSettings } from './components/Admin/TradingSettings';
import { authService } from './services/authService';
import { tradingService } from './services/tradingService';
import { User, ChartData } from './types';

type Page = 'trading' | 'deposit' | 'admin-deposits' | 'admin-settings';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentPage, setCurrentPage] = useState<Page>('trading');
  
  // Trading data
  const [currentPrice, setCurrentPrice] = useState(10000);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d' | '1w'>('1h');

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Initialize chart data
    generateInitialChartData();
    
    // Start price simulation with more realistic intervals
    const interval = setInterval(() => {
      updatePrice();
    }, 8000); // Update every 8 seconds

    return () => clearInterval(interval);
  }, [timeframe]);

  const generateInitialChartData = () => {
    const data = tradingService.generateChartData(10000, timeframe, 100);
    setChartData(data);
    
    // Set current price to the last candle's close price
    if (data.length > 0) {
      setCurrentPrice(data[data.length - 1].close);
    }
  };

  const updatePrice = () => {
    setCurrentPrice(prevPrice => {
      // More realistic price movement
      const volatility = 0.008; // 0.8% max change
      const trend = Math.sin(Date.now() / 100000) * 0.002; // Subtle trend
      const noise = (Math.random() - 0.5) * volatility;
      const change = trend + noise;
      
      const newPrice = Math.max(1000, Math.round(prevPrice * (1 + change)));
      
      // Update chart data
      setChartData(prevData => {
        if (prevData.length === 0) return prevData;
        
        const lastCandle = prevData[prevData.length - 1];
        const now = Date.now();
        
        // Check if we need a new candle based on timeframe
        const timeframes = {
          '1h': 3600000,
          '4h': 14400000,
          '1d': 86400000,
          '1w': 604800000
        };
        
        const shouldCreateNewCandle = now - lastCandle.timestamp > timeframes[timeframe];
        
        if (shouldCreateNewCandle) {
          // Create new candle
          const newCandle: ChartData = {
            timestamp: now,
            open: lastCandle.close,
            high: Math.max(lastCandle.close, newPrice),
            low: Math.min(lastCandle.close, newPrice),
            close: newPrice,
            volume: Math.random() * 10000 + 1000
          };
          
          return [...prevData.slice(-99), newCandle]; // Keep last 100 candles
        } else {
          // Update current candle
          const updatedCandle: ChartData = {
            ...lastCandle,
            high: Math.max(lastCandle.high, newPrice),
            low: Math.min(lastCandle.low, newPrice),
            close: newPrice,
            volume: lastCandle.volume + Math.random() * 100
          };
          
          return [...prevData.slice(0, -1), updatedCandle];
        }
      });
      
      return newPrice;
    });
  };

  const handlePriceUpdate = (change: number, type: 'percentage' | 'absolute') => {
    setCurrentPrice(prevPrice => {
      let newPrice: number;
      
      if (type === 'percentage') {
        newPrice = prevPrice * (1 + change / 100);
      } else {
        newPrice = prevPrice + change;
      }
      
      newPrice = Math.max(1000, Math.round(newPrice));
      
      // Update chart data immediately
      setChartData(prevData => {
        if (prevData.length === 0) return prevData;
        
        const lastCandle = prevData[prevData.length - 1];
        const updatedCandle: ChartData = {
          ...lastCandle,
          close: newPrice,
          high: Math.max(lastCandle.high, newPrice),
          low: Math.min(lastCandle.low, newPrice),
          timestamp: Date.now()
        };
        
        return [...prevData.slice(0, -1), updatedCandle];
      });
      
      return newPrice;
    });
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setCurrentPage('trading');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <div className="text-amber-400 text-xl font-mono">Loading Ardentia Exchange...</div>
          <div className="text-amber-500 text-sm mt-2">Connecting to Minecraft Community Trading</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <LoginForm 
        onSuccess={() => setLoading(false)}
        onSwitchToRegister={() => setAuthMode('register')}
      />
    ) : (
      <RegisterForm 
        onSuccess={() => setLoading(false)}
        onSwitchToLogin={() => setAuthMode('login')}
      />
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'trading':
        return (
          <TradingInterface
            user={user}
            currentPrice={currentPrice}
            chartData={chartData}
            onPriceUpdate={handlePriceUpdate}
          />
        );
      case 'deposit':
        return <DepositPage user={user} />;
      case 'admin-deposits':
        return user.role === 'admin' ? <DepositManagement /> : (
          <div className="text-center py-12">
            <p className="text-red-400 text-xl">Access Denied</p>
            <p className="text-amber-400">Admin privileges required</p>
          </div>
        );
      case 'admin-settings':
        return user.role === 'admin' ? (
          <TradingSettings onPriceUpdate={handlePriceUpdate} />
        ) : (
          <div className="text-center py-12">
            <p className="text-red-400 text-xl">Access Denied</p>
            <p className="text-amber-400">Admin privileges required</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-stone-900">
      <Header 
        user={user}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
      />
      
      <div className="max-w-7xl mx-auto p-4">
        {renderCurrentPage()}
      </div>
    </div>
  );
}

export default App;