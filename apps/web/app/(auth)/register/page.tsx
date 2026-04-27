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
  ArrowLeft,
  AlertCircle, 
  Loader2,
  User,
  Users,
  Building2,
  ChevronRight,
  HardHat,
  Briefcase
} from 'lucide-react';
import { auth } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'ENGINEER',
    tenantId: ''
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...submitData } = formData;
      await auth.register(submitData);
      setStep(3); // Move to success step
    } catch (err: any) {
      const msg = err.response?.data?.details || err.response?.data?.error || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { 
      id: 'ADMIN', 
      title: 'Tenant Admin', 
      desc: 'Platform owner for your company. Manage users, billing, and licensing.', 
      icon: Building2,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/20',
      dashboard: '/admin'
    },
    { 
      id: 'MANAGER', 
      title: 'Operations Manager', 
      desc: 'Oversee field teams, review submissions, and approve engineer data.', 
      icon: Briefcase,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      border: 'border-purple-400/20',
      dashboard: '/manager'
    },
    { 
      id: 'ENGINEER', 
      title: 'Field Engineer', 
      desc: 'Mobile-first role. Complete forms, capture photos, and sync data.', 
      icon: HardHat,
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
      border: 'border-cyan-400/20',
      dashboard: '/engineer'
    },
  ];

  const selectedRole = roles.find(r => r.id === formData.role);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl z-10"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative w-20 h-20 overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-primary/20 mb-6 group">
            <img 
              src="/logo.png" 
              alt="VeroFlow Logo" 
              className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700" 
            />
          </div>
          <h1 className="text-4xl font-display font-black tracking-tighter text-white">VeroFlow</h1>
          <p className="text-slate-500 mt-2 font-black uppercase tracking-[0.2em] text-[10px]">Enterprise Onboarding</p>
        </div>

        <div className="glass-card p-8 md:p-10 shadow-2xl relative overflow-hidden border-white/5">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.4, ease: "circOut" }}
              >
                <div className="mb-10 text-center">
                  <h2 className="text-2xl font-bold font-display">Who are you?</h2>
                  <p className="text-slate-400 text-sm mt-2">Select your role to unlock specific platform capabilities.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: role.id })}
                      className={`p-6 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-4 group h-full ${
                        formData.role === role.id 
                          ? `${role.bg} ${role.border} ring-4 ring-primary/10 scale-[1.02]` 
                          : 'bg-white/5 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <div className={`p-4 rounded-2xl transition-all duration-500 ${
                        formData.role === role.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : `bg-slate-800 ${role.color}`
                      }`}>
                        <role.icon size={32} />
                      </div>
                      <div>
                        <h3 className="font-black text-sm uppercase tracking-wider mb-2">{role.title}</h3>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{role.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <button 
                  type="button"
                  onClick={handleNext}
                  className="btn-primary w-full h-16 text-lg justify-center mt-12 shadow-primary/30 group"
                >
                  Set Up Profile <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                onSubmit={handleRegister}
              >
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <button type="button" onClick={handleBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                      <ArrowLeft size={18} className="text-slate-500" />
                    </button>
                    <h2 className="text-2xl font-bold font-display">Personal Details</h2>
                  </div>
                  <p className="text-slate-400 text-sm ml-10">Creating account for <span className={`${selectedRole?.color} font-bold`}>{selectedRole?.title}</span></p>
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm flex items-center gap-3 mb-6">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">First Name</label>
                    <input 
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="John"
                      className="input-premium w-full h-14"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Last Name</label>
                    <input 
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Doe"
                      className="input-premium w-full h-14"
                    />
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Work Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@company.com"
                        className="input-premium w-full pl-12 h-14"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                          type="password"
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="••••••••"
                          className="input-premium w-full pl-12 h-14"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Confirm</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                          type="password"
                          required
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          className="input-premium w-full pl-12 h-14"
                        />
                      </div>
                    </div>
                  </div>

                  {formData.role !== 'ADMIN' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Tenant Slug / ID</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                          type="text"
                          required
                          value={formData.tenantId}
                          onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                          placeholder="acme-engineering"
                          className="input-premium w-full pl-12 h-14"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full h-16 text-lg justify-center shadow-primary/20"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Complete Setup'}
                </button>
              </motion.form>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className={`w-24 h-24 rounded-full ${selectedRole?.bg} border ${selectedRole?.border} flex items-center justify-center mx-auto mb-8`}>
                  <ShieldCheck size={48} className={selectedRole?.color} />
                </div>
                <h2 className="text-3xl font-black mb-4 tracking-tight">Setup Complete!</h2>
                <p className="text-slate-400 mb-10 max-w-sm mx-auto leading-relaxed">
                  Your <span className={`${selectedRole?.color} font-bold`}>{selectedRole?.title}</span> account is ready. 
                  Please sign in to access your dashboard at <span className="text-white font-mono">{selectedRole?.dashboard}</span>.
                </p>
                <Link href="/login" className="btn-primary w-full h-16 text-lg justify-center flex items-center">
                  Sign In to Dashboard
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step !== 3 && (
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm font-medium">
              Already have an account? {' '}
              <Link href="/login" className="text-primary font-bold hover:text-primary/80 transition-colors">
                Sign in instead
              </Link>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
