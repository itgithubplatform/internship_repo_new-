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

    try {
      await auth.register(formData);
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'ADMIN', title: 'Tenant Admin', desc: 'Manage your organization, users, and licensing.', icon: Building2 },
    { id: 'MANAGER', title: 'Manager', desc: 'Oversee field operations and approve engineer data.', icon: Briefcase },
    { id: 'ENGINEER', title: 'Field Engineer', desc: 'Capture field data and complete validated forms.', icon: HardHat },
  ];

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl z-10"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-xl shadow-blue-500/20 mb-4 animate-float">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Create your account</h1>
          <p className="text-slate-400 mt-2 font-medium">Join the enterprise multi-tenant ecosystem.</p>
        </div>

        <div className="glass-card p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <form onSubmit={handleRegister}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold font-display">Select your role</h2>
                    <p className="text-slate-400 text-sm mt-1">Choose the account type that matches your duties.</p>
                  </div>

                  <div className="space-y-4">
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: role.id })}
                        className={`w-full p-6 rounded-2xl border transition-all text-left group flex items-center gap-5 ${
                          formData.role === role.id 
                            ? 'bg-blue-600/10 border-blue-500/50 ring-2 ring-blue-500/20' 
                            : 'bg-white/5 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className={`p-3 rounded-xl transition-colors ${
                          formData.role === role.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500'
                        }`}>
                          <role.icon size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{role.title}</h3>
                          <p className="text-sm text-slate-500">{role.desc}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          formData.role === role.id ? 'border-blue-500 bg-blue-500' : 'border-slate-700'
                        }`}>
                          {formData.role === role.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  <button 
                    type="button"
                    onClick={handleNext}
                    className="btn-primary w-full h-14 text-lg justify-center mt-8 shadow-blue-500/20"
                  >
                    Continue <ArrowRight size={20} className="ml-1" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold font-display">Personal Details</h2>
                    <p className="text-slate-400 text-sm mt-1">Finalize your profile to get started.</p>
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

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Security Password</label>
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

                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={handleBack}
                      className="btn-secondary h-14 px-8"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex-1 h-14 text-lg justify-center shadow-blue-500/20"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : 'Complete Setup'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            Already have an account? {' '}
            <Link href="/login" className="text-blue-500 font-bold hover:text-blue-400 transition-colors">
              Sign in instead
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
