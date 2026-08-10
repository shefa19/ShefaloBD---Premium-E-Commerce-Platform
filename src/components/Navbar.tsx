import React, { useState } from 'react';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  SlidersHorizontal,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  PackageCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/formatters';

interface NavbarProps {
  onOpenAuth: (view?: 'login' | 'register' | 'forgot') => void;
  onOpenDashboard: (tab?: 'profile' | 'orders' | 'wishlist' | 'addresses') => void;
  onOpenAdmin: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onToggleMobileFilter: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenDashboard,
  onOpenAdmin,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onToggleMobileFilter,
}) => {
  const { user, userProfile, isAdmin, logout } = useAuth();
  const { setIsCartOpen, totalItemsCount, subtotal } = useCart();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const wishlistCount = userProfile?.wishlist?.length || 0;

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'Electronics', name: 'Electronics' },
    { id: 'Smartphones & Tablets', name: 'Smartphones' },
    { id: 'Laptops & Workstations', name: 'Laptops' },
    { id: 'Pro Audio & Headphones', name: 'Pro Audio' },
    { id: 'Wearable Tech', name: 'Wearables' },
    { id: 'Cameras & Optics', name: 'Cameras' },
    { id: 'Luxury Fashion', name: 'Fashion' },
    { id: 'Gaming & Entertainment', name: 'Gaming' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-all shadow-sm">
      {/* Top Banner Announcement */}
      <div className="bg-gradient-to-r from-amber-600 via-indigo-600 to-indigo-800 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Summer Premium Sale: Use promo code <strong className="font-bold underline tracking-wider">SAVE20</strong> for 20% off or <strong className="font-bold underline tracking-wider">PRO50</strong> for ৳50 off!</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="flex items-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 text-slate-950 font-bold" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-amber-600 dark:from-amber-400 via-slate-900 dark:via-slate-100 to-indigo-600 dark:to-indigo-300 bg-clip-text text-transparent">
                  SHEFALO<span className="text-amber-500">BD</span>
                </span>
                <span className="text-[10px] tracking-widest text-slate-500 dark:text-slate-400 uppercase -mt-1 font-semibold">
                  E-Commerce Platform
                </span>
              </div>
            </a>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden sm:flex flex-1 max-w-md relative items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products, brands, gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-full text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Filter Toggle Mobile */}
            <button
              onClick={onToggleMobileFilter}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
              title="Filters"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => {
                if (!user) onOpenAuth('login');
                else onOpenDashboard('wishlist');
              }}
              className="relative p-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all group"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 w-5 h-5 bg-amber-500 text-slate-950 text-[11px] font-extrabold rounded-full flex items-center justify-center">
                    {totalItemsCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline text-xs font-bold tracking-wide">
                {formatPrice(subtotal)}
              </span>
            </button>

            {/* User Profile / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 border border-slate-800 transition-all"
                >
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt=""
                      className="w-8 h-8 rounded-lg object-cover border border-amber-500/50 shadow-md shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0">
                      {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="hidden md:inline text-xs font-medium max-w-[100px] truncate text-slate-200">
                    {userProfile?.name || 'Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-slate-800 flex items-center gap-2.5">
                      {userProfile?.photoURL ? (
                        <img
                          src={userProfile.photoURL}
                          alt=""
                          className="w-9 h-9 rounded-xl object-cover border border-amber-500/50 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md shrink-0">
                          {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-100 truncate">{userProfile?.name || 'User'}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="mt-0.5 inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Admin Access
                          </span>
                        )}
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium text-amber-400 hover:bg-slate-800/80 flex items-center gap-2"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Admin Control Panel
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenDashboard('profile');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800/80 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      My Profile
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenDashboard('orders');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800/80 flex items-center gap-2"
                    >
                      <PackageCheck className="w-4 h-4 text-slate-400" />
                      Order History
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenDashboard('wishlist');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800/80 flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4 text-slate-400" />
                      Wishlist ({wishlistCount})
                    </button>

                    <div className="border-t border-slate-800 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-slate-800/80 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="sm:hidden pb-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Category Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1 border-t border-slate-800/60 py-2.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-t border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categories</p>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-xl text-left text-xs font-semibold ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
