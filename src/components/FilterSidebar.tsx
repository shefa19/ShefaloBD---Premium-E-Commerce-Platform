import React from 'react';
import { FilterOptions } from '../types';
import { SlidersHorizontal, RotateCcw, Star } from 'lucide-react';
import { formatPrice } from '../lib/formatters';

interface FilterSidebarProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  availableBrands: string[];
  availableCategories: string[];
  onResetFilters: () => void;
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  setFilters,
  availableBrands,
  availableCategories,
  onResetFilters,
  isMobileDrawer,
  onCloseMobile,
}) => {
  return (
    <div className={`space-y-6 text-xs text-slate-700 dark:text-slate-300 ${isMobileDrawer ? 'p-6 bg-white dark:bg-slate-900 h-full overflow-y-auto' : ''}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          <SlidersHorizontal className="w-4 h-4 text-amber-500" />
          <span>Filters & Sort</span>
        </div>
        <button
          onClick={onResetFilters}
          className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          title="Reset Filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
          className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 font-semibold focus:outline-none focus:border-amber-500"
        >
          <option value="featured">Featured Picks</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Highest Rated</option>
          <option value="newest">Newest Arrivals</option>
        </select>
      </div>

      {/* Category Selection */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Category
        </label>
        <div className="space-y-1">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, category: 'all' }))}
            className={`w-full text-left px-3 py-1.5 rounded-lg transition-all ${
              filters.category === 'all'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium'
            }`}
          >
            All Categories
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilters((prev) => ({ ...prev, category: cat }))}
              className={`w-full text-left px-3 py-1.5 rounded-lg transition-all ${
                filters.category === cat
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>Max Price</span>
          <span className="text-amber-400 font-bold">{formatPrice(filters.maxPrice)}</span>
        </div>
        <input
          type="range"
          min="5000"
          max="800000"
          step="5000"
          value={filters.maxPrice}
          onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
          className="w-full accent-amber-500 bg-slate-950 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
          <span>{formatPrice(5000)}</span>
          <span>{formatPrice(800000)}+</span>
        </div>
      </div>

      {/* Brand Selector */}
      {availableBrands.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Brand
            </label>
            {filters.category !== 'all' && (
              <span className="text-[10px] text-amber-400 font-medium bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full truncate max-w-[120px]">
                {filters.category}
              </span>
            )}
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-amber-400 transition-colors">
              <input
                type="radio"
                name="brandFilter"
                checked={filters.brand === 'all'}
                onChange={() => setFilters((prev) => ({ ...prev, brand: 'all' }))}
                className="accent-amber-500"
              />
              <span className="font-semibold">All Brands</span>
            </label>
            {availableBrands.map((b) => (
              <label key={b} className="flex items-center justify-between text-slate-300 cursor-pointer hover:text-amber-400 transition-colors">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="brandFilter"
                    checked={filters.brand === b}
                    onChange={() => setFilters((prev) => ({ ...prev, brand: b }))}
                    className="accent-amber-500"
                  />
                  <span>{b}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Minimum Rating */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Minimum Rating
        </label>
        <div className="grid grid-cols-5 gap-1">
          {[0, 3, 4, 4.5, 4.8].map((rating) => (
            <button
              key={rating}
              onClick={() => setFilters((prev) => ({ ...prev, minRating: rating }))}
              className={`py-1 rounded-lg text-[11px] font-bold flex items-center justify-center gap-0.5 border ${
                filters.minRating === rating
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span>{rating === 0 ? 'Any' : `${rating}`}</span>
              {rating > 0 && <Star className="w-2.5 h-2.5 fill-current" />}
            </button>
          ))}
        </div>
      </div>

      {/* Stock availability */}
      <div className="pt-2 border-t border-slate-800/80">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-semibold text-slate-300">In Stock Only</span>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => setFilters((prev) => ({ ...prev, inStockOnly: e.target.checked }))}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
        </label>
      </div>

      {isMobileDrawer && (
        <button
          onClick={onCloseMobile}
          className="w-full py-3 bg-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase"
        >
          Apply Filters
        </button>
      )}

    </div>
  );
};
