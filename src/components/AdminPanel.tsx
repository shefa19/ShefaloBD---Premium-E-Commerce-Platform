import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  BarChart3,
  Package,
  ShoppingBag,
  Users,
  Tags,
  Ticket,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Database,
  RefreshCw,
  Search,
  Eye,
  Flame,
  Clock
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, Order, UserProfile, Category, Coupon } from '../types';
import { seedInitialDataIfNeeded, forceSeedSampleData } from '../lib/seedFirestore';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../lib/formatters';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders' | 'users' | 'categories' | 'coupons' | 'flashdeals'>('stats');

  // Real-time Collections State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Modals & Form State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    discountPrice: undefined,
    category: 'Electronics',
    brand: '',
    sku: '',
    stock: 10,
    images: ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 12,
    isFeatured: true,
    isFlashDeal: false,
    flashDealBadge: '30% OFF',
    flashDealSold: 12,
    isActive: true,
  });

  // Category modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '' });

  // Coupon modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: '', type: 'percentage' as 'percentage' | 'fixed', value: 20, minOrder: 100 });

  // Flash Deals Timer Settings State
  const [timerHoursInput, setTimerHoursInput] = useState<number>(4);
  const [timerMinutesInput, setTimerMinutesInput] = useState<number>(59);
  const [currentTimerTarget, setCurrentTimerTarget] = useState<number>(0);

  // Custom Delete Confirmation Dialog State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
  });

  // Load Realtime Collections
  useEffect(() => {
    if (!isOpen) return;

    const unSubProds = onSnapshot(collection(db, 'products'), (snapshot) => {
      const list: Product[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Product));
      setProducts(list);
    });

    const unSubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Order));
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setOrders(list);
    });

    const unSubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((doc) => list.push({ uid: doc.id, ...doc.data() } as UserProfile));
      setUsersList(list);
    });

    const unSubCats = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const list: Category[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Category));
      setCategories(list);
    });

    const unSubCoupons = onSnapshot(collection(db, 'coupons'), (snapshot) => {
      const list: Coupon[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Coupon));
      setCoupons(list);
    });

    const unSubTimer = onSnapshot(doc(db, 'settings', 'flashDeals'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.hours !== undefined) setTimerHoursInput(Number(data.hours));
        if (data.minutes !== undefined) setTimerMinutesInput(Number(data.minutes));
        if (data.targetTimestamp) setCurrentTimerTarget(Number(data.targetTimestamp));
      }
    });

    return () => {
      unSubProds();
      unSubOrders();
      unSubUsers();
      unSubCats();
      unSubCoupons();
      unSubTimer();
    };
  }, [isOpen]);

  const handleSaveFlashDealTimer = async () => {
    try {
      const hours = Math.max(0, Number(timerHoursInput) || 0);
      const minutes = Math.max(0, Math.min(59, Number(timerMinutesInput) || 0));
      const targetTimestamp = Date.now() + (hours * 3600 + minutes * 60) * 1000;

      await setDoc(doc(db, 'settings', 'flashDeals'), {
        hours,
        minutes,
        targetTimestamp,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      showToast(`Flash Deals timer set to ${hours}h ${minutes}m!`, 'success');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/flashDeals');
    }
  };

  if (!isOpen) return null;

  // Revenue stats
  const totalSalesRevenue = orders.reduce((acc, ord) => acc + (ord.totalAmount || 0), 0);

  // Product CRUD
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const prodId = editingProduct ? editingProduct.id : 'prod-' + Date.now();
      const slug = (productForm.name || 'product').toLowerCase().replace(/\s+/g, '-');
      
      const payload: Product = {
        id: prodId,
        name: productForm.name || 'New Product',
        slug: slug,
        description: productForm.description || '',
        price: Number(productForm.price) || 0,
        discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : undefined,
        discountPercent: productForm.discountPrice && productForm.price
          ? Math.round(((Number(productForm.price) - Number(productForm.discountPrice)) / Number(productForm.price)) * 100)
          : 0,
        category: productForm.category || 'Electronics',
        brand: productForm.brand || 'ShefaloBD',
        sku: productForm.sku || 'SKU-' + Date.now(),
        stock: Number(productForm.stock) || 0,
        images: productForm.images || ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80'],
        thumbnail: productForm.thumbnail || productForm.images?.[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
        rating: productForm.rating || 4.8,
        reviewsCount: productForm.reviewsCount || 10,
        isFeatured: Boolean(productForm.isFeatured),
        isFlashDeal: Boolean(productForm.isFlashDeal),
        flashDealBadge: productForm.flashDealBadge || '30% OFF',
        flashDealSold: Number(productForm.flashDealSold) || 12,
        isActive: Boolean(productForm.isActive),
        createdAt: editingProduct?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'products', prodId), payload);
      showToast(editingProduct ? 'Product updated!' : 'Product added successfully!', 'success');
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'products');
    }
  };

  const handleToggleFlashDeal = async (product: Product) => {
    try {
      const nextStatus = !product.isFlashDeal;
      await updateDoc(doc(db, 'products', product.id), {
        isFlashDeal: nextStatus,
        flashDealBadge: product.flashDealBadge || '30% OFF',
        flashDealSold: product.flashDealSold || 15,
        updatedAt: new Date().toISOString(),
      });
      showToast(`${product.name} ${nextStatus ? 'added to' : 'removed from'} Flash Deals!`, 'success');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
    }
  };

  const handleUpdateFlashDealInfo = async (productId: string, badge: string, sold: number) => {
    try {
      await updateDoc(doc(db, 'products', productId), {
        flashDealBadge: badge,
        flashDealSold: sold,
        updatedAt: new Date().toISOString(),
      });
      showToast('Flash Deal parameters updated!', 'success');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `products/${productId}`);
    }
  };

  const promptDelete = (title: string, message: string, action: () => Promise<void>) => {
    setDeleteConfirm({
      isOpen: true,
      title,
      message,
      onConfirm: action,
    });
  };

  const handleDeleteProduct = (productId: string) => {
    promptDelete(
      'Delete Product?',
      'Are you sure you want to delete this product from the catalog?',
      async () => {
        try {
          await deleteDoc(doc(db, 'products', productId));
          showToast('Product deleted successfully', 'info');
        } catch (err: any) {
          handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
        }
      }
    );
  };

  // Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, status: Order['orderStatus']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        orderStatus: status,
        updatedAt: new Date().toISOString(),
      });
      showToast(`Order status updated to ${status}`, 'success');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  // Delete Order
  const handleDeleteOrder = (orderId: string) => {
    promptDelete(
      'Delete Order?',
      `Are you sure you want to delete order #${orderId}?`,
      async () => {
        try {
          await deleteDoc(doc(db, 'orders', orderId));
          showToast('Order deleted successfully', 'info');
        } catch (err: any) {
          handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`);
        }
      }
    );
  };

  // User Role Update
  const handleToggleAdminRole = async (targetUser: UserProfile) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      await updateDoc(doc(db, 'users', targetUser.uid), {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });
      showToast(`User role updated to ${newRole}`, 'success');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${targetUser.uid}`);
    }
  };

  // Category Save & Delete
  const handleDeleteCategory = (catId: string) => {
    promptDelete(
      'Delete Category?',
      'Are you sure you want to delete this category?',
      async () => {
        try {
          await deleteDoc(doc(db, 'categories', catId));
          showToast('Category deleted successfully', 'info');
        } catch (err: any) {
          handleFirestoreError(err, OperationType.DELETE, `categories/${catId}`);
        }
      }
    );
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const catId = catForm.slug || 'cat-' + Date.now();
      const newCat: Category = {
        id: catId,
        name: catForm.name,
        slug: catForm.slug || catForm.name.toLowerCase().replace(/\s+/g, '-'),
        description: catForm.description,
        isActive: true,
      };
      await setDoc(doc(db, 'categories', catId), newCat);
      showToast('Category created!', 'success');
      setIsCatModalOpen(false);
      setCatForm({ name: '', slug: '', description: '' });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'categories');
    }
  };

  // Coupon Save & Delete
  const handleDeleteCoupon = (couponId: string) => {
    promptDelete(
      'Delete Coupon?',
      'Are you sure you want to delete this promo coupon?',
      async () => {
        try {
          await deleteDoc(doc(db, 'coupons', couponId));
          showToast('Coupon deleted successfully', 'info');
        } catch (err: any) {
          handleFirestoreError(err, OperationType.DELETE, `coupons/${couponId}`);
        }
      }
    );
  };

  // Delete User
  const handleDeleteUser = (uid: string) => {
    promptDelete(
      'Delete User Record?',
      'Are you sure you want to remove this user profile from database?',
      async () => {
        try {
          await deleteDoc(doc(db, 'users', uid));
          showToast('User record removed', 'info');
        } catch (err: any) {
          handleFirestoreError(err, OperationType.DELETE, `users/${uid}`);
        }
      }
    );
  };

  // Coupon Save
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const code = couponForm.code.toUpperCase().trim();
      const newCoupon: Coupon = {
        id: code,
        code: code,
        type: couponForm.type,
        value: Number(couponForm.value),
        minOrder: Number(couponForm.minOrder),
        isActive: true,
      };
      await setDoc(doc(db, 'coupons', code), newCoupon);
      showToast(`Coupon ${code} created!`, 'success');
      setIsCouponModalOpen(false);
      setCouponForm({ code: '', type: 'percentage', value: 20, minOrder: 100 });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'coupons');
    }
  };

  const handleManualSeed = async () => {
    await forceSeedSampleData();
    showToast('All sample products & categories synced into Firestore!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto h-[90vh] max-h-[90vh] flex flex-col">
        
        {/* Top Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
                <span>ShefaloBD Admin Dashboard</span>
                <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black uppercase">Live DB</span>
              </h2>
              <p className="text-xs text-slate-400">Manage products, orders, categories, coupons and users</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualSeed}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
              title="Seed sample products and categories"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Seed Sample Data</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar Nav Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 sm:px-6 gap-2 overflow-x-auto shrink-0 z-10 py-1">
          {[
            { id: 'stats', name: 'Overview Stats', icon: BarChart3 },
            { id: 'products', name: `Products (${products.length})`, icon: Package },
            { id: 'orders', name: `Orders (${orders.length})`, icon: ShoppingBag },
            { id: 'users', name: `Users (${usersList.length})`, icon: Users },
            { id: 'categories', name: `Categories (${categories.length})`, icon: Tags },
            { id: 'coupons', name: `Coupons (${coupons.length})`, icon: Ticket },
            { id: 'flashdeals', name: `Flash Deals (${products.filter((p) => p.isFlashDeal).length})`, icon: Flame },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 min-h-0">
          
          {/* TAB 1: OVERVIEW STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Total Sales Revenue</span>
                  <p className="text-2xl font-black text-emerald-400">{formatPrice(totalSalesRevenue)}</p>
                </div>
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Total Orders</span>
                  <p className="text-2xl font-black text-amber-400">{orders.length}</p>
                </div>
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Catalog Products</span>
                  <p className="text-2xl font-black text-indigo-400">{products.length}</p>
                </div>
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Registered Users</span>
                  <p className="text-2xl font-black text-slate-100">{usersList.length}</p>
                </div>
              </div>

              {/* Quick Recent Activity */}
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-200">Recent Customer Orders</h3>
                <div className="space-y-2">
                  {orders.slice(0, 5).map((ord) => (
                    <div key={ord.id} className="flex items-center justify-between text-xs p-3 bg-slate-900 rounded-xl">
                      <div>
                        <span className="font-mono font-bold text-amber-400">#{ord.id}</span>
                        <span className="text-slate-400 ml-2">• {ord.customerName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-100">{formatPrice(ord.totalAmount)}</span>
                        <span className="uppercase text-[10px] font-black px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {ord.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-100">Catalog Management</h3>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      name: '',
                      description: '',
                      price: 0,
                      discountPrice: undefined,
                      category: 'Electronics',
                      brand: 'ShefaloBD',
                      sku: 'SKU-' + Date.now(),
                      stock: 10,
                      images: ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80'],
                      thumbnail: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
                      rating: 4.8,
                      reviewsCount: 10,
                      isFeatured: false,
                      isActive: true,
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Featured</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-900/50">
                        <td className="p-3 flex items-center gap-3">
                          <img src={p.thumbnail || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-900" />
                          <div>
                            <p className="font-bold text-slate-100">{p.name}</p>
                            <p className="text-[11px] text-slate-500">{p.brand} • {p.sku}</p>
                          </div>
                        </td>
                        <td className="p-3">{p.category}</td>
                        <td className="p-3 font-bold text-slate-100">
                          {formatPrice(p.discountPrice ?? p.price)}
                        </td>
                        <td className="p-3 font-bold">
                          <span className={p.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="p-3">
                          {p.isFeatured ? (
                            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-bold">Yes</span>
                          ) : (
                            <span className="text-slate-600">No</span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setProductForm(p);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-100">Customer Orders Control</h3>

              <div className="space-y-3">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div>
                        <span className="font-mono font-bold text-amber-400 text-sm">#{ord.id}</span>
                        <span className="text-slate-400 ml-2">• Customer: {ord.customerName} ({ord.customerPhone})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-semibold">Change Status:</span>
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as any)}
                          className="bg-slate-900 border border-slate-800 rounded-lg text-amber-400 font-bold px-2 py-1 text-xs focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered (Unlocks Reviews)</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleDeleteOrder(ord.id)}
                          title="Delete Order"
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
                      <div>
                        <p><strong className="text-slate-300">Items:</strong> {ord.items?.map(i => `${i.productName} (x${i.quantity})`).join(', ')}</p>
                        <p><strong className="text-slate-300">Payment:</strong> {ord.paymentMethod.toUpperCase()} ({ord.paymentStatus})</p>
                      </div>
                      <div>
                        <p><strong className="text-slate-300">Address:</strong> {ord.shippingAddress?.addressLine1}, {ord.shippingAddress?.city}</p>
                        <p><strong className="text-slate-300">Total:</strong> <span className="text-amber-400 font-bold">{formatPrice(ord.totalAmount)}</span></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: USERS MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-100">Registered Users</h3>

              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Role</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {usersList.map((u) => (
                      <tr key={u.uid} className="hover:bg-slate-900/40">
                        <td className="p-3 font-bold text-slate-100">{u.name || 'User'}</td>
                        <td className="p-3 text-slate-400">{u.email}</td>
                        <td className="p-3 text-slate-400">{u.phone || 'N/A'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => handleToggleAdminRole(u)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold"
                          >
                            Set {u.role === 'admin' ? 'User' : 'Admin'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.uid)}
                            title="Delete User Record"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-100">Categories</h3>
                <button
                  onClick={() => setIsCatModalOpen(true)}
                  className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((c) => (
                  <div key={c.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs flex justify-between items-start gap-2">
                    <div>
                      <p className="font-bold text-amber-400">{c.name}</p>
                      <p className="text-slate-500 font-mono">slug: {c.slug}</p>
                      <p className="text-slate-400 mt-1">{c.description || 'No description'}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      title="Delete Category"
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-100">Promo Coupons</h3>
                <button
                  onClick={() => setIsCouponModalOpen(true)}
                  className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Promo Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {coupons.map((coup) => (
                  <div key={coup.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1 flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 font-mono font-bold rounded uppercase">
                        {coup.code}
                      </span>
                      <p className="text-slate-200 font-bold mt-2">
                        Discount: {coup.type === 'percentage' ? `${coup.value}% OFF` : `${formatPrice(coup.value)} OFF`}
                      </p>
                      <p className="text-slate-500">Min Order: {formatPrice(coup.minOrder || 0)}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCoupon(coup.id)}
                      title="Delete Coupon"
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: FLASH DEALS MANAGEMENT */}
          {activeTab === 'flashdeals' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-500 text-white shadow-md">
                    <Flame className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Flash Deals Manager</h3>
                    <p className="text-xs text-slate-400">Toggle products into the home screen Flash Deals section and customize discount badges.</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-semibold block">Active Flash Deals</span>
                  <span className="text-xl font-black text-rose-400">{products.filter((p) => p.isFlashDeal).length} Items</span>
                </div>
              </div>

              {/* Flash Deals Timer Control Card */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">Flash Deals Countdown Timer Control</h4>
                      <p className="text-xs text-slate-400">Set the remaining hours and minutes for the live countdown timer on the homepage.</p>
                    </div>
                  </div>
                  {currentTimerTarget > 0 && (
                    <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-mono font-bold text-amber-400 shrink-0">
                      Live Target Sync Active
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Hours)</label>
                    <input
                      type="number"
                      min="0"
                      max="168"
                      value={timerHoursInput}
                      onChange={(e) => setTimerHoursInput(parseInt(e.target.value) || 0)}
                      className="w-28 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={timerMinutesInput}
                      onChange={(e) => setTimerMinutesInput(parseInt(e.target.value) || 0)}
                      className="w-28 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveFlashDealTimer}
                    className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Set & Start Flash Deals Timer</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((prod) => {
                  return (
                    <div
                      key={prod.id}
                      className={`p-4 rounded-2xl border transition-all text-xs flex flex-col justify-between gap-3 ${
                        prod.isFlashDeal
                          ? 'bg-rose-950/20 border-rose-500/40 shadow-lg'
                          : 'bg-slate-950 border-slate-800 opacity-80'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={prod.thumbnail}
                          alt={prod.name}
                          className="w-16 h-16 rounded-xl object-contain bg-slate-900 border border-slate-800 p-1 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase font-bold text-slate-500">{prod.category}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                prod.isFlashDeal
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {prod.isFlashDeal ? 'Flash Deal Active' : 'Normal Catalog'}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-100 truncate mt-0.5">{prod.name}</h4>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="font-bold text-amber-400">
                              {formatPrice(prod.discountPrice && prod.discountPrice < prod.price ? prod.discountPrice : prod.price)}
                            </span>
                            {prod.discountPrice && prod.discountPrice < prod.price && (
                              <span className="text-slate-500 line-through text-[11px]">{formatPrice(prod.price)}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Controls Row */}
                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleFlashDeal(prod)}
                          className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                            prod.isFlashDeal
                              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>{prod.isFlashDeal ? 'Remove from Flash Deals' : 'Add to Flash Deals'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(prod);
                            setProductForm(prod);
                            setIsProductModalOpen(true);
                          }}
                          className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Details</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Product Add/Edit Modal Sub-Overlay */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveProduct} className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Product Name *</label>
                <input
                  type="text"
                  required
                  value={productForm.name || ''}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                <select
                  value={productForm.category || 'Electronics'}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Luxury Fashion">Luxury Fashion</option>
                  <option value="Wearables">Wearables</option>
                  <option value="Cameras & Optics">Cameras & Optics</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Price (৳) *</label>
                <input
                  type="number"
                  required
                  value={productForm.price || 0}
                  onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Discounted Price (৳)</label>
                <input
                  type="number"
                  placeholder="Optional sale price"
                  value={productForm.discountPrice || ''}
                  onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Brand</label>
                <input
                  type="text"
                  value={productForm.brand || ''}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Stock Quantity *</label>
                <input
                  type="number"
                  required
                  value={productForm.stock || 0}
                  onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1 font-semibold">Image URL</label>
                <input
                  type="text"
                  value={productForm.thumbnail || ''}
                  onChange={(e) => setProductForm({ ...productForm, thumbnail: e.target.value, images: [e.target.value] })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1 font-semibold">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description || ''}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              {/* Flash Deal Settings Block */}
              <div className="sm:col-span-2 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-500" />
                    <span className="font-bold text-slate-100">Flash Deal Settings</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(productForm.isFlashDeal)}
                      onChange={(e) => setProductForm({ ...productForm, isFlashDeal: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-500 bg-slate-950 border-slate-800 focus:ring-rose-500"
                    />
                    <span className="font-bold text-rose-400 text-xs">Enable as Flash Deal</span>
                  </label>
                </div>

                {productForm.isFlashDeal && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-rose-500/20">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Flash Deal Badge Text</label>
                      <input
                        type="text"
                        placeholder="e.g. 30% OFF or HOT DEAL"
                        value={productForm.flashDealBadge || ''}
                        onChange={(e) => setProductForm({ ...productForm, flashDealBadge: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Items Sold Count</label>
                      <input
                        type="number"
                        placeholder="e.g. 22"
                        value={productForm.flashDealSold || 0}
                        onChange={(e) => setProductForm({ ...productForm, flashDealSold: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Modal Sub-Overlay */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveCategory} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100">Add New Category</h3>
            <input
              type="text"
              placeholder="Category Name *"
              required
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
            />
            <input
              type="text"
              placeholder="Slug (optional)"
              value={catForm.slug}
              onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
            />
            <textarea
              placeholder="Description"
              value={catForm.description}
              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsCatModalOpen(false)} className="px-3 py-2 bg-slate-800 rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl font-bold">Create</button>
            </div>
          </form>
        </div>
      )}

      {/* Coupon Modal Sub-Overlay */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveCoupon} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100">Add Promo Coupon</h3>
            <input
              type="text"
              placeholder="Coupon Code (e.g. SUMMER30) *"
              required
              value={couponForm.code}
              onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 uppercase"
            />
            <select
              value={couponForm.type}
              onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
            >
              <option value="percentage">Percentage Off (%)</option>
              <option value="fixed">Fixed Amount Off (৳)</option>
            </select>
            <input
              type="number"
              placeholder="Discount Value *"
              required
              value={couponForm.value}
              onChange={(e) => setCouponForm({ ...couponForm, value: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
            />
            <input
              type="number"
              placeholder="Min Order Amount (৳)"
              value={couponForm.minOrder}
              onChange={(e) => setCouponForm({ ...couponForm, minOrder: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsCouponModalOpen(false)} className="px-3 py-2 bg-slate-800 rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl font-bold">Save Coupon</button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal Sub-Overlay */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">{deleteConfirm.title}</h4>
                <p className="text-slate-400 text-xs mt-0.5">{deleteConfirm.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const action = deleteConfirm.onConfirm;
                  setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
                  await action();
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-slate-950 font-black rounded-xl transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
