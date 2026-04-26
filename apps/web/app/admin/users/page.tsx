'use client';

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Search, 
  MoreVertical, 
  Filter,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  ArrowRight
} from 'lucide-react';

export default function AdminUserManagement() {
  const [users, setUsers] = useState([
    { id: '1', name: 'John Doe', email: 'john@acme.com', role: 'MANAGER', kycStatus: 'APPROVED', status: 'ACTIVE' },
    { id: '2', name: 'Sarah Smith', email: 'sarah@acme.com', role: 'ENGINEER', kycStatus: 'APPROVED', status: 'ACTIVE' },
    { id: '3', name: 'Mike Ross', email: 'mike@acme.com', role: 'ENGINEER', kycStatus: 'PENDING', status: 'INACTIVE' },
    { id: '4', name: 'Emily Blunt', email: 'emily@acme.com', role: 'MANAGER', kycStatus: 'APPROVED', status: 'ACTIVE' },
  ]);

  return (
    <div className="min-h-screen bg-[#020617] text-[#F8FAFC]">
      <main className="max-w-7xl mx-auto p-8">
        <header className="flex justify-between items-end mb-10">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-widest mb-2">
              <Users size={16} /> Team Management
            </div>
            <h1 className="text-4xl font-display font-bold">User Directory</h1>
          </div>
          <button className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
            <UserPlus size={20} /> Invite New Member
          </button>
        </header>

        {/* Filters & Search */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, email or role..."
              className="w-full bg-[#0F172A] border border-white/5 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500/50 transition-all text-slate-200"
            />
          </div>
          <button className="bg-[#0F172A] border border-white/5 px-6 rounded-2xl flex items-center gap-2 text-slate-400 hover:text-white transition-all">
            <Filter size={18} /> Filters
          </button>
        </div>

        {/* User Stats Summary */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Members', value: '42', icon: Users, color: 'text-blue-400' },
            { label: 'Active Now', value: '18', icon: UserCheck, color: 'text-blue-400' },
            { label: 'KYC Pending', value: '5', icon: ShieldAlert, color: 'text-rose-400' },
            { label: 'Open Invites', value: '3', icon: Mail, color: 'text-amber-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#0F172A] border border-white/5 p-6 rounded-2xl group hover:border-white/10 transition-all">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</p>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold font-display">{stat.value}</p>
                <stat.icon size={24} className={stat.color} />
              </div>
            </div>
          ))}
        </div>

        {/* User Table */}
        <div className="bg-[#0F172A] border border-white/5 rounded-3xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-500 text-xs font-bold uppercase tracking-widest">
                <th className="p-5">User</th>
                <th className="p-5">Role</th>
                <th className="p-5">KYC Status</th>
                <th className="p-5">System Status</th>
                <th className="p-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold border border-white/10">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold group-hover:text-blue-400 transition-colors">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${
                      user.role === 'MANAGER' ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' : 'border-slate-500/30 bg-slate-500/10 text-slate-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      {user.kycStatus === 'APPROVED' ? (
                        <ShieldCheck size={16} className="text-blue-500" />
                      ) : (
                        <ShieldAlert size={16} className="text-amber-500" />
                      )}
                      <span className={`text-sm ${user.kycStatus === 'APPROVED' ? 'text-blue-500' : 'text-amber-500'}`}>
                        {user.kycStatus}
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-blue-500' : 'bg-slate-600'}`}></div>
                      <span className="text-sm">{user.status}</span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="bg-white/5 hover:bg-white/10 p-2 rounded-lg text-slate-400 hover:text-white transition-all">
                        <Mail size={16} />
                      </button>
                      <button className="bg-white/5 hover:bg-white/10 p-2 rounded-lg text-slate-400 hover:text-white transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-white/5 flex justify-center">
            <button className="text-slate-500 hover:text-white text-sm font-bold flex items-center gap-2 transition-all">
              Load More <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
