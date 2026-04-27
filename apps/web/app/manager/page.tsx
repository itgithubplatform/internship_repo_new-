'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardCheck, CheckCircle2, ChevronRight, BarChart3, Eye, XCircle } from 'lucide-react';

export default function ManagerDashboard() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any>(null);

  useEffect(() => {
    const loadData = () => {
      const defaultSubs = [
        { id: 'SUB-1022', engineer: 'Taylor Smith', form: 'Field Progress Report', time: '1 hour ago', status: 'Approved' },
      ];
      const saved = JSON.parse(localStorage.getItem('demo_submissions') || '[]');
      setSubmissions([...saved, ...defaultSubs]);
    };
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const handleReview = (id: string, newStatus: string) => {
    const updated = submissions.map(s => s.id === id ? { ...s, status: newStatus } : s);
    setSubmissions(updated);
    // Update localStorage to reflect changes if it was a saved one
    const saved = JSON.parse(localStorage.getItem('demo_submissions') || '[]');
    const newSaved = saved.map((s: any) => s.id === id ? { ...s, status: newStatus } : s);
    localStorage.setItem('demo_submissions', JSON.stringify(newSaved));
    setSelectedSub(null);
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
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Operations Hub</p>
          </div>
        </div>
        <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="bg-rose-500/10 text-rose-400 px-4 py-2 rounded-xl text-xs font-black">LOG OUT</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-black text-sm uppercase text-slate-500 tracking-widest">Incoming Submissions</h3>
          {submissions.map((sub) => (
            <div 
              key={sub.id} 
              onClick={() => setSelectedSub(sub)}
              className={`glass-card p-5 border-white/5 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-all ${selectedSub?.id === sub.id ? 'ring-2 ring-primary' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${sub.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'}`}>
                   {sub.status === 'Approved' ? <CheckCircle2 size={20} /> : <Eye size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{sub.form}</h4>
                  <p className="text-[10px] text-slate-500">{sub.engineer} • {sub.time}</p>
                </div>
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded bg-white/5 ${sub.status === 'Approved' ? 'text-emerald-400' : 'text-primary'}`}>{sub.status}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="font-black text-sm uppercase text-slate-500 tracking-widest">Review Panel</h3>
          {selectedSub ? (
            <div className="glass-card p-6 border-primary/20 bg-primary/5">
              <h4 className="font-black text-sm mb-4">{selectedSub.id} - {selectedSub.form}</h4>
              <p className="text-xs text-slate-400 mb-6 italic">"Site inspection completed successfully. No safety issues found."</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleReview(selectedSub.id, 'Rejected')} className="py-2 rounded-lg border border-rose-500/30 text-rose-400 text-xs font-black">REJECT</button>
                <button onClick={() => handleReview(selectedSub.id, 'Approved')} className="py-2 rounded-lg bg-emerald-500 text-white text-xs font-black">APPROVE</button>
              </div>
            </div>
          ) : (
             <div className="glass-card p-10 text-center border-white/5 text-slate-600 text-xs font-bold">Select a submission to review</div>
          )}
        </div>
      </div>
    </div>
  );
}
