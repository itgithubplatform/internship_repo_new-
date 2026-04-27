'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Upload, CheckCircle, FileText, Camera, Send, Clock, MapPin, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EngineerDashboard() {
  const [kycStatus, setKycStatus] = useState<string>('pending');
  const [activeTab, setActiveTab] = useState<'tasks' | 'submit'>('tasks');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedKyc = localStorage.getItem('demo_kyc_status') || 'pending';
    setKycStatus(savedKyc);
  }, []);

  const handleKycSubmit = () => {
    localStorage.setItem('demo_kyc_status', 'submitted');
    localStorage.setItem('demo_kyc_name', 'John Engineer');
    setKycStatus('submitted');
  };

  const handleFormSubmit = (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newSub = {
      id: `SUB-${Math.floor(Math.random() * 9000) + 1000}`,
      engineer: 'John Engineer',
      form: 'Site Safety Audit',
      time: 'Just now',
      status: 'Pending Review'
    };
    const existing = JSON.parse(localStorage.getItem('demo_submissions') || '[]');
    localStorage.setItem('demo_submissions', JSON.stringify([newSub, ...existing]));
    
    setTimeout(() => {
      setIsSubmitting(false);
      setActiveTab('tasks');
      alert('Form submitted to Manager successfully!');
    }, 1500);
  };

  if (kycStatus === 'pending' || kycStatus === 'submitted') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="glass-card max-w-md w-full p-8 text-center border-white/5">
           <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary">
            {kycStatus === 'pending' ? <ShieldAlert size={40} /> : <Clock size={40} className="animate-pulse" />}
          </div>
          <h2 className="text-2xl font-black mb-2">Identity Verification</h2>
          <p className="text-slate-400 text-sm mb-8">
            {kycStatus === 'pending' 
              ? "Submit your KYC documents to access the field work portal."
              : "Your documents are under review by the Admin."}
          </p>
          {kycStatus === 'pending' ? (
            <button onClick={handleKycSubmit} className="btn-primary w-full py-4 rounded-2xl font-black">Submit for Verification</button>
          ) : (
            <div className="p-4 bg-white/5 rounded-2xl">
               <span className="text-[10px] font-black bg-amber-500/20 text-amber-400 px-2 py-1 rounded-md uppercase">Pending Review</span>
               <button onClick={() => { localStorage.setItem('demo_kyc_status', 'approved'); setKycStatus('approved'); }} className="block mx-auto mt-4 text-[10px] text-slate-600">(Demo: Bypass to Approved)</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10 overflow-hidden rounded-xl border border-white/10 shadow-lg">
            <img 
              src="/logo.png" 
              alt="VeroFlow Logo" 
              className="w-full h-full object-cover scale-110" 
            />
          </div>
          <div>
            <h3 className="font-black text-sm tracking-tight text-white">VeroFlow</h3>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">Verified Portal</span>
          </div>
        </div>
        <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="text-rose-400 text-[10px] font-black uppercase">Sign Out</button>
      </div>

      <div className="flex bg-white/5 p-4 gap-4">
        <button onClick={() => setActiveTab('tasks')} className={`flex-1 py-2 text-xs font-black rounded-lg ${activeTab === 'tasks' ? 'bg-primary' : 'text-slate-500'}`}>TASKS</button>
        <button onClick={() => setActiveTab('submit')} className={`flex-1 py-2 text-xs font-black rounded-lg ${activeTab === 'submit' ? 'bg-primary' : 'text-slate-500'}`}>SUBMIT FORM</button>
      </div>

      <div className="p-6 flex-1">
        {activeTab === 'tasks' ? (
          <div className="space-y-4">
            <div className="glass-card p-5 border-white/5 flex items-center justify-between">
              <div className="flex gap-4">
                <FileText className="text-primary" />
                <div><h5 className="font-bold text-sm">Site B - Safety Inspection</h5><p className="text-[10px] text-slate-500">London Sector 4</p></div>
              </div>
              <ChevronRight className="text-slate-700" />
            </div>
          </div>
        ) : (
          <div className="glass-card p-6 border-white/5 space-y-4">
            <textarea placeholder="Observations..." className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm min-h-[100px]" />
            <button onClick={handleFormSubmit} disabled={isSubmitting} className="btn-primary w-full py-4 rounded-xl font-black">{isSubmitting ? 'Submitting...' : 'Submit to Manager'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
