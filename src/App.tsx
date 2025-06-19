import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { Header } from './components/Header';
import { DepositPage } from './components/Member/DepositPage';
import { DepositManagement } from './components/Admin/DepositManagement';
import { TradingInterface } from './components/Trading/TradingInterface';
import { TradingSettings } from './components/Admin/TradingSettings';
import { authService } from './services/authService';
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
    
    // Start price simulation
    const interval = setInterval(() => {
      updatePrice();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const generateInitialChartData = () => {
    const data: ChartData[] = [];
    let price = 10000;
    
    for (let i = 0; i < 50; i++) {
      const change = (Math.random() - 0.5) * price * 0.02;
      const open = price;
      price = Math.max(1000, price + change);
      const close = Math.round(price);
      const high = Math.max(open, close) + Math.random() * price * 0.01;
      const low = Math.max(1000, Math.min(open, close) - Math.random() * price * 0.01);
      
      data.push({
        timestamp: Date.now() - (49 - i) * 3600000,
        open: Math.round(open),
        high: Math.round(high),
        low: Math.round(low),
        close,
        volume: Math.random() * 10000
      });
    }
    
    setChartData(data);
    setCurrentPrice(data[data.length - 1].close);
  };

  const updatePrice = () => {
    setCurrentPrice(prevPrice => {
      const change = (Math.random() - 0.5) * prevPrice * 0.01;
      const newPrice = Math.max(1000, Math.round(prevPrice + change));
      
      // Update chart data
      setChartData(prevData => {
        const lastCandle = prevData[prevData.length - 1];
        const newCandle: ChartData = {
          timestamp: Date.now(),
          open: lastCandle.close,
          high: Math.max(lastCandle.close, newPrice),
          low: Math.min(lastCandle.close, newPrice),
          close: newPrice,
          volume: Math.random() * 10000
        };
        
        return [...prevData.slice(-49), newCandle];
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
        <div className="text-amber-400 text-xl font-mono">Loading Ardentia Exchange...</div>
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
        return user.role === 'admin' ? <DepositManagement /> : null;
      case 'admin-settings':
        return user.role === 'admin' ? (
          <TradingSettings onPriceUpdate={handlePriceUpdate} />
        ) : null;
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