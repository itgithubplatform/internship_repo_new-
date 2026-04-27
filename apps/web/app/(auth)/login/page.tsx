'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  Loader2,
  ChevronRight,
  Fingerprint
} from 'lucide-react';
import { auth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await auth.login(email, password);
      
      if (data.mfaRequired) {
        setMfaRequired(true);
        setLoading(false);
        return;
      }

      // Redirect based on role
      const user = auth.getUser();
      if (user?.role === 'SUPER_ADMIN') router.push('/super-admin');
      else if (user?.role === 'ADMIN') router.push('/admin');
      else if (user?.role === 'MANAGER') router.push('/manager');
      else router.push('/engineer');

    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await auth.verifyMfa(email, mfaCode);
      
      const user = auth.getUser();
      if (user?.role === 'SUPER_ADMIN') router.push('/super-admin');
      else if (user?.role === 'ADMIN') router.push('/admin');
      else if (user?.role === 'MANAGER') router.push('/manager');
      else router.push('/engineer');

    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid MFA code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-20 h-20 overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-primary/20 mb-6 group">
            <img 
              src="/logo.png" 
              alt="VeroFlow Logo" 
              className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700" 
            />
          </div>
          <h1 className="text-4xl font-display font-black tracking-tighter text-white">VeroFlow</h1>
          <p className="text-slate-500 mt-2 font-black uppercase tracking-[0.2em] text-[10px]">Enterprise Platform</p>
        </div>

        <div className="glass-card p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!mfaRequired ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold font-display">Welcome Back</h2>
                  <p className="text-slate-400 text-sm mt-1">Sign in to manage your operations.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm flex items-center gap-3"
                    >
                      <AlertCircle size={18} />
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="input-premium w-full pl-12 h-14"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Password</label>
                      <Link href="/forgot-password" size="sm" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-premium w-full pl-12 h-14"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full h-14 text-lg justify-center mt-4 shadow-primary/20"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : (
                      <>Sign In <ArrowRight size={20} className="ml-1" /></>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                  <p className="text-slate-400 text-sm">
                    New tenant? {' '}
                    <Link href="/register" className="text-primary font-bold hover:text-primary/80 transition-colors">
                      Create an account
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="mfa"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-8 text-center">
                  <div className="bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                    <Fingerprint size={32} className="text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold font-display">Two-Factor Auth</h2>
                  <p className="text-slate-400 text-sm mt-1">Enter the 6-digit code sent to your email.</p>
                </div>

                <form onSubmit={handleMfaVerify} className="space-y-6">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm flex items-center gap-3"
                    >
                      <AlertCircle size={18} />
                      {error}
                    </motion.div>
                  )}
                  <div className="flex justify-center gap-3">
                    <input 
                      type="text"
                      maxLength={6}
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      placeholder="000000"
                      className="input-premium w-48 text-center text-3xl tracking-[0.5em] font-black h-20"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading || mfaCode.length < 6}
                    className="btn-primary w-full h-14 text-lg justify-center shadow-blue-500/20"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Verify Code'}
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => setMfaRequired(false)}
                    className="w-full text-sm font-bold text-slate-500 hover:text-white transition-colors py-2"
                  >
                    Back to Login
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Trusted By */}
        <div className="mt-12 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-6">Secured by Antigravity Core</p>
          <div className="flex justify-center gap-8 opacity-20 grayscale filter">
            <ShieldCheck size={24} />
            <Lock size={24} />
            <Fingerprint size={24} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
