import React, { useState } from 'react';
import { UserPlus, Eye, EyeOff, Pickaxe, Crown } from 'lucide-react';
import { authService } from '../../services/authService';

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await authService.register(email, password, username, adminKey || undefined);
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
          <h1 className="text-2xl font-bold text-amber-100 font-mono">Join Ardentia</h1>
          <p className="text-amber-400 text-sm">Create your trading account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-amber-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-stone-700 border-2 border-amber-600/30 rounded-lg text-amber-100 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="ArdenPlayer"
              required
            />
          </div>

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

          <div>
            <label className="block text-sm font-bold text-amber-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-stone-700 border-2 border-amber-600/30 rounded-lg text-amber-100 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-amber-300 mb-2 flex items-center">
              <Crown className="w-4 h-4 mr-1" />
              Admin Key (Optional)
            </label>
            <div className="relative">
              <input
                type={showAdminKey ? 'text' : 'password'}
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full px-4 py-3 bg-stone-700 border-2 border-amber-600/30 rounded-lg text-amber-100 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pr-12"
                placeholder="Admin access key"
              />
              <button
                type="button"
                onClick={() => setShowAdminKey(!showAdminKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-200"
              >
                {showAdminKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-amber-500 mt-1">Leave empty for regular player account</p>
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
            <UserPlus className="w-5 h-5" />
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-amber-400 hover:text-amber-200 text-sm font-medium"
            >
              Already have an account? Login here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};