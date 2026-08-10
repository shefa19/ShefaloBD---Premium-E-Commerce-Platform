import React from 'react';
import { Order } from '../types';
import { CheckCircle2, PackageCheck, ArrowRight, MapPin } from 'lucide-react';
import { formatPrice } from '../lib/formatters';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
  onViewDashboardOrders: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onViewDashboardOrders,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 text-slate-100 my-auto">
        
        {/* Success Icon Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-100">Thank You For Your Order!</h2>
            <p className="text-xs text-slate-400 mt-1">
              Order <span className="font-mono font-bold text-amber-400">#{order.id}</span> has been confirmed.
            </p>
          </div>
        </div>

        {/* Status Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block font-semibold mb-0.5">Order Status</span>
            <span className="font-bold text-amber-400 uppercase tracking-wider">{order.orderStatus}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold mb-0.5">Payment</span>
            <span className="font-bold text-emerald-400 uppercase tracking-wider">{order.paymentMethod} ({order.paymentStatus})</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-slate-500 block font-semibold mb-0.5">Est. Delivery</span>
            <span className="font-bold text-slate-200">
              {order.shippingMethod === 'express' ? '1-2 Days' : '3-5 Business Days'}
            </span>
          </div>
        </div>

        {/* Items Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Items</h3>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60 text-xs">
                <div className="flex items-center gap-3">
                  <img src={item.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-900" />
                  <div>
                    <p className="font-bold text-slate-200">{item.productName}</p>
                    <p className="text-slate-400">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-100">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-300 mb-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Shipping Destination</span>
          </div>
          <p className="text-slate-200 font-semibold">{order.shippingAddress.name} ({order.customerPhone})</p>
          <p className="text-slate-400">{order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onViewDashboardOrders}
            className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <PackageCheck className="w-4 h-4" />
            <span>View in Order History</span>
          </button>
          
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
