import React, { useState } from 'react';
import { ShoppingBag, Mail, ShieldCheck, Truck, RefreshCw, Send, CreditCard, Smartphone, Banknote, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useToast } from '../context/ToastContext';

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = newsletterEmail.trim().toLowerCase();
    if (!normalizedEmail) return;

    setLoading(true);
    try {
      // Duplicate check in subscribers collection
      const q = query(
        collection(db, 'subscribers'),
        where('email', '==', normalizedEmail)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        showToast('This email is already subscribed to VIP drops!', 'info');
      } else {
        await addDoc(collection(db, 'subscribers'), {
          email: normalizedEmail,
          subscribedAt: new Date().toISOString(),
        });
        showToast('Subscribed! Check your inbox for exclusive VIP offers.', 'success');
        setNewsletterEmail('');
      }
    } catch (err) {
      console.error('Error subscribing email:', err);
      showToast('Subscription failed. Please check your network and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Newsletter & Value Props Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-800/80">
          
          {/* Brand info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-slate-100 tracking-tight">
                SHEFALO<span className="text-amber-400">BD</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curated premium flagship gadgets, luxury apparel, and professional gear. Backed by express shipping and 24/7 buyer protection.
            </p>
          </div>

          {/* Newsletter Box */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-100">Subscribe for VIP Drops & Flash Sales</h4>
              <p className="text-xs text-slate-400">Get early access to limited edition product drops and special coupons.</p>
            </div>

            <form onSubmit={handleSubscribe} className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Enter email..."
                required
                disabled={loading}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1 shrink-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Joining...</span>
                  </>
                ) : (
                  <>
                    <span>Join</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>



        {/* Accepted Payment Methods & Security */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">Accepted Payments:</span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300 font-bold flex items-center gap-1 text-[11px]">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>Card</span>
              </span>
              <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-pink-400 font-bold flex items-center gap-1 text-[11px]">
                <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                <span>bKash</span>
              </span>
              <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-orange-400 font-bold flex items-center gap-1 text-[11px]">
                <Smartphone className="w-3.5 h-3.5 text-orange-400" />
                <span>Nagad</span>
              </span>
              <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                <span>COD</span>
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} ShefaloBD E-Commerce Platform. All rights reserved. Powered by Firebase & Gemini.
          </p>
        </div>

      </div>
    </footer>
  );
};
