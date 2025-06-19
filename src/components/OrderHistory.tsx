import React from 'react';
import { Clock, Check, X, Scroll } from 'lucide-react';
import { Order } from '../types';

interface OrderHistoryProps {
  orders: Order[];
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders }) => {
  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-emerald-400" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-red-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-400" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-400';
      case 'cancelled':
        return 'text-red-400';
      case 'pending':
        return 'text-amber-400';
    }
  };

  return (
    <div className="bg-stone-800 rounded-lg border-2 border-amber-600/30 p-4 shadow-lg">
      <h3 className="text-lg font-bold text-amber-100 mb-4 font-mono flex items-center">
        <Scroll className="w-5 h-5 mr-2 text-amber-400" />
        Trade History
      </h3>
      
      {orders.length === 0 ? (
        <p className="text-amber-400 text-center py-8">No trades yet</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {orders.map((order) => (
            <div key={order.id} className="bg-stone-700 p-3 rounded-lg border border-amber-600/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold font-mono ${
                        order.type === 'buy' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {order.type.toUpperCase()}
                      </span>
                      <span className="text-amber-100 font-mono">{order.coin}</span>
                      <span className="text-xs text-amber-400 bg-stone-600 px-2 py-1 rounded font-mono">
                        {order.orderType}
                      </span>
                    </div>
                    <p className="text-xs text-amber-400 font-mono">
                      {new Date(order.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-amber-100 font-mono">
                    {order.amount} @ {order.price.toLocaleString()} AC
                  </p>
                  <p className={`text-xs font-bold ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};