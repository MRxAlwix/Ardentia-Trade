import React, { useState, useEffect } from 'react';
import { User } from './types';
import { authService } from './services/authService';
import { Header } from './components/Header';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { TradingDashboard } from './components/Trading/TradingDashboard';
import { AdminPanel } from './components/AdminPanel';
import { DepositPage } from './components/Member/DepositPage';
import { useTradingData } from './hooks/useTradingData';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'trading' | 'admin' | 'deposit'>('login');
  const { coins, loading: coinsLoading } = useTradingData();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        setCurrentView('trading');
      } else {
        setCurrentView('login');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentView('trading');
  };

  const handleRegister = (userData: User) => {
    setUser(userData);
    setCurrentView('trading');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setCurrentView('login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleViewChange = (view: 'trading' | 'admin' | 'deposit') => {
    setCurrentView(view);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Ardentia Exchange...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Ardentia Exchange</h1>
              <p className="text-blue-200">Professional Cryptocurrency Trading Platform</p>
            </div>
            
            {currentView === 'login' ? (
              <div>
                <LoginForm onLogin={handleLogin} />
                <p className="text-center mt-4 text-blue-200">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setCurrentView('register')}
                    className="text-white font-medium hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            ) : (
              <div>
                <RegisterForm onRegister={handleRegister} />
                <p className="text-center mt-4 text-blue-200">
                  Already have an account?{' '}
                  <button
                    onClick={() => setCurrentView('login')}
                    className="text-white font-medium hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        user={user} 
        onLogout={handleLogout}
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      
      <main className="container mx-auto px-4 py-8">
        {currentView === 'trading' && (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Trading Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.username}! Start trading with advanced tools.</p>
            </div>
            {coinsLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <TradingDashboard coins={coins} user={user} />
            )}
          </div>
        )}
        
        {currentView === 'admin' && user.role === 'admin' && (
          <AdminPanel user={user} />
        )}
        
        {currentView === 'deposit' && (
          <DepositPage user={user} />
        )}
      </main>
    </div>
  );
}

export default App;