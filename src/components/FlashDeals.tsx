import React, { useState, useEffect } from 'react';
import { Flame, Heart, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../lib/formatters';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface FlashDealsProps {
  products: Product[];
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  toggleWishlist: (productId: string) => void;
  wishlist: string[];
}

export const FlashDeals: React.FC<FlashDealsProps> = ({
  products,
  onQuickView,
  onAddToCart,
  toggleWishlist,
  wishlist,
}) => {
  const [targetTime, setTargetTime] = useState<number>(() => {
    return Date.now() + (4 * 3600 + 59 * 60 + 59) * 1000;
  });

  const [timeLeft, setTimeLeft] = useState({
    hours: 4,
    minutes: 59,
    seconds: 59,
  });

  // Real-time listener for Admin controlled Flash Deal timer
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'settings', 'flashDeals'),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.targetTimestamp && typeof data.targetTimestamp === 'number') {
            setTargetTime(data.targetTimestamp);
          } else if (data.hours !== undefined && data.minutes !== undefined) {
            setTargetTime(Date.now() + (Number(data.hours) * 3600 + Number(data.minutes) * 60) * 1000);
          }
        }
      },
      (err) => {
        console.warn('FlashDeals timer snapshot warning:', err.message);
      }
    );
    return () => unsub();
  }, []);

  // Update countdown tick every second
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((targetTime - now) / 1000));
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  // Filter products explicitly tagged as flash deals or having discounts
  let flashDealProducts = products.filter((p) => p.isFlashDeal);
  if (flashDealProducts.length === 0) {
    flashDealProducts = products.filter((p) => p.discountPrice && p.discountPrice < p.price);
  }
  if (flashDealProducts.length === 0) {
    flashDealProducts = products.slice(0, 4);
  } else {
    flashDealProducts = flashDealProducts.slice(0, 4);
  }

  const formatDigit = (num: number) => String(num).padStart(2, '0');

  return (
    <section id="flash-deals-section" className="mb-10 w-full">
      <div className="bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-amber-500/20">
          
          {/* Left Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 shrink-0">
              <Flame className="w-6 h-6 fill-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                  Flash Deals
                </h2>
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 text-[11px] font-extrabold rounded-full uppercase tracking-wider">
                  Limited Time
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
                Massive price drops on selected top tech gear
              </p>
            </div>
          </div>

          {/* Right Timer */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Ends in:</span>
            <div className="bg-slate-900 text-slate-100 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-mono font-bold shadow-md border border-slate-700">
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold">{formatDigit(timeLeft.hours)}h</span>
              <span className="text-amber-500 font-bold">:</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold">{formatDigit(timeLeft.minutes)}m</span>
              <span className="text-amber-500 font-bold">:</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold">{formatDigit(timeLeft.seconds)}s</span>
            </div>
          </div>

        </div>

        {/* Deals Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {flashDealProducts.map((product) => {
            const isWishlisted = wishlist.includes(product.id);
            const soldCount = product.flashDealSold || Math.floor(product.stock * 1.5) || 12;
            const availableCount = product.stock;
            const totalUnits = availableCount + soldCount;
            const percentageSold = Math.min(100, Math.round((soldCount / totalUnits) * 100));

            // Determine badge text
            let badgeText = product.flashDealBadge;
            if (!badgeText) {
              if (product.discountPrice && product.discountPrice < product.price) {
                const pct = Math.round(((product.price - product.discountPrice) / product.price) * 100);
                badgeText = `${pct}% OFF`;
              } else {
                badgeText = 'HOT DEAL';
              }
            }

            const currentPrice = product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price;
            const originalPrice = product.price;

            return (
              <div
                key={product.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group relative"
              >
                {/* Image Container */}
                <div 
                  onClick={() => onQuickView(product)}
                  className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 mb-3 flex items-center justify-center p-3 cursor-pointer group-hover:bg-slate-200/70 dark:group-hover:bg-slate-950/80 transition-colors"
                >
                  {/* Badge top-left */}
                  <span className="absolute top-2.5 left-2.5 bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md z-10">
                    {badgeText}
                  </span>

                  {/* Wishlist Top-Right */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-all shadow-md z-10 ${
                      isWishlisted
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/90 dark:bg-slate-900/80 hover:bg-rose-500 text-slate-700 dark:text-slate-300 hover:text-white border border-slate-200 dark:border-slate-800'
                    }`}
                    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className="w-4 h-4" />
                  </button>

                  <img
                    src={product.thumbnail || product.images?.[0]}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Info Container */}
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1 block">
                      {product.category}
                    </span>
                    <h3 
                      onClick={() => onQuickView(product)}
                      className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors mb-2 min-h-[2.5rem]"
                    >
                      {product.name}
                    </h3>

                    {/* Price Row */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                        {formatPrice(currentPrice)}
                      </span>
                      {product.discountPrice && product.discountPrice < product.price && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 line-through font-semibold">
                          {formatPrice(originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Available: <strong className="text-slate-950 dark:text-slate-100 font-extrabold">{availableCount}</strong></span>
                      <span>Sold: <strong className="text-slate-950 dark:text-slate-100 font-extrabold">{soldCount}</strong></span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                        style={{ width: `${percentageSold}%` }}
                      />
                    </div>
                  </div>

                  {/* Add to Cart Button with Brand Theme Colors */}
                  <button
                    type="button"
                    onClick={() => onAddToCart(product)}
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-amber-500/20 active:scale-95 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
