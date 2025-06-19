import React, { useState, useEffect } from 'react';
import { Coins, Upload, MessageCircle, Clock, Check, X } from 'lucide-react';
import { depositService } from '../../services/depositService';
import { DepositRequest, User } from '../../types';

interface DepositPageProps {
  user: User;
}

export const DepositPage: React.FC<DepositPageProps> = ({ user }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'discord' | 'manual'>('discord');
  const [proof, setProof] = useState('');
  const [loading, setLoading] = useState(false);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = depositService.getUserDeposits(user.id, setDeposits);
    return () => unsubscribe();
  }, [user.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const amountNum = parseInt(amount);
      if (amountNum < 1000) {
        throw new Error('Minimum deposit is 1,000 AC');
      }

      await depositService.createDepositRequest(
        user.id,
        user.username,
        amountNum,
        method,
        proof || undefined
      );

      setMessage('Deposit request submitted successfully!');
      setAmount('');
      setProof('');
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: DepositRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'approved':
        return <Check className="w-4 h-4 text-emerald-400" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: DepositRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'text-amber-400';
      case 'approved':
        return 'text-emerald-400';
      case 'rejected':
        return 'text-red-400';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-stone-800 rounded-lg border-2 border-amber-600/30 p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-amber-100 mb-6 font-mono flex items-center">
          <Coins className="w-6 h-6 mr-2 text-amber-400" />
          Deposit Ardentia Coins
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-amber-300 mb-2">
                Deposit Amount (AC)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1000"
                step="100"
                className="w-full px-4 py-3 bg-stone-700 border-2 border-amber-600/30 rounded-lg text-amber-100 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="10,000"
                required
              />
              <p className="text-xs text-amber-500 mt-1">Minimum deposit: 1,000 AC</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-300 mb-2">
                Deposit Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="discord"
                    checked={method === 'discord'}
                    onChange={(e) => setMethod(e.target.value as 'discord')}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  <span className="text-amber-100">Discord Bot (Recommended)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="manual"
                    checked={method === 'manual'}
                    onChange={(e) => setMethod(e.target.value as 'manual')}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <Upload className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-100">Manual Upload</span>
                </label>
              </div>
            </div>
          </div>

          {method === 'manual' && (
            <div>
              <label className="block text-sm font-bold text-amber-300 mb-2">
                Payment Proof (Screenshot URL or Description)
              </label>
              <textarea
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-stone-700 border-2 border-amber-600/30 rounded-lg text-amber-100 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Paste screenshot URL or describe your payment..."
                required={method === 'manual'}
              />
            </div>
          )}

          <div className="bg-stone-700 p-4 rounded-lg border border-amber-600/30">
            <h4 className="font-bold text-amber-300 mb-2">Deposit Instructions:</h4>
            {method === 'discord' ? (
              <ul className="text-amber-400 text-sm space-y-1">
                <li>• Use the Discord bot command: <code className="bg-stone-600 px-2 py-1 rounded">/deposit {amount}</code></li>
                <li>• Follow the bot's payment instructions</li>
                <li>• Your deposit will be processed automatically</li>
              </ul>
            ) : (
              <ul className="text-amber-400 text-sm space-y-1">
                <li>• Make payment via the specified method</li>
                <li>• Upload screenshot or provide payment proof</li>
                <li>• Wait for admin approval (usually within 24 hours)</li>
              </ul>
            )}
          </div>

          {message && (
            <div className={`p-3 rounded-lg border ${
              message.includes('successfully') 
                ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
                : 'bg-red-600/20 border-red-500/50 text-red-400'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-stone-600 text-white py-3 rounded-lg font-bold transition-all duration-200 disabled:cursor-not-allowed border-2 border-amber-500 disabled:border-stone-500 shadow-lg"
          >
            {loading ? 'Submitting...' : 'Submit Deposit Request'}
          </button>
        </form>
      </div>

      {/* Deposit History */}
      <div className="bg-stone-800 rounded-lg border-2 border-amber-600/30 p-6 shadow-lg">
        <h3 className="text-xl font-bold text-amber-100 mb-4 font-mono">Deposit History</h3>
        
        {deposits.length === 0 ? (
          <p className="text-amber-400 text-center py-8">No deposits yet</p>
        ) : (
          <div className="space-y-3">
            {deposits.map((deposit) => (
              <div key={deposit.id} className="bg-stone-700 p-4 rounded-lg border border-amber-600/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(deposit.status)}
                    <div>
                      <p className="font-bold text-amber-100 font-mono">
                        {deposit.amount.toLocaleString()} AC
                      </p>
                      <p className="text-xs text-amber-400">
                        {new Date(deposit.createdAt).toLocaleString()} • {deposit.method}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${getStatusColor(deposit.status)}`}>
                      {deposit.status.toUpperCase()}
                    </p>
                    {deposit.processedAt && (
                      <p className="text-xs text-amber-500">
                        Processed: {new Date(deposit.processedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                {deposit.notes && (
                  <div className="mt-2 p-2 bg-stone-600 rounded text-sm text-amber-300">
                    <strong>Note:</strong> {deposit.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};