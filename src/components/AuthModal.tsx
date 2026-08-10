import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Chrome, Check, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCleanAuthErrorMessage } from '../lib/firebase';
import { validateStrongPassword, checkPasswordRequirements } from '../lib/formatters';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialView = 'login',
}) => {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>(initialView);
  const { loginWithEmail, registerWithEmail, resetPassword } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const passwordReqs = checkPasswordRequirements(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (view === 'register') {
      if (!name.trim()) {
        setError('Please provide your full name');
        return;
      }
      const passValidation = validateStrongPassword(password);
      if (!passValidation.isValid) {
        setError(passValidation.error || 'Password does not meet security requirements.');
        return;
      }
    }

    setLoading(true);

    try {
      if (view === 'login') {
        await loginWithEmail(email, password);
        onClose();
      } else if (view === 'register') {
        await registerWithEmail(name, email, password);
        onClose();
      } else if (view === 'forgot') {
        await resetPassword(email);
        setView('login');
      }
    } catch (err: any) {
      setError(getCleanAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 my-auto">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-slate-100">
            {view === 'login' ? 'Welcome Back' : view === 'register' ? 'Create an Account' : 'Reset Password'}
          </h2>
          <p className="text-xs text-slate-400">
            {view === 'login'
              ? 'Access your saved orders, wishlist and profile'
              : view === 'register'
              ? 'Join ShefaloBD for member perks and exclusive deals'
              : 'Enter your email address to receive a recovery link'}
          </p>
        </div>

        {/* Sample Admin Credentials Notice on Login */}
        {view === 'login' && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-2 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Admin Demo Account</span>
              </div>
              <p className="text-slate-300 font-mono text-[11px]">
                Email: <span className="text-amber-300 font-bold">name@example.com</span>
              </p>
              <p className="text-slate-300 font-mono text-[11px]">
                Password: <span className="text-amber-300 font-bold">abcd1234</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail('name@example.com');
                setPassword('abcd1234');
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] rounded-xl transition-all shrink-0 shadow-md shadow-amber-500/20"
            >
              Quick Fill
            </button>
          </div>
        )}

        {/* Error message display */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold leading-relaxed">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {view === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Sarah Miller"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {view !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-400">Password</label>
                {view === 'login' && (
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-[11px] text-amber-400 hover:underline font-semibold"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Password Strength Requirements Checklist */}
              {view === 'register' && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-[11px]">
                  <p className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Strong Password Requirements</span>
                  </p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <div className={`flex items-center gap-1.5 ${passwordReqs.minLength ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${passwordReqs.minLength ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        {passwordReqs.minLength ? '✓' : '•'}
                      </span>
                      <span>8+ Characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordReqs.hasUppercase ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${passwordReqs.hasUppercase ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        {passwordReqs.hasUppercase ? '✓' : '•'}
                      </span>
                      <span>Uppercase (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordReqs.hasLowercase ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${passwordReqs.hasLowercase ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        {passwordReqs.hasLowercase ? '✓' : '•'}
                      </span>
                      <span>Lowercase (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordReqs.hasNumber ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${passwordReqs.hasNumber ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        {passwordReqs.hasNumber ? '✓' : '•'}
                      </span>
                      <span>Number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 col-span-2 ${passwordReqs.hasSpecialChar ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${passwordReqs.hasSpecialChar ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        {passwordReqs.hasSpecialChar ? '✓' : '•'}
                      </span>
                      <span>Special Symbol (!@#$%^&*)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            <span>
              {loading
                ? 'Please wait...'
                : view === 'login'
                ? 'Sign In to Account'
                : view === 'register'
                ? 'Create Account'
                : 'Send Password Reset Email'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* View Switcher Footer */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          {view === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setView('register')}
                className="text-amber-400 font-bold hover:underline ml-1"
              >
                Register now
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                onClick={() => setView('login')}
                className="text-amber-400 font-bold hover:underline ml-1"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
