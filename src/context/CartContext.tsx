import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, Coupon } from '../types';
import { useToast } from './ToastContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  shippingMethod: 'standard' | 'express';
  setShippingMethod: (method: 'standard' | 'express') => void;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingFee: number;
  totalAmount: number;
  totalItemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('shefalobd_cart') || localStorage.getItem('proshop_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem('shefalobd_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity = 1, selectedColor?: string) => {
    if (product.stock <= 0) {
      showToast(`${product.name} is currently out of stock.`, 'error');
      return;
    }

    let isUpdate = false;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && (!selectedColor || item.selectedColor === selectedColor)
      );
      if (existingIndex > -1) {
        isUpdate = true;
        const currentQty = prev[existingIndex].quantity;
        const newQty = Math.min(currentQty + quantity, product.stock);
        const updated = [...prev];
        updated[existingIndex] = { 
          ...updated[existingIndex], 
          quantity: newQty,
          selectedColor: selectedColor || updated[existingIndex].selectedColor
        };
        return updated;
      } else {
        isUpdate = false;
        return [...prev, { product, quantity: Math.min(quantity, product.stock), selectedColor }];
      }
    });

    if (isUpdate) {
      showToast(`Updated ${product.name} quantity in cart`, 'success');
    } else {
      showToast(`Added ${product.name} to cart`, 'success');
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const clampedQty = Math.min(quantity, item.product.stock);
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Subtotal calculation
  const subtotal = cart.reduce((acc, item) => {
    const itemPrice = item.product.discountPrice ?? item.product.price;
    return acc + itemPrice * item.quantity;
  }, 0);

  // Coupon Application
  const applyCouponCode = async (code: string): Promise<boolean> => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return false;

    // First check hardcoded instant promos
    if (trimmed === 'SAVE20') {
      const coupon: Coupon = {
        id: 'SAVE20',
        code: 'SAVE20',
        type: 'percentage',
        value: 20,
        isActive: true,
      };
      setAppliedCoupon(coupon);
      showToast('20% discount coupon applied!', 'success');
      return true;
    }

    if (trimmed === 'PRO50') {
      const coupon: Coupon = {
        id: 'PRO50',
        code: 'PRO50',
        type: 'fixed',
        value: 50,
        isActive: true,
      };
      setAppliedCoupon(coupon);
      showToast('$50 discount coupon applied!', 'success');
      return true;
    }

    // Check Firestore coupons collection
    try {
      const couponsRef = collection(db, 'coupons');
      const q = query(couponsRef, where('code', '==', trimmed), where('isActive', '==', true));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const couponDoc = querySnapshot.docs[0];
        const couponData = { id: couponDoc.id, ...couponDoc.data() } as Coupon;

        if (couponData.minOrder && subtotal < couponData.minOrder) {
          showToast(`Minimum order amount of $${couponData.minOrder} required for this coupon.`, 'error');
          return false;
        }

        setAppliedCoupon(couponData);
        showToast(`Coupon ${couponData.code} applied!`, 'success');
        return true;
      } else {
        showToast('Invalid or expired promo code.', 'error');
        return false;
      }
    } catch (err: any) {
      handleFirestoreError(err, OperationType.GET, 'coupons');
      showToast('Failed to validate coupon', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon code removed', 'info');
  };

  // Calculate discount
  let discountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.value) / 100;
      if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount;
      }
    } else {
      discountAmount = appliedCoupon.value;
    }
  }
  if (discountAmount > subtotal) discountAmount = subtotal;

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  // Tax calculation (e.g. 5%)
  const taxAmount = Math.round(discountedSubtotal * 0.05 * 100) / 100;

  // Shipping Fee
  const shippingFee = cart.length === 0 ? 0 : shippingMethod === 'express' ? 100 : subtotal > 50000 ? 0 : 500;

  // Total
  const totalAmount = Math.max(0, Math.round((discountedSubtotal + taxAmount + shippingFee) * 100) / 100);

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        shippingMethod,
        setShippingMethod,
        subtotal,
        discountAmount,
        taxAmount,
        shippingFee,
        totalAmount,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
