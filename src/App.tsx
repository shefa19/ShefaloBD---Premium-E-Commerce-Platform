import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';
import { Product, FilterOptions, Order } from './types';
import { seedInitialDataIfNeeded } from './lib/seedFirestore';
import { SAMPLE_PRODUCTS } from './lib/sampleData';

import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { AuthModal } from './components/AuthModal';
import { UserDashboard } from './components/UserDashboard';
import { AdminPanel } from './components/AdminPanel';
import { FilterSidebar } from './components/FilterSidebar';
import { FlashDeals } from './components/FlashDeals';
import { useLockBodyScroll } from './hooks/useLockBodyScroll';

import { Sparkles, PackageSearch, Layers, SlidersHorizontal, ArrowRight, ShieldCheck, Zap, Flame, Search, X } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, userProfile, toggleWishlist } = useAuth();
  const { isCartOpen, setIsCartOpen, addToCart } = useCart();
  const { showToast } = useToast();

  const wishlist = userProfile?.wishlist || [];

  // Products from Firestore with SAMPLE_PRODUCTS as default
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Selected Category
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register' | 'forgot'>('login');
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'profile' | 'orders' | 'wishlist' | 'addresses'>('profile');
  const [adminOpen, setAdminOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // --- MOBILE & BROWSER PHYSICAL BACK BUTTON HANDLER FOR MODALS ---
  const isAnyModalOpen = Boolean(
    quickViewProduct ||
    authModalOpen ||
    dashboardOpen ||
    adminOpen ||
    checkoutOpen ||
    confirmedOrder ||
    mobileFilterOpen ||
    isCartOpen
  );

  useLockBodyScroll(isAnyModalOpen);

  const historyModalCountRef = React.useRef(0);

  const closeTopModal = React.useCallback(() => {
    if (confirmedOrder) {
      setConfirmedOrder(null);
      return true;
    }
    if (checkoutOpen) {
      setCheckoutOpen(false);
      return true;
    }
    if (authModalOpen) {
      setAuthModalOpen(false);
      return true;
    }
    if (adminOpen) {
      setAdminOpen(false);
      return true;
    }
    if (dashboardOpen) {
      setDashboardOpen(false);
      return true;
    }
    if (quickViewProduct) {
      setQuickViewProduct(null);
      return true;
    }
    if (isCartOpen) {
      setIsCartOpen(false);
      return true;
    }
    if (mobileFilterOpen) {
      setMobileFilterOpen(false);
      return true;
    }
    return false;
  }, [
    confirmedOrder,
    checkoutOpen,
    authModalOpen,
    adminOpen,
    dashboardOpen,
    quickViewProduct,
    isCartOpen,
    mobileFilterOpen,
    setIsCartOpen,
  ]);

  useEffect(() => {
    const currentOpenCount =
      (confirmedOrder ? 1 : 0) +
      (checkoutOpen ? 1 : 0) +
      (authModalOpen ? 1 : 0) +
      (adminOpen ? 1 : 0) +
      (dashboardOpen ? 1 : 0) +
      (quickViewProduct ? 1 : 0) +
      (isCartOpen ? 1 : 0) +
      (mobileFilterOpen ? 1 : 0);

    if (currentOpenCount > historyModalCountRef.current) {
      window.history.pushState({ isAppModal: true }, '');
      historyModalCountRef.current = currentOpenCount;
    } else if (currentOpenCount < historyModalCountRef.current) {
      historyModalCountRef.current = currentOpenCount;
    }
  }, [
    confirmedOrder,
    checkoutOpen,
    authModalOpen,
    adminOpen,
    dashboardOpen,
    quickViewProduct,
    isCartOpen,
    mobileFilterOpen,
  ]);

  useEffect(() => {
    const handlePopState = () => {
      if (isAnyModalOpen) {
        closeTopModal();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAnyModalOpen, closeTopModal]);

  // Filter options
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    category: 'all',
    brand: 'all',
    minPrice: 0,
    maxPrice: 800000,
    minRating: 0,
    inStockOnly: false,
    sortBy: 'featured',
  });

  // Sync category & search from Navbar to filters
  useEffect(() => {
    setFilters((prev) => ({ ...prev, category: selectedCategory }));
  }, [selectedCategory]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, searchQuery }));
  }, [searchQuery]);

  // Seed data & listen to Realtime Products
  useEffect(() => {
    // Run auto-seed check
    seedInitialDataIfNeeded().then(() => {
      console.log('Seed check complete');
    });

    const unsubscribe = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const list: Product[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(list);
        setLoadingProducts(false);
      },
      (err) => {
        console.warn('Firestore products listener error:', err);
        setLoadingProducts(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Compute available categories and brands dynamically
  const availableCategories = useMemo(() => {
    const setCat = new Set<string>();
    products.forEach((p) => {
      if (p.category) setCat.add(p.category);
    });
    return Array.from(setCat).sort();
  }, [products]);

  // Dynamically filter brands based on selected category so Electronics and Fashion show relevant brands only
  const availableBrands = useMemo(() => {
    const setBr = new Set<string>();
    products.forEach((p) => {
      if (filters.category !== 'all' && p.category !== filters.category) {
        return;
      }
      if (p.brand) setBr.add(p.brand);
    });
    return Array.from(setBr).sort();
  }, [products, filters.category]);

  // Reset selected brand if it does not belong to the newly selected category
  useEffect(() => {
    if (filters.brand !== 'all' && !availableBrands.includes(filters.brand)) {
      setFilters((prev) => ({ ...prev, brand: 'all' }));
    }
  }, [availableBrands, filters.brand]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchCat && !matchDesc) return false;
      }

      // Category
      if (filters.category !== 'all' && p.category !== filters.category) {
        return false;
      }

      // Brand
      if (filters.brand !== 'all' && p.brand !== filters.brand) {
        return false;
      }

      // Price
      const effPrice = p.discountPrice ?? p.price;
      if (effPrice > filters.maxPrice) {
        return false;
      }

      // Rating
      if (p.rating < filters.minRating) {
        return false;
      }

      // Stock
      if (filters.inStockOnly && p.stock <= 0) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.discountPrice ?? a.price;
      const priceB = b.discountPrice ?? b.price;

      if (filters.sortBy === 'price-asc') return priceA - priceB;
      if (filters.sortBy === 'price-desc') return priceB - priceA;
      if (filters.sortBy === 'rating-desc') return b.rating - a.rating;
      if (filters.sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      
      // Default: featured first
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, filters]);

  const isSearching = Boolean(searchQuery.trim() || filters.searchQuery.trim());
  const isCategoryFiltered = selectedCategory !== 'all' || filters.category !== 'all';
  const isSearchOrFilterActive = isSearching || isCategoryFiltered;

  // Auto scroll to top when user starts searching or filtering
  useEffect(() => {
    if (isSearchOrFilterActive) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchQuery, selectedCategory, filters.searchQuery, filters.category]);

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'all',
      brand: 'all',
      minPrice: 0,
      maxPrice: 800000,
      minRating: 0,
      inStockOnly: false,
      sortBy: 'featured',
    });
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const handleOpenAuth = (view: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalView(view);
    setAuthModalOpen(true);
  };

  const handleOpenDashboard = (tab: 'profile' | 'orders' | 'wishlist' | 'addresses' = 'profile') => {
    setDashboardTab(tab);
    setDashboardOpen(true);
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      showToast('Please sign in or create an account to proceed with checkout', 'info');
      handleOpenAuth('login');
    } else {
      setCheckoutOpen(true);
    }
  };

  const handleBuyNowFromModal = (prod: Product, qty: number, selectedColor?: string) => {
    addToCart(prod, qty, selectedColor);
    setQuickViewProduct(null);
    setIsCartOpen(false);
    if (!user) {
      showToast('Please sign in or create an account to proceed with checkout', 'info');
      handleOpenAuth('login');
    } else {
      setCheckoutOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300">
      
      {/* Header Navigation */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenDashboard={handleOpenDashboard}
        onOpenAdmin={() => setAdminOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onToggleMobileFilter={() => setMobileFilterOpen(!mobileFilterOpen)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* If user is actively searching or filtering a category, show Search Banner at the top and hide Hero/FlashDeals */}
        {isSearchOrFilterActive ? (
          <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-indigo-950 border border-amber-500/30 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-500/30 shadow-sm">
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>{isSearching ? 'Search Mode' : 'Category View'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100">
                {isSearching ? (
                  <>Results for <span className="text-amber-400">"{searchQuery || filters.searchQuery}"</span></>
                ) : (
                  <>Browsing <span className="text-amber-400">{selectedCategory !== 'all' ? selectedCategory : filters.category}</span></>
                )}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Found <strong className="text-amber-400">{filteredProducts.length}</strong> matching products
              </p>
            </div>

            <button
              onClick={resetFilters}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shrink-0"
            >
              <X className="w-4 h-4 text-rose-400" />
              <span>Clear Search & Filters</span>
            </button>
          </div>
        ) : (
          <>
            {/* Featured Hero Banner */}
            <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-500/10 via-slate-100 to-indigo-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950 border border-amber-500/20 dark:border-slate-800 p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider shadow-sm">
                  <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Flagship Tech & Luxury Collection</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-slate-100">
                  Next-Gen Tech.<br />
                  <span className="bg-gradient-to-r from-amber-600 via-indigo-600 to-indigo-900 dark:from-amber-400 dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent font-black">
                    Unmatched Craft.
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  Explore our handpicked range of titanium smartphones, audiophile noise-canceling headsets, and Italian cashmere apparel. Live stock updates & express courier delivery.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      const el = document.getElementById('flash-deals-section') || document.querySelector('section');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        window.scrollTo({ top: 500, behavior: 'smooth' });
                      }
                    }}
                    className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Flame className="w-4 h-4 fill-slate-950" />
                    <span>Explore Flash Deals</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold pl-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>2 Year Guarantee</span>
                  </div>
                </div>
              </div>

              <div className="relative w-full lg:w-88 aspect-video lg:aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-2xl shrink-0 group cursor-pointer" onClick={() => {
                const feat = products.find(p => p.id === 'iphone-15-pro-max') || products[0];
                if (feat) setQuickViewProduct(feat);
              }}>
                <div className="absolute -inset-1 bg-gradient-to-tr from-amber-500/30 via-indigo-500/30 to-amber-400/30 rounded-2xl blur-md group-hover:blur-lg opacity-80 group-hover:opacity-100 transition duration-500" />
                <img
                  src="https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=1000&q=80"
                  alt="iPhone 15 Pro Max Titanium Flagship"
                  className="relative w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Dark Gradient Overlay over image */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20 p-5 flex flex-col justify-between z-10">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1">
                      <span>★ 4.9</span>
                      <span>Flagship Pick</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-950/80 border border-emerald-400/60 text-emerald-400 text-[10px] font-bold backdrop-blur-md">
                      In Stock
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-widest drop-shadow-md image-overlay-text-amber">
                        Featured Technology
                      </p>
                    </div>
                    <p className="text-base font-black leading-tight drop-shadow-md group-hover:text-amber-200 transition-colors image-overlay-text-white">
                      iPhone 15 Pro Max Titanium
                    </p>
                    <div className="pt-1 flex items-center justify-end text-xs font-semibold">
                      <span className="text-[11px] font-extrabold flex items-center gap-1 group-hover:translate-x-1 transition-transform image-overlay-text-amber">
                        <span>Quick View</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Flash Deals Section */}
            <FlashDeals
              products={products}
              onQuickView={(p) => setQuickViewProduct(p)}
              onAddToCart={(p) => addToCart(p)}
              toggleWishlist={(id) => {
                if (!user) handleOpenAuth('login');
                else toggleWishlist(id);
              }}
              wishlist={wishlist}
            />
          </>
        )}

        {/* Content Layout Grid (Sidebar + Product Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Filter Sidebar (3 Cols) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl scrollbar-thin scrollbar-thumb-slate-800">
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              availableBrands={availableBrands}
              availableCategories={availableCategories}
              onResetFilters={resetFilters}
            />
          </aside>

          {/* Product Grid Section (9 Cols) */}
          <section className="lg:col-span-9 space-y-6">
            
            {/* Header / Active filters counter */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
              <div>
                <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
                  <span>Product Catalog</span>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    {filteredProducts.length} items
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing results for {filters.category === 'all' ? 'All Categories' : filters.category}
                </p>
              </div>

              {/* Quick sort dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Sort:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
                  className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-500"
                >
                  <option value="featured">Featured Picks</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Highest Rated</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loadingProducts ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-bold text-slate-400">Loading catalog from Firestore...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-16 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
                <PackageSearch className="w-16 h-16 text-slate-700 mx-auto" />
                <div>
                  <h3 className="text-base font-bold text-slate-200">No products match your filters</h3>
                  <p className="text-xs text-slate-500 mt-1">Try relaxing your search terms or price range.</p>
                </div>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl hover:bg-amber-400 transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            )}

          </section>

        </div>

      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <CartDrawer onProceedToCheckout={handleProceedToCheckout} />

      <ProductDetailModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onBuyNow={handleBuyNowFromModal}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onOrderSuccess={(ord) => setConfirmedOrder(ord)}
      />

      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onViewDashboardOrders={() => {
          setConfirmedOrder(null);
          handleOpenDashboard('orders');
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialView={authModalView}
      />

      <UserDashboard
        isOpen={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
        initialTab={dashboardTab}
        onQuickViewProduct={(p) => setQuickViewProduct(p)}
      />

      <AdminPanel
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
      />

      {/* Mobile Filter Drawer Overlay */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md lg:hidden flex justify-end">
          <div className="w-full max-w-xs bg-slate-900 h-full p-4">
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              availableBrands={availableBrands}
              availableCategories={availableCategories}
              onResetFilters={resetFilters}
              isMobileDrawer
              onCloseMobile={() => setMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <ThemeProvider>
            <MainApp />
          </ThemeProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
