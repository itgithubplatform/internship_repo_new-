'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search, 
  Filter,
  ChevronRight,
  Clock,
  User,
  FileText
} from 'lucide-react';

export default function ManagerDashboard() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('SUBMITTED');

  useEffect(() => {
    // Mock fetching pending submissions for the manager's tenant
    setTimeout(() => {
      setSubmissions([
        { 
          id: '101', 
          engineerName: 'Alice Smith', 
          formTitle: 'Electrical Safety Audit', 
          submittedAt: '2024-04-26 10:30', 
          status: 'SUBMITTED',
          tenantId: 'tenant-1'
        },
        { 
          id: '102', 
          engineerName: 'Bob Johnson', 
          formTitle: 'Structural Integrity Check', 
          submittedAt: '2024-04-26 11:15', 
          status: 'SUBMITTED',
          tenantId: 'tenant-1'
        },
        { 
          id: '103', 
          engineerName: 'Charlie Brown', 
          formTitle: 'Fire Safety Inspection', 
          submittedAt: '2024-04-25 15:45', 
          status: 'APPROVED',
          tenantId: 'tenant-1'
        }
      ]);
      setLoading(false);
    }, 1200);
  }, []);

  const filteredSubmissions = submissions.filter(s => filter === 'ALL' || s.status === filter);

  return (
    <div className="min-h-screen bg-[#090E1A] text-[#F8FAFC]">
      {/* Header */}
      <header className="border-b border-[#1E293B] bg-[#111827] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-[#10B981] p-2 rounded-lg">
            <CheckCircle size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold">Manager Portal</h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-[#94A3B8]">
          <span className="bg-[#1E293B] px-3 py-1 rounded-full border border-[#1E293B]">Tenant: Acme Corp</span>
          <div className="w-8 h-8 rounded-full bg-[#1E293B] border border-[#10B981] flex items-center justify-center font-bold text-xs text-white">
            JD
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Submissions Review</h2>
            <p className="text-[#94A3B8]">Review and approve field reports from your engineering team.</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-[#111827] border border-[#1E293B] rounded-lg px-4 py-2 flex items-center gap-2">
              <Search size={18} className="text-[#64748B]" />
              <input 
                type="text" 
                placeholder="Search engineer..." 
                className="bg-transparent border-none outline-none text-sm w-48"
              />
            </div>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#111827] border border-[#1E293B] rounded-lg px-4 py-2 text-sm outline-none cursor-pointer"
            >
              <option value="SUBMITTED">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ALL">All Submissions</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-[#111827] p-6 rounded-2xl border border-[#1E293B] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Clock size={64} />
            </div>
            <p className="text-sm text-[#64748B] font-semibold mb-1">Awaiting Review</p>
            <p className="text-4xl font-bold">24</p>
          </div>
          <div className="bg-[#111827] p-6 rounded-2xl border border-[#1E293B] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-[#10B981]">
              <CheckCircle size={64} />
            </div>
            <p className="text-sm text-[#64748B] font-semibold mb-1">Approved (Today)</p>
            <p className="text-4xl font-bold text-[#10B981]">12</p>
          </div>
          <div className="bg-[#111827] p-6 rounded-2xl border border-[#1E293B] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-[#EF4444]">
              <XCircle size={64} />
            </div>
            <p className="text-sm text-[#64748B] font-semibold mb-1">Rejected (Today)</p>
            <p className="text-4xl font-bold text-[#EF4444]">3</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#111827] rounded-2xl border border-[#1E293B] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#1E293B]/30">
                <th className="p-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Engineer</th>
                <th className="p-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Form Title</th>
                <th className="p-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Submitted At</th>
                <th className="p-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-[#64748B] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#10B981]"></div>
                  </td>
                </tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-[#64748B]">
                    No submissions found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map(s => (
                  <tr key={s.id} className="border-b border-[#1E293B] hover:bg-[#1E293B]/20 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center">
                          <User size={14} className="text-[#94A3B8]" />
                        </div>
                        <span className="font-semibold">{s.engineerName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[#64748B]" />
                        <span>{s.formTitle}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[#94A3B8]">{s.submittedAt}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        s.status === 'SUBMITTED' ? 'bg-blue-500/10 text-blue-400' : 
                        s.status === 'APPROVED' ? 'bg-green-500/10 text-green-400' : 
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-[#10B981] hover:bg-[#10B981]/10 p-2 rounded-lg transition-all mr-2">
                        <CheckCircle size={18} />
                      </button>
                      <button className="text-[#EF4444] hover:bg-[#EF4444]/10 p-2 rounded-lg transition-all mr-2">
                        <XCircle size={18} />
                      </button>
                      <button className="text-[#94A3B8] hover:bg-[#94A3B8]/10 p-2 rounded-lg transition-all">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
