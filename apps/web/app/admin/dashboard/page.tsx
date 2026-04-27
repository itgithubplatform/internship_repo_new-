'use client';

import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Activity, Check, X, Building2 } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'members' | 'kyc'>('members');
  const [kycRequests, setKycRequests] = useState<any[]>([]);

  useEffect(() => {
    const checkKyc = () => {
      const status = localStorage.getItem('demo_kyc_status');
      const name = localStorage.getItem('demo_kyc_name');
      if (status === 'submitted' && name) {
        setKycRequests([{ id: 'KYC-NEW', name, type: 'Gov ID', submittedAt: 'Just now' }]);
      } else {
        setKycRequests([]);
      }
    };
    checkKyc();
    window.addEventListener('storage', checkKyc);
    return () => window.removeEventListener('storage', checkKyc);
  }, []);

  const handleApproveKyc = () => {
    localStorage.setItem('demo_kyc_status', 'approved');
    setKycRequests([]);
    alert('KYC Approved! The Engineer now has full access.');
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 overflow-hidden rounded-2xl border border-white/10 shadow-xl group">
            <img 
              src="/logo.png" 
              alt="VeroFlow Logo" 
              className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-500" 
            />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">VeroFlow</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Admin Command Center</p>
          </div>
        </div>
        <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="bg-rose-500/10 text-rose-400 px-4 py-2 rounded-xl text-xs font-black">LOG OUT</button>
      </div>

      <div className="flex gap-4 mb-8">
        <button onClick={() => setActiveTab('members')} className={`px-6 py-2 rounded-xl text-xs font-black ${activeTab === 'members' ? 'bg-primary' : 'bg-white/5'}`}>MEMBERS</button>
        <button onClick={() => setActiveTab('kyc')} className={`px-6 py-2 rounded-xl text-xs font-black relative ${activeTab === 'kyc' ? 'bg-amber-500' : 'bg-white/5'}`}>
          KYC QUEUE
          {kycRequests.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {activeTab === 'members' ? (
            <div className="glass-card p-6 border-white/5">
              <h3 className="font-bold text-lg mb-6">Organization Team</h3>
              <div className="space-y-4 text-sm">
                 <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <span className="font-bold">Marcus Chen</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded">MANAGER</span>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 opacity-50">
                    <span className="font-bold">John Engineer</span>
                    <span className="text-[10px] bg-slate-500/20 text-slate-400 px-2 py-1 rounded">PENDING KYC</span>
                 </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {kycRequests.length > 0 ? kycRequests.map(req => (
                <div key={req.id} className="glass-card p-6 border-amber-500/20 flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-sm">{req.name}</h4>
                    <p className="text-[10px] text-slate-500">{req.type} • {req.submittedAt}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg border border-rose-500/30 text-rose-400"><X size={18} /></button>
                    <button onClick={handleApproveKyc} className="bg-emerald-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase">APPROVE KYC</button>
                  </div>
                </div>
              )) : (
                <div className="glass-card p-12 text-center text-slate-600 text-xs font-bold">No pending KYC verifications</div>
              )}
            </div>
          )}
        </div>

        <div className="glass-card p-6 border-white/5">
          <h3 className="font-black text-lg mb-4">System Health</h3>
          <div className="space-y-3">
             <div className="flex justify-between p-3 bg-white/5 rounded-lg text-[10px] font-black uppercase"><span className="text-slate-500">Postgres DB</span><span className="text-emerald-400">ONLINE</span></div>
             <div className="flex justify-between p-3 bg-white/5 rounded-lg text-[10px] font-black uppercase"><span className="text-slate-500">Redis Cache</span><span className="text-emerald-400">ONLINE</span></div>
             <div className="flex justify-between p-3 bg-white/5 rounded-lg text-[10px] font-black uppercase"><span className="text-slate-500">API Gateway</span><span className="text-emerald-400">ONLINE</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
