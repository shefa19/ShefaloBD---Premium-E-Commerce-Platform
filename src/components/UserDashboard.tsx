import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Package,
  Heart,
  MapPin,
  X,
  Plus,
  Trash2,
  Check,
  Phone,
  Mail,
  Calendar,
  Clock,
  ExternalLink,
  ShoppingBag,
  ShieldCheck,
  Edit3,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Order, Product, Address } from '../types';
import { formatPrice } from '../lib/formatters';
import { BANGLADESH_DIVISIONS, getDistrictsForDivision } from '../lib/bangladeshLocations';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface UserDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'orders' | 'wishlist' | 'addresses';
  onQuickViewProduct: (prod: Product) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  isOpen,
  onClose,
  initialTab = 'profile',
  onQuickViewProduct,
}) => {
  useLockBodyScroll(isOpen);
  const { user, userProfile, updateProfileData, toggleWishlist, addAddress, removeAddress, setDefaultAddress } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'addresses'>(initialTab);

  // Profile Edit State
  const [profileName, setProfileName] = useState(userProfile?.name || '');
  const [profilePhone, setProfilePhone] = useState(userProfile?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP)', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image size should be less than 10MB', 'error');
      return;
    }

    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 350;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            await updateProfileData({ photoURL: dataUrl });
            showToast('Profile photo updated from device!', 'success');
          }
        } catch (err) {
          console.error("Photo upload error:", err);
          showToast('Failed to process image. Please try another file.', 'error');
        } finally {
          setUploadingPhoto(false);
        }
      };
      img.onerror = () => {
        setUploadingPhoto(false);
        showToast('Invalid image file format', 'error');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    setUploadingPhoto(true);
    await updateProfileData({ photoURL: '' });
    setUploadingPhoto(false);
    showToast('Profile photo removed', 'info');
  };

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Wishlist Products State
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  // Add Address Form State
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: userProfile?.name || '',
    phone: userProfile?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: 'Dhaka',
    state: 'Dhaka Division',
    zipCode: '1213',
    country: 'Bangladesh',
    isDefault: false,
  });

  const availableDistrictsForNewAddr = getDistrictsForDivision(newAddr.state);

  const handleNewAddrDivisionChange = (div: string) => {
    const dists = getDistrictsForDivision(div);
    const defaultCity = dists.includes(newAddr.city) ? newAddr.city : dists[0];
    setNewAddr((prev) => ({
      ...prev,
      state: div,
      city: defaultCity,
    }));
  };

  useEffect(() => {
    if (userProfile) {
      setProfileName(userProfile.name || '');
      setProfilePhone(userProfile.phone || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Load User Orders Realtime
  useEffect(() => {
    if (!user || !isOpen) return;

    setLoadingOrders(true);
    const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Order[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Order);
        });
        // Sort by date desc
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setOrders(list);
        setLoadingOrders(false);
      },
      (error) => {
        console.warn('User orders snapshot warning:', error.message);
        setLoadingOrders(false);
      }
    );

    return () => unsubscribe();
  }, [user, isOpen]);

  // Load Wishlist Products
  useEffect(() => {
    if (!userProfile?.wishlist || userProfile.wishlist.length === 0 || !isOpen) {
      setWishlistProducts([]);
      setLoadingWishlist(false);
      return;
    }

    setLoadingWishlist(true);
    const fetchWishlistProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const allProds: Product[] = [];
        querySnapshot.forEach((doc) => {
          if (userProfile.wishlist?.includes(doc.id)) {
            allProds.push({ id: doc.id, ...doc.data() } as Product);
          }
        });
        setWishlistProducts(allProds);
      } catch (err) {
        console.error("Wishlist products fetch error:", err);
      } finally {
        setLoadingWishlist(false);
      }
    };

    fetchWishlistProducts();
  }, [userProfile?.wishlist, isOpen]);

  if (!isOpen || !user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    await updateProfileData({
      name: profileName,
      phone: profilePhone,
    });
    setIsUpdatingProfile(false);
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.addressLine1 || !newAddr.city) {
      showToast('Please provide a valid street address and city', 'error');
      return;
    }
    await addAddress(newAddr);
    setShowAddAddressForm(false);
    setNewAddr({
      name: userProfile?.name || '',
      phone: userProfile?.phone || '',
      addressLine1: '',
      addressLine2: '',
      city: 'Dhaka',
      state: 'Dhaka Division',
      zipCode: '1213',
      country: 'Bangladesh',
      isDefault: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile.name || 'User'}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center text-lg shadow-md shrink-0">
                {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <h2 className="text-xl font-black text-slate-100">{userProfile?.name || 'User Account'}</h2>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/30 px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'profile'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'orders'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'wishlist'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Wishlist ({userProfile?.wishlist?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'addresses'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Addresses ({userProfile?.addresses?.length || 0})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-xl space-y-6">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Personal Information</span>
              </h3>

              {/* Profile Photo Upload Section */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group shrink-0">
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt={userProfile.name || 'User Photo'}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/60 shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center text-2xl shadow-lg border-2 border-slate-700">
                      {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition-all group-hover:scale-105"
                    title="Upload Photo from Device"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Profile Photo</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Upload a photo from your device (JPG, PNG, WEBP max 10MB).
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoFileSelect}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{uploadingPhoto ? 'Uploading...' : 'Choose File from Device'}</span>
                    </button>

                    {userProfile?.photoURL && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={uploadingPhoto}
                        className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Email Address (Read-Only)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email || ''}
                    className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800/50 rounded-xl text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+880 1700-000000"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-amber-500/10"
                  >
                    {isUpdatingProfile ? 'Saving...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-100">Your Purchase Orders</h3>

              {loadingOrders ? (
                <p className="text-xs text-slate-400 py-8 text-center">Loading orders...</p>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800">
                  <Package className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-300">No orders placed yet</p>
                  <p className="text-xs text-slate-500 mt-1">Start shopping and your order history will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 text-xs">
                        <div>
                          <span className="text-slate-500 block">Order ID</span>
                          <span className="font-mono font-bold text-amber-400">#{ord.id}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Date</span>
                          <span className="font-medium text-slate-300">
                            {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Status</span>
                          <span className={`font-extrabold uppercase px-2 py-0.5 rounded text-[10px] ${
                            ord.orderStatus === 'delivered'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {ord.orderStatus}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Total</span>
                          <span className="font-black text-slate-100 text-sm">
                            {formatPrice(ord.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {ord.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs p-2.5 bg-slate-900/90 rounded-xl border border-slate-800/60">
                            <div className="flex items-center gap-3">
                              <img src={item.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-950" />
                              <div>
                                <p className="font-bold text-slate-200">{item.productName}</p>
                                <p className="text-slate-500">Qty: {item.quantity} • {formatPrice(item.price)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {ord.orderStatus === 'delivered' && (
                                <button
                                  onClick={() => {
                                    onClose();
                                    onQuickViewProduct({
                                      id: item.productId,
                                      name: item.productName,
                                      slug: item.productId,
                                      description: 'Delivered item from your order history.',
                                      price: item.price,
                                      category: 'Electronics',
                                      brand: 'Official',
                                      sku: item.productId,
                                      stock: 10,
                                      images: [item.productImage],
                                      thumbnail: item.productImage,
                                      rating: 5,
                                      reviewsCount: 1,
                                      isActive: true
                                    });
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950 font-black text-[11px] transition-all flex items-center gap-1 shadow-sm"
                                >
                                  <span>★ Write Review</span>
                                </button>
                              )}
                              <span className="font-bold text-slate-100">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-100">Saved Wishlist Items</h3>

              {loadingWishlist ? (
                <p className="text-xs text-slate-400 py-8 text-center">Loading wishlist...</p>
              ) : wishlistProducts.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800">
                  <Heart className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-300">Your wishlist is empty</p>
                  <p className="text-xs text-slate-500 mt-1">Tap the heart icon on any product to save it here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlistProducts.map((p) => {
                    const price = p.discountPrice ?? p.price;
                    return (
                      <div key={p.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900">
                          <img src={p.thumbnail || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => toggleWishlist(p.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 text-rose-400 hover:text-rose-300"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-100 line-clamp-1">{p.name}</p>
                          <p className="text-xs font-black text-amber-400 mt-1">{formatPrice(price)}</p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => onQuickViewProduct(p)}
                            className="flex-1 py-1.5 text-[11px] font-bold bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-200"
                          >
                            View
                          </button>
                          <button
                            onClick={() => addToCart(p, 1)}
                            className="flex-1 py-1.5 text-[11px] font-bold bg-amber-500 hover:bg-amber-400 rounded-xl text-slate-950 flex items-center justify-center gap-1"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-100">Shipping Addresses</h3>
                <button
                  onClick={() => setShowAddAddressForm(!showAddAddressForm)}
                  className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Address</span>
                </button>
              </div>

              {/* Add Address Form */}
              {showAddAddressForm && (
                <form onSubmit={handleCreateAddress} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
                  <h4 className="font-bold text-amber-400">New Delivery Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Recipient Name *"
                      required
                      value={newAddr.name}
                      onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      required
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 1 *"
                      required
                      value={newAddr.addressLine1}
                      onChange={(e) => setNewAddr({ ...newAddr, addressLine1: e.target.value })}
                      className="sm:col-span-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                    />
                    <select
                      value={newAddr.state}
                      onChange={(e) => handleNewAddrDivisionChange(e.target.value)}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 cursor-pointer"
                    >
                      {BANGLADESH_DIVISIONS.map((div) => (
                        <option key={div} value={div} className="bg-slate-900 text-slate-100">
                          {div}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 cursor-pointer"
                    >
                      {availableDistrictsForNewAddr.map((ct) => (
                        <option key={ct} value={ct} className="bg-slate-900 text-slate-100">
                          {ct}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAddressForm(false)}
                      className="px-4 py-2 bg-slate-900 text-slate-400 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl font-extrabold"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {/* Address List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userProfile?.addresses?.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-4 bg-slate-950/80 border rounded-2xl space-y-2 relative text-xs ${
                      addr.isDefault ? 'border-amber-500/80' : 'border-slate-800'
                    }`}
                  >
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 font-extrabold text-[10px] rounded uppercase border border-amber-500/30">
                        Default
                      </span>
                    )}
                    <p className="font-bold text-slate-100">{addr.name}</p>
                    <p className="text-slate-400">{addr.addressLine1}, {addr.city}, {addr.state}</p>
                    <p className="text-slate-500 font-mono">{addr.phone}</p>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                      {!addr.isDefault && (
                        <button
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-[11px] text-amber-400 font-bold hover:underline"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => removeAddress(addr.id)}
                        className="text-slate-500 hover:text-rose-400 ml-auto p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
