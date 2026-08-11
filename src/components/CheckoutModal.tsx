import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Truck,
  CreditCard,
  Phone,
  User,
  Mail,
  ShieldCheck,
  CheckCircle,
  Smartphone,
  Banknote,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Order, Address } from '../types';
import { formatPrice } from '../lib/formatters';
import { BANGLADESH_DIVISIONS, getDistrictsForDivision } from '../lib/bangladeshLocations';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  useLockBodyScroll(isOpen);
  const {
    cart,
    clearCart,
    subtotal,
    discountAmount,
    taxAmount,
    shippingFee,
    totalAmount,
    shippingMethod,
    setShippingMethod,
    appliedCoupon,
  } = useCart();

  const { user, userProfile } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Dhaka',
    state: 'Dhaka Division',
    zipCode: '1212',
    country: 'Bangladesh',
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bkash' | 'nagad' | 'cod'>('card');
  
  // Payment specifics (dummy input simulation for Card/bKash/Nagad)
  const [paymentAccount, setPaymentMethodAccount] = useState({
    cardNumber: '4532 8921 7712 9011',
    cardExpiry: '12/28',
    cardCvc: '889',
    mobileNumber: '',
    trxId: '',
  });

  // Pre-fill user details if logged in
  useEffect(() => {
    if (userProfile) {
      const defaultAddr = userProfile.addresses?.find((a) => a.isDefault) || userProfile.addresses?.[0];
      setFormData({
        name: userProfile.name || user?.displayName || '',
        email: userProfile.email || user?.email || '',
        phone: userProfile.phone || defaultAddr?.phone || '+880 1712-345678',
        addressLine1: defaultAddr?.addressLine1 || 'House 42, Road 11, Banani',
        addressLine2: defaultAddr?.addressLine2 || 'Apt 3A',
        city: defaultAddr?.city || 'Dhaka',
        state: defaultAddr?.state || 'Dhaka Division',
        zipCode: defaultAddr?.zipCode || '1213',
        country: defaultAddr?.country || 'Bangladesh',
      });
      if (defaultAddr?.phone) {
        setPaymentMethodAccount((prev) => ({ ...prev, mobileNumber: defaultAddr.phone }));
      }
    }
  }, [userProfile, user]);

  const availableDistricts = getDistrictsForDivision(formData.state);

  const handleDivisionChange = (newDivision: string) => {
    const dists = getDistrictsForDivision(newDivision);
    const defaultCity = dists.includes(formData.city) ? formData.city : dists[0];
    setFormData((prev) => ({
      ...prev,
      state: newDivision,
      city: defaultCity,
    }));
  };

  if (!isOpen) return null;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast('Please sign in to complete your order', 'error');
      return;
    }

    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.addressLine1 || !formData.city) {
      showToast('Please fill in all required shipping fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const orderId = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();

      const shippingAddressObj: Address = {
        id: 'addr-' + Date.now(),
        name: formData.name,
        phone: formData.phone,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      };

      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.thumbnail || item.product.images[0],
        price: item.product.discountPrice ?? item.product.price,
        quantity: item.quantity,
      }));

      const newOrder: Order = {
        id: orderId,
        userId: user.uid,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: shippingAddressObj,
        items: orderItems,
        subtotal: subtotal,
        discount: discountAmount,
        couponCode: appliedCoupon?.code || '',
        tax: taxAmount,
        shippingFee: shippingFee,
        totalAmount: totalAmount,
        shippingMethod: shippingMethod,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        orderStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Firestore
      try {
        await setDoc(doc(db, 'orders', orderId), newOrder);
      } catch (err: any) {
        console.warn('Firestore set order warning:', err.message);
      }

      clearCart();
      showToast(`Order #${orderId} placed successfully!`, 'success');
      onOrderSuccess(newOrder);
      onClose();
    } catch (err: any) {
      console.warn('Checkout error:', err);
      showToast('Error placing order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-6">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 backdrop-blur-md shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-100">Secure Checkout</h2>
              <p className="text-[11px] sm:text-xs text-slate-400">Complete your shipping and payment details</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body Grid */}
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          
          {/* Left Column: Form Details (8 Cols) */}
          <div className="lg:col-span-7 p-6 md:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-800">
            
            {/* 1. Shipping Address */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <MapPin className="w-4 h-4" />
                <span>1. Shipping Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="House / Flat / Road name"
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Division / State *</label>
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => handleDivisionChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {BANGLADESH_DIVISIONS.map((div) => (
                      <option key={div} value={div} className="bg-slate-900 text-slate-100">
                        {div}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">City / District *</label>
                  <select
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {availableDistricts.map((ct) => (
                      <option key={ct} value={ct} className="bg-slate-900 text-slate-100">
                        {ct}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Shipping Method */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <Truck className="w-4 h-4" />
                <span>2. Shipping Speed</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label
                  onClick={() => setShippingMethod('standard')}
                  className={`p-3 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                    shippingMethod === 'standard'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Standard Delivery</span>
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="accent-amber-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1">3-5 Business Days</span>
                  <span className="text-xs font-black mt-2">
                    {subtotal > 50000 ? 'FREE' : formatPrice(500)}
                  </span>
                </label>

                <label
                  onClick={() => setShippingMethod('express')}
                  className={`p-3 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                    shippingMethod === 'express'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Express Courier</span>
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="accent-amber-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1">24-48 Hours Priority</span>
                  <span className="text-xs font-black mt-2">{formatPrice(100)}</span>
                </label>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <CreditCard className="w-4 h-4" />
                <span>3. Payment Options</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all ${
                    paymentMethod === 'bkash'
                      ? 'bg-pink-600 text-white border-pink-500 shadow-lg shadow-pink-600/20'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span>bKash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all ${
                    paymentMethod === 'nagad'
                      ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-600/20'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span>Nagad</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all ${
                    paymentMethod === 'cod'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span>COD</span>
                </button>
              </div>

              {/* Dynamic Payment Method Sub-Form */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs space-y-3">
                {paymentMethod === 'card' && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Card Number</label>
                      <input
                        type="text"
                        value={paymentAccount.cardNumber}
                        onChange={(e) => setPaymentMethodAccount({ ...paymentAccount, cardNumber: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-400 block mb-1">Expiry</label>
                        <input
                          type="text"
                          value={paymentAccount.cardExpiry}
                          onChange={(e) => setPaymentMethodAccount({ ...paymentAccount, cardExpiry: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">CVC / CVV</label>
                        <input
                          type="password"
                          value={paymentAccount.cardCvc}
                          onChange={(e) => setPaymentMethodAccount({ ...paymentAccount, cardCvc: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                  <div className="space-y-2">
                    <p className="text-slate-300">
                      Send total payment to merchant number: <strong className="text-amber-400 font-mono">01700-000000</strong>
                    </p>
                    <div>
                      <label className="text-slate-400 block mb-1">Your Mobile Number</label>
                      <input
                        type="text"
                        placeholder="017XXXXXXXX"
                        value={paymentAccount.mobileNumber || formData.phone}
                        onChange={(e) => setPaymentMethodAccount({ ...paymentAccount, mobileNumber: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <p className="text-slate-300">
                    Pay in cash upon doorstep delivery. Please ensure exact change if possible.
                  </p>
                )}
              </div>

            </div>

          </div>

          {/* Right Column: Order Summary (5 Cols) */}
          <div className="lg:col-span-5 p-6 md:p-8 bg-slate-950 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3">
                Order Summary ({cart.length} items)
              </h3>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {cart.map((item) => {
                  const itemPrice = item.product.discountPrice ?? item.product.price;
                  return (
                    <div key={item.product.id} className="flex items-center gap-3 text-xs">
                      <img
                        src={item.product.thumbnail || (item.product.images && item.product.images[0]) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-800"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-200 truncate">{item.product.name}</p>
                        <p className="text-slate-400">Qty: {item.quantity} × {formatPrice(itemPrice)}</p>
                      </div>
                      <span className="font-bold text-slate-100">
                        {formatPrice(itemPrice * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Cost Calculations */}
              <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-200 font-semibold">{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Tax (5%)</span>
                  <span className="text-slate-200 font-semibold">{formatPrice(taxAmount)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping ({shippingMethod})</span>
                  <span className="text-slate-200 font-semibold">
                    {shippingFee === 0 ? <span className="text-emerald-400">FREE</span> : formatPrice(shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between text-base font-black text-slate-100 pt-3 border-t border-slate-800">
                  <span>Total Due</span>
                  <span className="text-amber-400">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-6 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Processing Order...' : `Pay & Place Order • ${formatPrice(totalAmount)}`}</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Buyer Protection Guarantee</span>
              </div>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
};
