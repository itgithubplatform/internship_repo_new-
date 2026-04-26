'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  Building2, 
  BarChart3, 
  Plus, 
  MoreVertical, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
  Globe
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState([
    { id: '1', name: 'Acme Engineering', users: 156, tier: 'ENTERPRISE', kycStatus: 'VERIFIED', health: 'Healthy' },
    { id: '2', name: 'Global Infra Ltd', users: 89, tier: 'PRO', kycStatus: 'VERIFIED', health: 'Healthy' },
    { id: '3', name: 'BuildWise Co', users: 45, tier: 'BASIC', kycStatus: 'PENDING', health: 'Warning' },
  ]);

  return (
    <div className="min-h-screen bg-[#020617] text-[#F8FAFC]">
      {/* Sidebar (Simplified for Demo) */}
      <div className="fixed left-0 top-0 h-full w-64 bg-[#0F172A] border-r border-white/5 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-xl">
            <Shield size={24} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Antigravity<span className="text-blue-500">.</span></span>
        </div>
        
        <nav className="flex flex-col gap-2">
          <button className="flex items-center gap-3 bg-blue-500/10 text-blue-400 p-3 rounded-xl font-medium">
            <BarChart3 size={20} /> Dashboard
          </button>
          <button className="flex items-center gap-3 text-slate-400 p-3 rounded-xl hover:bg-white/5 transition-all">
            <Building2 size={20} /> Tenants
          </button>
          <button className="flex items-center gap-3 text-slate-400 p-3 rounded-xl hover:bg-white/5 transition-all">
            <Users size={20} /> Global Users
          </button>
          <button className="flex items-center gap-3 text-slate-400 p-3 rounded-xl hover:bg-white/5 transition-all">
            <Globe size={20} /> Audit Logs
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">Global Overview</h1>
            <p className="text-slate-400">Managing <span className="text-white font-semibold">12 Tenants</span> across <span className="text-white font-semibold">4 regions</span>.</p>
          </div>
          <button className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
            <Plus size={20} /> Onboard New Tenant
          </button>
        </header>

        {/* Global Stats */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Revenue', value: '$1.2M', icon: TrendingUp, color: 'text-blue-400' },
            { label: 'Active Users', value: '4,520', icon: Users, color: 'text-blue-400' },
            { label: 'System Health', value: '99.9%', icon: Activity, color: 'text-amber-400' },
            { label: 'KYC Pending', value: '18', icon: Shield, color: 'text-rose-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#0F172A] border border-white/5 p-6 rounded-2xl relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon size={48} className={stat.color} />
              </div>
              <p className="text-slate-400 text-sm font-semibold mb-1 uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-bold font-display">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tenant Management Table */}
        <div className="bg-[#0F172A] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h3 className="font-display font-bold text-xl">Active Tenants</h3>
            <div className="flex gap-2">
              <button className="text-slate-400 hover:text-white p-2">
                <BarChart3 size={18} />
              </button>
            </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-500 text-xs font-bold uppercase tracking-widest">
                <th className="p-5">Tenant Name</th>
                <th className="p-5">User Count</th>
                <th className="p-5">Tier</th>
                <th className="p-5">KYC Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold border border-white/10">
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold">{t.name}</p>
                        <p className="text-xs text-slate-500">ID: {t.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t.users}</span>
                      <span className="text-xs text-blue-500 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full">+12%</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      t.tier === 'ENTERPRISE' ? 'border-purple-500/30 bg-purple-500/10 text-purple-400' :
                      t.tier === 'PRO' ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' :
                      'border-slate-500/30 bg-slate-500/10 text-slate-400'
                    }`}>
                      {t.tier}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${t.kycStatus === 'VERIFIED' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                      <span className="text-sm">{t.kycStatus}</span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <button className="bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-all text-slate-400 hover:text-white mr-2">
                      <ExternalLink size={16} />
                    </button>
                    <button className="bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-all text-slate-400 hover:text-white">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-white/5 text-center">
            <button className="text-blue-400 text-sm font-bold hover:underline flex items-center gap-1 mx-auto">
              View All Tenants <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
