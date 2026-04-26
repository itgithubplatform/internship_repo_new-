'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-xl shadow-blue-500/20 mb-4">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Reset Password</h1>
          <p className="text-slate-400 mt-2 font-medium">We'll send you a recovery link.</p>
        </div>

        <div className="glass-card p-8 md:p-10 shadow-2xl">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Work Email</label>
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

              <button 
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-14 text-lg justify-center shadow-blue-500/20"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
              </button>

              <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-white transition-colors">
                <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                <CheckCircle2 size={40} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Check your email</h2>
              <p className="text-slate-400 mb-8 text-sm">We've sent a 6-digit recovery OTP to <span className="text-white font-semibold">{email}</span>.</p>
              <Link href="/login" className="btn-primary w-full h-14 text-lg justify-center">
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
