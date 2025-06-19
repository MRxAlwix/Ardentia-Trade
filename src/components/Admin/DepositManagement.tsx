import React, { useState, useEffect } from 'react';
import { Clock, Check, X, MessageCircle, Upload, User } from 'lucide-react';
import { depositService } from '../../services/depositService';
import { DepositRequest } from '../../types';

export const DepositManagement: React.FC = () => {
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const unsubscribe = depositService.getAllDeposits(setDeposits);
    return () => unsubscribe();
  }, []);

  const filteredDeposits = deposits.filter(deposit => 
    filter === 'all' || deposit.status === filter
  );

  const handleProcess = async (depositId: string, status: 'approved' | 'rejected') => {
    setProcessingId(depositId);
    try {
      await depositService.processDeposit(
        depositId, 
        status, 
        'admin', // In real app, use actual admin ID
        notes[depositId] || undefined
      );
      setNotes(prev => ({ ...prev, [depositId]: '' }));
    } catch (error) {
      console.error('Failed to process deposit:', error);
    } finally {
      setProcessingId(null);
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

  const getMethodIcon = (method: 'discord' | 'manual') => {
    return method === 'discord' 
      ? <MessageCircle className="w-4 h-4 text-blue-400" />
      : <Upload className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div className="bg-stone-800 rounded-lg border-2 border-amber-600/30 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-amber-100 font-mono flex items-center">
          <User className="w-5 h-5 mr-2 text-amber-400" />
          Deposit Management
        </h3>
        
        <div className="flex space-x-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                filter === status
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-700 text-amber-300 hover:bg-stone-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span className="ml-1 text-xs">
                  ({deposits.filter(d => d.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {filteredDeposits.length === 0 ? (
        <p className="text-amber-400 text-center py-8">No deposits found</p>
      ) : (
        <div className="space-y-4">
          {filteredDeposits.map((deposit) => (
            <div key={deposit.id} className="bg-stone-700 p-4 rounded-lg border border-amber-600/20">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(deposit.status)}
                    {getMethodIcon(deposit.method)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-bold text-amber-100">{deposit.username}</h4>
                      <span className="text-2xl font-bold text-emerald-400 font-mono">
                        {deposit.amount.toLocaleString()} AC
                      </span>
                    </div>
                    
                    <div className="text-sm text-amber-400 space-y-1">
                      <p>Method: {deposit.method}</p>
                      <p>Submitted: {new Date(deposit.createdAt).toLocaleString()}</p>
                      {deposit.processedAt && (
                        <p>Processed: {new Date(deposit.processedAt).toLocaleString()}</p>
                      )}
                    </div>

                    {deposit.proof && (
                      <div className="mt-2 p-2 bg-stone-600 rounded text-sm text-amber-300">
                        <strong>Proof:</strong> {deposit.proof}
                      </div>
                    )}

                    {deposit.notes && (
                      <div className="mt-2 p-2 bg-stone-600 rounded text-sm text-amber-300">
                        <strong>Admin Note:</strong> {deposit.notes}
                      </div>
                    )}
                  </div>
                </div>

                {deposit.status === 'pending' && (
                  <div className="flex flex-col space-y-2 min-w-[200px]">
                    <textarea
                      value={notes[deposit.id] || ''}
                      onChange={(e) => setNotes(prev => ({ ...prev, [deposit.id]: e.target.value }))}
                      placeholder="Add note (optional)"
                      rows={2}
                      className="w-full px-2 py-1 bg-stone-600 border border-amber-600/30 rounded text-amber-100 text-sm"
                    />
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleProcess(deposit.id, 'approved')}
                        disabled={processingId === deposit.id}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-600 text-white py-2 px-3 rounded text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      
                      <button
                        onClick={() => handleProcess(deposit.id, 'rejected')}
                        disabled={processingId === deposit.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-stone-600 text-white py-2 px-3 rounded text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};