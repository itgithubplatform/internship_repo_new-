'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Send Email, 2: Reset Password, 3: Success

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await auth.forgotPassword(email);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not send reset link.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await auth.resetPassword(email, code, newPassword);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid code or password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-gradient-to-br from-primary to-blue-600 p-3 rounded-2xl shadow-xl shadow-primary/20 mb-4 animate-float">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight">VeroFlow<span className="text-primary">.</span></h1>
          <p className="text-slate-400 mt-2 font-medium">
            {step === 1 && "Secure password recovery system"}
            {step === 2 && "Enter the OTP and your new password"}
            {step === 3 && "Your security has been updated"}
          </p>
        </div>

        <div className="glass-card p-8 md:p-10 shadow-2xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSendEmail} 
                className="space-y-6"
              >
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm">
                    {error}
                  </div>
                )}
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
              </motion.form>
            )}

            {step === 2 && (
              <motion.form 
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleResetPassword} 
                className="space-y-6"
              >
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">6-Digit Code</label>
                  <input 
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    className="input-premium w-full text-center text-2xl tracking-[0.3em] h-14 font-black"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">New Password</label>
                  <input 
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-premium w-full px-6 h-14"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full h-14 text-lg justify-center shadow-blue-500/20"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Reset Password'}
                </button>
              </motion.form>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                  <CheckCircle2 size={40} className="text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Success!</h2>
                <p className="text-slate-400 mb-8 text-sm">You can now sign in with your new password.</p>
                <Link href="/login" className="btn-primary w-full h-14 text-lg justify-center">
                  Back to Login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

