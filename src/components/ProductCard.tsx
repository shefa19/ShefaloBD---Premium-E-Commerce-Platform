import React from 'react';
import { Product } from '../types';
import { ShoppingBag, Heart, Star, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../lib/formatters';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { userProfile, toggleWishlist } = useAuth();

  const isWishlisted = userProfile?.wishlist?.includes(product.id);
  const effectivePrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col transform-gpu">
      {/* Image Container */}
      <div 
        onClick={() => onQuickView(product)}
        className="relative aspect-square w-full bg-slate-100 dark:bg-slate-950 overflow-hidden cursor-pointer"
      >
        <img
          src={product.thumbnail || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 transform-gpu"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && product.discountPercent && (
            <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase rounded-full shadow-md">
              -{product.discountPercent}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2.5 py-1 bg-indigo-600 text-white font-bold text-[10px] uppercase rounded-full shadow-md">
              Featured
            </span>
          )}
        </div>

        {/* Top Right Wishlist & Quick view controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`p-2 rounded-full transition-all shadow-md ${
              isWishlisted
                ? 'bg-rose-500 text-white'
                : 'bg-slate-950/85 hover:bg-slate-950 text-slate-300 hover:text-rose-400 border border-slate-800/90'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="p-2 rounded-full bg-slate-950/85 hover:bg-slate-950 text-slate-300 hover:text-amber-400 border border-slate-800/90 transition-all shadow-md"
            title="Quick View"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Out of Stock Overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-slate-950/85 flex items-center justify-center">
            <span className="px-3 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-lg uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
            <span className="uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">{product.brand}</span>
            <span className="truncate max-w-[120px] text-slate-600 dark:text-slate-400">{product.category}</span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-amber-500 cursor-pointer line-clamp-2 transition-colors mb-2"
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span className="text-xs font-bold ml-1 text-slate-900 dark:text-slate-200">{product.rating}</span>
            </div>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">({product.reviewsCount} reviews)</span>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2 mt-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {formatPrice(effectivePrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-500 line-through font-medium">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-semibold ${product.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {product.stock > 0 ? `${product.stock} left in stock` : 'Sold Out'}
            </span>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stock <= 0}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
              product.stock > 0
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 active:scale-95'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
