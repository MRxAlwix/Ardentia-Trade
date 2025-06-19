import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, Pickaxe } from 'lucide-react';
import { authService } from '../../services/authService';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(email, password);
      onSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
      <div className="bg-stone-800 rounded-lg border-2 border-amber-600/30 p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-lg inline-block mb-4">
            <Pickaxe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-amber-100 font-mono">Ardentia Exchange</h1>
          <p className="text-amber-400 text-sm">Minecraft Community Trading</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-amber-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-stone-700 border-2 border-amber-600/30 rounded-lg text-amber-100 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="player@ardentia.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-amber-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-stone-700 border-2 border-amber-600/30 rounded-lg text-amber-100 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-stone-600 text-white py-3 rounded-lg font-bold transition-all duration-200 disabled:cursor-not-allowed border-2 border-amber-500 disabled:border-stone-500 shadow-lg flex items-center justify-center space-x-2"
          >
            <LogIn className="w-5 h-5" />
            <span>{loading ? 'Logging in...' : 'Login'}</span>
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-amber-400 hover:text-amber-200 text-sm font-medium"
            >
              Don't have an account? Register here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};