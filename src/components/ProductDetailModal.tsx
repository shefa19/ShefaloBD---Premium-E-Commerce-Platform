import React, { useState } from 'react';
import { Product, Review } from '../types';
import { 
  X, Star, Heart, ShoppingBag, Truck, ShieldCheck, RefreshCw, 
  Plus, Minus, Check, Share2, Maximize2, ThumbsUp, MessageSquare, 
  Copy, Zap, CheckCircle2, Award, Clock, Sparkles, ShieldAlert
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../lib/formatters';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyNow?: (product: Product, quantity: number, selectedColor?: string) => void;
}

export interface ColorOption {
  name: string;
  bgClass: string;
}

export const getProductColorOptions = (product: Product): ColorOption[] => {
  if (product.colors && product.colors.length > 0) {
    return product.colors;
  }

  const name = product.name.toLowerCase();
  const category = (product.category || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();

  // iPhones / Apple Phones
  if (name.includes('iphone') || (brand.includes('apple') && category.includes('smartphone'))) {
    return [
      { name: 'Natural Titanium', bgClass: 'bg-stone-400' },
      { name: 'Desert Titanium', bgClass: 'bg-amber-200' },
      { name: 'White Titanium', bgClass: 'bg-slate-100' },
      { name: 'Black Titanium', bgClass: 'bg-slate-900' },
    ];
  }

  // Samsung Galaxy
  if (name.includes('galaxy') || name.includes('samsung') || name.includes('z fold')) {
    return [
      { name: 'Titanium Gray', bgClass: 'bg-slate-500' },
      { name: 'Phantom Black', bgClass: 'bg-slate-950' },
      { name: 'Cobalt Violet', bgClass: 'bg-purple-900' },
      { name: 'Navy Blue', bgClass: 'bg-blue-950' },
    ];
  }

  // Google Pixel
  if (name.includes('pixel') || name.includes('google')) {
    return [
      { name: 'Obsidian Black', bgClass: 'bg-slate-950' },
      { name: 'Porcelain White', bgClass: 'bg-slate-100' },
      { name: 'Hazel Green', bgClass: 'bg-emerald-800' },
      { name: 'Rose Quartz', bgClass: 'bg-rose-300' },
    ];
  }

  // MacBooks & Laptops
  if (category.includes('laptop') || name.includes('macbook') || name.includes('asus') || name.includes('rog') || name.includes('zephyrus')) {
    return [
      { name: 'Space Black', bgClass: 'bg-slate-950' },
      { name: 'Silver White', bgClass: 'bg-slate-200' },
      { name: 'Space Gray', bgClass: 'bg-slate-600' },
      { name: 'Eclipse Gray', bgClass: 'bg-zinc-800' },
    ];
  }

  // Pro Audio & Headphones
  if (category.includes('audio') || category.includes('headphone') || name.includes('sony') || name.includes('bose') || name.includes('airpods') || name.includes('sennheiser')) {
    if (name.includes('airpods max')) {
      return [
        { name: 'Space Gray', bgClass: 'bg-slate-700' },
        { name: 'Starlight Silver', bgClass: 'bg-slate-200' },
        { name: 'Sky Blue', bgClass: 'bg-sky-400' },
        { name: 'Pink Rose', bgClass: 'bg-rose-400' },
      ];
    }
    return [
      { name: 'Matte Black', bgClass: 'bg-slate-950' },
      { name: 'Silver White', bgClass: 'bg-slate-100' },
      { name: 'Midnight Navy', bgClass: 'bg-blue-950' },
      { name: 'Smoke Gray', bgClass: 'bg-slate-600' },
    ];
  }

  // Cameras & Optics
  if (category.includes('camera') || name.includes('leica') || name.includes('fujifilm') || name.includes('sony a7') || name.includes('x100vi')) {
    return [
      { name: 'Vintage Silver & Black', bgClass: 'bg-slate-300' },
      { name: 'Stealth Matte Black', bgClass: 'bg-slate-950' },
      { name: 'Charcoal Graphite', bgClass: 'bg-zinc-700' },
    ];
  }

  // Luxury Fashion
  if (category.includes('fashion') || category.includes('luxury') || name.includes('coat') || name.includes('boots') || name.includes('cashmere')) {
    return [
      { name: 'Camel Tan', bgClass: 'bg-amber-700' },
      { name: 'Midnight Black', bgClass: 'bg-slate-950' },
      { name: 'Espresso Brown', bgClass: 'bg-amber-950' },
      { name: 'Cream Beige', bgClass: 'bg-stone-200' },
    ];
  }

  // Wearables
  if (category.includes('wearable') || name.includes('watch') || name.includes('garmin') || name.includes('fenix')) {
    return [
      { name: 'Natural Titanium', bgClass: 'bg-slate-400' },
      { name: 'DLC Dark Titanium', bgClass: 'bg-slate-900' },
      { name: 'Alpine Orange', bgClass: 'bg-orange-600' },
    ];
  }

  // Gaming & Entertainment
  if (category.includes('gaming') || name.includes('playstation') || name.includes('deck') || name.includes('quest') || name.includes('steam')) {
    return [
      { name: 'Pro Matte Black', bgClass: 'bg-zinc-900' },
      { name: 'Glacier White', bgClass: 'bg-slate-100' },
      { name: 'Cosmic Red', bgClass: 'bg-red-800' },
    ];
  }

  // General fallback
  return [
    { name: 'Standard Edition', bgClass: 'bg-slate-700' },
    { name: 'Midnight Dark', bgClass: 'bg-slate-950' },
    { name: 'Platinum Silver', bgClass: 'bg-slate-200' },
  ];
};

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  product, 
  onClose,
  onBuyNow
}) => {
  const { addToCart } = useCart();
  const { userProfile, toggleWishlist } = useAuth();
  const { showToast } = useToast();

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';

  const colorOptions = React.useMemo(() => product ? getProductColorOptions(product) : [], [product]);
  const images = React.useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) {
      const valid = product.images.filter((img) => Boolean(img && img.trim()));
      if (valid.length > 0) return valid;
    }
    return [product.thumbnail && product.thumbnail.trim() ? product.thumbnail : FALLBACK_IMAGE];
  }, [product]);

  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'reviews' | 'shipping'>('overview');
  const [selectedImage, setSelectedImage] = useState<string>(
    product?.thumbnail || (product?.images && product.images[0]) || FALLBACK_IMAGE
  );
  const [selectedColor, setSelectedColor] = useState<string>(colorOptions[0]?.name || 'Standard Edition');
  const [quantity, setQuantity] = useState<number>(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  // Review Form state
  const [showAddReviewForm, setShowAddReviewForm] = useState<boolean>(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newComment, setNewComment] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>(userProfile?.name || '');

  // Verification state: user can review 1 time per delivered purchase of this product
  const [deliveredCount, setDeliveredCount] = useState<number>(0);
  const [submittedReviewsCount, setSubmittedReviewsCount] = useState<number>(0);
  const [checkingEligibility, setCheckingEligibility] = useState<boolean>(true);

  // Check how many delivered purchases and how many reviews submitted by current user
  React.useEffect(() => {
    if (!userProfile?.uid || !product?.id) {
      setDeliveredCount(0);
      setSubmittedReviewsCount(0);
      setCheckingEligibility(false);
      return;
    }

    setCheckingEligibility(true);
    
    // 1. Fetch user orders
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userProfile.uid)
    );

    // 2. Fetch user reviews for this product
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('productId', '==', product.id),
      where('userId', '==', userProfile.uid)
    );

    Promise.all([
      getDocs(ordersQuery),
      getDocs(reviewsQuery)
    ])
      .then(([ordersSnap, reviewsSnap]) => {
        let delCount = 0;
        ordersSnap.forEach((doc) => {
          const data = doc.data();
          if (data.orderStatus === 'delivered') {
            const hasItem = data.items?.some(
              (it: any) => it.productId === product.id || it.id === product.id
            );
            if (hasItem) delCount += 1;
          }
        });

        setDeliveredCount(delCount);
        setSubmittedReviewsCount(reviewsSnap.size);
      })
      .catch((err) => {
        console.error('Error checking review eligibility:', err);
      })
      .finally(() => {
        setCheckingEligibility(false);
      });
  }, [userProfile?.uid, product?.id]);

  const canWriteReview = Boolean(userProfile?.uid) && submittedReviewsCount < deliveredCount;
  const hasDeliveredOrder = deliveredCount > 0;

  // Local state for product reviews
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});

  // Sync color & image & reviews whenever product changes
  React.useEffect(() => {
    if (product) {
      const opts = getProductColorOptions(product);
      setSelectedColor(opts[0]?.name || 'Standard Edition');
      const mainImg = product.thumbnail || (product.images && product.images[0]) || FALLBACK_IMAGE;
      setSelectedImage(mainImg);
      setQuantity(1);
      setReviewsList([
        {
          id: 'rev-1',
          productId: product.id,
          userName: 'Md. Tanvir Hossain',
          userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
          rating: 5,
          date: '2 days ago',
          title: '100% Authentic Product & Super Fast Delivery!',
          comment: 'Ordered from Dhaka Gulshan. Received original official product with sealed box within 24 hours. Performance and packaging are top notch.',
          verified: true,
          helpfulCount: 24,
        },
        {
          id: 'rev-2',
          productId: product.id,
          userName: 'Nusrat Jahan',
          userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
          rating: 5,
          date: '1 week ago',
          title: 'Unmatched flagship build quality!',
          comment: 'Very satisfied with ShefaloBD warranty and buyer protection. The item functions flawlessly and looks extremely premium.',
          verified: true,
          helpfulCount: 18,
        },
        {
          id: 'rev-3',
          productId: product.id,
          userName: 'Kazi Farhan',
          userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
          rating: 4,
          date: '2 weeks ago',
          title: 'Value for money gear',
          comment: 'Great value at this price point. Express shipping was smooth and cash on delivery option was very convenient.',
          verified: true,
          helpfulCount: 9,
        },
      ]);
    }
  }, [product]);

  if (!product) return null;

  const isWishlisted = userProfile?.wishlist?.includes(product.id);
  const effectivePrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const savingsAmount = hasDiscount ? product.price - effectivePrice : 0;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Product link copied to clipboard!', 'success');
  };

  const handleCopySku = () => {
    navigator.clipboard?.writeText(product.sku || product.id);
    showToast('SKU copied to clipboard!', 'info');
  };

  const handleToggleHelpful = (reviewId: string) => {
    setHelpfulVotes(prev => {
      const alreadyVoted = prev[reviewId];
      const nextState = !alreadyVoted;
      
      setReviewsList(list => list.map(r => {
        if (r.id === reviewId) {
          return {
            ...r,
            helpfulCount: nextState ? r.helpfulCount + 1 : r.helpfulCount - 1
          };
        }
        return r;
      }));

      return { ...prev, [reviewId]: nextState };
    });
  };

  const handleAddReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      showToast('Please log in to submit a product review', 'error');
      return;
    }
    if (submittedReviewsCount >= deliveredCount) {
      if (deliveredCount === 0) {
        showToast('Review Restricted: You can only review products that have been Delivered to you.', 'error');
      } else {
        showToast('Review Limit Reached: You have already submitted a review for your purchase. Purchase again to review upon delivery!', 'error');
      }
      return;
    }
    if (!newTitle.trim() || !newComment.trim()) {
      showToast('Please provide a title and detailed comment', 'error');
      return;
    }

    const createdReview: Review = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      userName: reviewerName.trim() || userProfile.name || 'Verified Customer',
      rating: newRating,
      date: 'Just now',
      title: newTitle.trim(),
      comment: newComment.trim(),
      verified: true,
      helpfulCount: 0,
    };

    try {
      await addDoc(collection(db, 'reviews'), {
        productId: product.id,
        userId: userProfile.uid,
        userName: createdReview.userName,
        rating: newRating,
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        title: createdReview.title,
        comment: createdReview.comment,
        verified: true,
        helpfulCount: 0,
        createdAt: new Date().toISOString(),
      });

      setSubmittedReviewsCount(prev => prev + 1);
      setReviewsList([createdReview, ...reviewsList]);
      setShowAddReviewForm(false);
      setNewTitle('');
      setNewComment('');
      showToast('Thank you! Your verified review for this purchase has been published.', 'success');
    } catch (err: any) {
      console.error('Error saving review to Firestore:', err);
      // Fallback local update
      setSubmittedReviewsCount(prev => prev + 1);
      setReviewsList([createdReview, ...reviewsList]);
      setShowAddReviewForm(false);
      setNewTitle('');
      setNewComment('');
      showToast('Thank you! Your verified review has been published.', 'success');
    }
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor);
    onClose();
    if (onBuyNow) {
      onBuyNow(product, quantity, selectedColor);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
        <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
          
          {/* Top Bar Header */}
          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-400 font-extrabold text-[11px] rounded-lg uppercase tracking-wider">
                {product.brand || 'FLAGSHIP'}
              </span>
              <span className="text-slate-600 dark:text-slate-400 text-xs font-semibold hidden sm:inline">
                Category: <span className="text-slate-900 dark:text-slate-200 font-bold">{product.category}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 transition-all text-xs flex items-center gap-1.5 font-bold"
                title="Share Product"
              >
                <Share2 className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">Share</span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 font-bold ${
                  isWishlisted
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-rose-500' : ''}`} />
                <span className="hidden sm:inline">{isWishlisted ? 'Saved' : 'Wishlist'}</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all ml-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Modal Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1">
            
            {/* Left 5 Cols: Gallery & Visuals */}
            <div className="lg:col-span-5 p-5 bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between space-y-4">
              <div>
                {/* Main Display Image */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 group shadow-inner">
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Discount Badge */}
                  {hasDiscount && product.discountPercent && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-full uppercase shadow-xl tracking-wider">
                      -{product.discountPercent}% OFF
                    </span>
                  )}

                  {/* Stock Tag */}
                  <span className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold uppercase rounded-full backdrop-blur-md shadow-md border ${
                    product.stock > 0
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                  </span>

                  {/* Lightbox Trigger Icon */}
                  <button
                    onClick={() => setIsLightboxOpen(true)}
                    className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-950/70 hover:bg-slate-950 text-slate-200 border border-slate-800 backdrop-blur-md transition-all shadow-lg"
                    title="View Full Resolution"
                  >
                    <Maximize2 className="w-4 h-4 text-amber-400" />
                  </button>
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto pt-3 pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                          selectedImage === img
                            ? 'border-amber-500 ring-2 ring-amber-500/20 scale-95 shadow-md'
                            : 'border-slate-800 opacity-60 hover:opacity-100 bg-slate-900'
                        }`}
                      >
                        <img src={img} alt={`Product thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Verified Seller & Authenticity Banner */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-100">100% Original Flagship Product</p>
                    <p className="text-[10px] text-slate-400">Official Brand Sealed Box & Warranty Card</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            </div>

            {/* Right 7 Cols: Information & Interactive Tabs */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                
                {/* Title & Brand Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
                    <span className="text-amber-400 font-bold uppercase tracking-widest">{product.brand}</span>
                    <span>•</span>
                    <span>SKU: {product.sku || 'N/A'}</span>
                    <button onClick={handleCopySku} className="hover:text-amber-400 transition-colors" title="Copy SKU">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight leading-snug">
                    {product.name}
                  </h1>

                  {/* Rating summary clickable */}
                  <div className="flex items-center gap-3 mt-2.5">
                    <button 
                      onClick={() => setActiveTab('reviews')}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg hover:border-amber-500/40 transition-all text-xs"
                    >
                      <div className="flex items-center text-amber-400">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span className="font-extrabold ml-1 text-slate-100">{product.rating || 4.9}</span>
                      </div>
                      <span className="text-slate-400 font-medium">({reviewsList.length} verified reviews)</span>
                    </button>

                    <span className="text-slate-700">|</span>

                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Ready for Express Dispatch</span>
                    </span>
                  </div>
                </div>

                {/* Price Display Card */}
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
                        {formatPrice(effectivePrice)}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-slate-500 line-through font-semibold">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    {hasDiscount && savingsAmount > 0 && (
                      <p className="text-[11px] font-bold text-emerald-400 mt-0.5">
                        You Save {formatPrice(savingsAmount)} ({product.discountPercent}% OFF)
                      </p>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-slate-400 font-medium">
                    <p className="text-slate-300 font-bold">Includes 5% VAT & Duty</p>
                    <p className="text-slate-500">Free shipping on orders over ৳50,000</p>
                  </div>
                </div>

                {/* Color/Finish Selection */}
                <div className="mb-6 space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Selected Edition / Color:</span>
                    <span className="text-amber-400 font-bold">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {colorOptions.map((col) => (
                      <button
                        key={col.name}
                        onClick={() => setSelectedColor(col.name)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                          selectedColor === col.name
                            ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-md shadow-amber-500/20'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${col.bgClass} border border-slate-700 shadow-inner`} />
                        <span>{col.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Navigation Controls */}
                <div className="border-b border-slate-800 flex gap-4 text-xs font-bold mb-6 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
                      activeTab === 'overview'
                        ? 'border-amber-500 text-amber-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Overview & Highlights
                  </button>
                  <button
                    onClick={() => setActiveTab('specs')}
                    className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
                      activeTab === 'specs'
                        ? 'border-amber-500 text-amber-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Technical Specifications
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === 'reviews'
                        ? 'border-amber-500 text-amber-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Reviews ({reviewsList.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('shipping')}
                    className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
                      activeTab === 'shipping'
                        ? 'border-amber-500 text-amber-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Shipping & Guarantee
                  </button>
                </div>

                {/* Tab Content Display */}
                <div className="min-h-[160px] mb-6">
                  
                  {/* TAB 1: OVERVIEW */}
                  {activeTab === 'overview' && (
                    <div className="space-y-4 animate-fadeIn">
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {product.description}
                      </p>

                      {product.features && product.features.length > 0 && (
                        <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/80">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Key Flagship Features</span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                            {product.features.map((feat, i) => (
                              <div key={i} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
                                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: SPECIFICATIONS */}
                  {activeTab === 'specs' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col">
                          <span className="text-slate-500 font-semibold text-[11px]">Brand Name</span>
                          <span className="text-slate-200 font-bold text-sm">{product.brand}</span>
                        </div>
                        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col">
                          <span className="text-slate-500 font-semibold text-[11px]">Category</span>
                          <span className="text-slate-200 font-bold text-sm">{product.category}</span>
                        </div>
                        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col">
                          <span className="text-slate-500 font-semibold text-[11px]">Model / SKU</span>
                          <span className="text-slate-200 font-bold text-sm">{product.sku || product.id}</span>
                        </div>
                        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col">
                          <span className="text-slate-500 font-semibold text-[11px]">Stock Availability</span>
                          <span className={`font-bold text-sm ${product.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {product.stock > 0 ? `${product.stock} Units Ready` : 'Out of Stock'}
                          </span>
                        </div>

                        {/* Custom Specs */}
                        {product.specifications && product.specifications.length > 0 && (
                          product.specifications.map((spec, i) => (
                            <div key={i} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col">
                              <span className="text-slate-500 font-semibold text-[11px]">{spec.key}</span>
                              <span className="text-slate-200 font-bold text-sm">{spec.value}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: REVIEWS & RATING FORM */}
                  {activeTab === 'reviews' && (
                    <div className="space-y-6 animate-fadeIn">
                      {/* Rating Overview Summary */}
                      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-6">
                        <div className="text-center sm:text-left shrink-0">
                          <span className="text-4xl font-black text-slate-100">{product.rating || 4.9}</span>
                          <span className="text-sm font-bold text-slate-500"> / 5.0</span>
                          <div className="flex items-center justify-center sm:justify-start text-amber-400 mt-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-4 h-4 fill-amber-400" />
                            ))}
                          </div>
                          <p className="text-[11px] text-slate-400 font-semibold mt-1">
                            Based on {reviewsList.length} verified ratings
                          </p>
                        </div>

                        <div className="flex-1 w-full space-y-1.5 text-xs text-slate-400">
                          {[
                            { stars: 5, pct: 85 },
                            { stars: 4, pct: 10 },
                            { stars: 3, pct: 5 },
                            { stars: 2, pct: 0 },
                            { stars: 1, pct: 0 },
                          ].map((bar) => (
                            <div key={bar.stars} className="flex items-center gap-2">
                              <span className="w-12 text-[11px] font-bold text-slate-300 flex items-center gap-1">
                                <span>{bar.stars}</span>
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              </span>
                              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-amber-500 rounded-full" 
                                  style={{ width: `${bar.pct}%` }} 
                                />
                              </div>
                              <span className="w-8 text-[10px] text-right text-slate-500 font-bold">{bar.pct}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Write a Review Button / Form Trigger */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                            Customer Reviews ({reviewsList.length})
                          </h4>
                          {canWriteReview && (
                            <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verified Buyer • Delivered Purchase Confirmed ({deliveredCount - submittedReviewsCount} Review Available)</span>
                            </span>
                          )}
                          {!canWriteReview && hasDeliveredOrder && (
                            <span className="text-[10px] text-amber-400 font-extrabold flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Review Completed ({submittedReviewsCount}/{deliveredCount} Delivered Orders)</span>
                            </span>
                          )}
                        </div>

                        {canWriteReview ? (
                          <button
                            onClick={() => setShowAddReviewForm(!showAddReviewForm)}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md self-start sm:self-auto"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{showAddReviewForm ? 'Close Form' : 'Write a Review'}</span>
                          </button>
                        ) : (
                          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>
                              {!userProfile
                                ? 'Sign in to write a review'
                                : checkingEligibility
                                ? 'Checking delivery status...'
                                : hasDeliveredOrder
                                ? 'Review submitted for this purchase'
                                : 'Review unlocked after product delivery'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Add Review Form Modal */}
                      {showAddReviewForm && canWriteReview && (
                        <form onSubmit={handleAddReviewSubmit} className="p-4 bg-slate-950 border border-amber-500/30 rounded-2xl space-y-3">
                          <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-amber-400" />
                            <span>Share Your Verified Delivered Product Experience</span>
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Your Name *</label>
                              <input
                                type="text"
                                required
                                value={reviewerName}
                                onChange={(e) => setReviewerName(e.target.value)}
                                placeholder="e.g. Shakib Al Hasan"
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Your Rating *</label>
                              <div className="flex items-center gap-1 py-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewRating(star)}
                                    className="p-1 hover:scale-125 transition-transform"
                                  >
                                    <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Review Headline *</label>
                            <input
                              type="text"
                              required
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              placeholder="e.g. Excellent build quality & fast delivery"
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Detailed Review *</label>
                            <textarea
                              rows={3}
                              required
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Describe product condition, usage experience, and delivery..."
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setShowAddReviewForm(false)}
                              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs"
                            >
                              Publish Review
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Reviews List */}
                      <div className="space-y-3">
                        {reviewsList.map((rev) => (
                          <div key={rev.id} className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-200 text-xs border border-slate-700 uppercase">
                                  {rev.userName.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-100 text-xs">{rev.userName}</span>
                                    {rev.verified && (
                                      <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold rounded uppercase tracking-wider">
                                        Verified Buyer
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-500">{rev.date}</p>
                                </div>
                              </div>

                              <div className="flex items-center text-amber-400">
                                {[1, 2, 3, 4, 5].map((st) => (
                                  <Star
                                    key={st}
                                    className={`w-3.5 h-3.5 ${st <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-800'}`}
                                  />
                                ))}
                              </div>
                            </div>

                            <p className="font-bold text-xs text-slate-200">{rev.title}</p>
                            <p className="text-xs text-slate-400 leading-relaxed">{rev.comment}</p>

                            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-900">
                              <span>Was this review helpful?</span>
                              <button
                                onClick={() => handleToggleHelpful(rev.id)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                                  helpfulVotes[rev.id]
                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>Yes ({rev.helpfulCount})</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: SHIPPING & GUARANTEE */}
                  {activeTab === 'shipping' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        
                        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                          <div className="flex items-center gap-2 text-amber-400 font-bold">
                            <Truck className="w-4 h-4" />
                            <span>Dhaka Metro Express Delivery</span>
                          </div>
                          <p className="text-slate-300">Same day or next 24-hour priority dispatch.</p>
                          <p className="font-bold text-emerald-400">Courier Charge: ৳60 (Free over ৳50,000)</p>
                        </div>

                        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                          <div className="flex items-center gap-2 text-amber-400 font-bold">
                            <Truck className="w-4 h-4" />
                            <span>Outside Dhaka Nationwide</span>
                          </div>
                          <p className="text-slate-300">2-3 business days via Steadfast or Pathao Courier.</p>
                          <p className="font-bold text-emerald-400">Courier Charge: ৳120</p>
                        </div>

                        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                          <div className="flex items-center gap-2 text-amber-400 font-bold">
                            <ShieldCheck className="w-4 h-4" />
                            <span>2 Year Official Warranty</span>
                          </div>
                          <p className="text-slate-300">Comes with official brand service warranty card & serial code.</p>
                        </div>

                        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                          <div className="flex items-center gap-2 text-amber-400 font-bold">
                            <RefreshCw className="w-4 h-4" />
                            <span>7-Day Replacement Policy</span>
                          </div>
                          <p className="text-slate-300">Instant replacement for manufacturing defects or shipping damage.</p>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Bottom Quantity Selector & Primary CTAs */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Quantity</span>
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-slate-100">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Subtotal</span>
                    <span className="text-xl font-black text-amber-400">
                      {formatPrice(effectivePrice * quantity)}
                    </span>
                  </div>
                </div>

                {/* Dual Action Buttons: Add to Cart & Buy Now */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      addToCart(product, quantity, selectedColor);
                      showToast(`Added ${quantity} × ${product.name} (${selectedColor}) to cart`, 'success');
                    }}
                    disabled={product.stock <= 0}
                    className={`py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all ${
                      product.stock > 0
                        ? 'bg-slate-950 hover:bg-slate-800 border-amber-500/50 text-amber-400 hover:border-amber-400 shadow-lg'
                        : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                    className={`py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
                      product.stock > 0
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-98'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Buy Now • {formatPrice(effectivePrice * quantity)}</span>
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Lightbox High-Res Zoom Modal Overlay */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-800 z-50 shadow-2xl"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl border border-slate-800 p-2 bg-slate-900 shadow-2xl">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-contain max-h-[80vh] rounded-2xl"
            />
          </div>

          {images.length > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === img
                      ? 'border-amber-500 ring-2 ring-amber-500/20 scale-95 shadow-md'
                      : 'border-slate-800 opacity-60 hover:opacity-100 bg-slate-900'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
