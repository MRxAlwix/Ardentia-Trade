import React from 'react';
import { Pickaxe, LogOut, Coins, Settings, Users, BarChart3 } from 'lucide-react';
import { User } from '../types';

export type ViewType = 'trading' | 'deposit' | 'admin-deposits' | 'admin-settings';

interface HeaderProps {
  user: User;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, currentView, onViewChange, onLogout }) => {
  const navItems = [
    { id: 'trading' as ViewType, label: 'Trading', icon: BarChart3, forAll: true },
    { id: 'deposit' as ViewType, label: 'Deposit', icon: Coins, forAll: true },
    { id: 'admin-deposits' as ViewType, label: 'Manage Deposits', icon: Users, adminOnly: true },
    { id: 'admin-settings' as ViewType, label: 'Settings', icon: Settings, adminOnly: true },
  ];

  const visibleNavItems = navItems.filter(item => 
    item.forAll || (item.adminOnly && user.role === 'admin')
  );

  return (
    <header className="bg-stone-800 border-b-2 border-amber-600 px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg shadow-md">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-amber-100 font-mono">Ardentia Exchange</h1>
            <p className="text-xs text-amber-300">Minecraft Community Trading</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                  currentView === item.id
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                    : 'bg-stone-700 text-amber-300 hover:bg-stone-600 border-amber-600/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center space-x-4">
          <div className="text-right bg-stone-700 px-3 py-2 rounded-lg border border-amber-600/30">
            <p className="text-sm text-amber-300">Balance</p>
            <p className="text-lg font-bold text-emerald-400 font-mono">
              {user.balance.toLocaleString()} AC
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-stone-700 px-3 py-2 rounded-lg border border-amber-600/30">
              <Pickaxe className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <span className="text-sm text-amber-100 font-medium">{user.username}</span>
                <p className="text-xs text-amber-400">{user.rank}</p>
              </div>
            </div>
            
            <button 
              onClick={onLogout}
              className="p-2 text-amber-400 hover:text-amber-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden mt-3 flex space-x-1 overflow-x-auto">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border whitespace-nowrap ${
                currentView === item.id
                  ? 'bg-amber-600 text-white border-amber-500'
                  : 'bg-stone-700 text-amber-300 hover:bg-stone-600 border-amber-600/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};