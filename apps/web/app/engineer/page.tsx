'use client';

import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  ShieldCheck, 
  Bell, 
  LogOut, 
  ChevronRight,
  PlusCircle,
  FileText
} from 'lucide-react';
import { getMyKYCStatus } from '../../services/kyc.service';

export default function EngineerDashboard() {
  const [kycStatus, setKycStatus] = useState<string>('LOADING');
  const [activeTab, setActiveTab] = useState('assignments');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    const result = await getMyKYCStatus();
    if (result.ok) {
      setKycStatus(result.data.status);
    } else {
      setKycStatus('NOT_SUBMITTED');
    }
  };

  const mockAssignments = [
    { id: '1', title: 'Site Inspection - Site Alpha', dueDate: '2024-05-01', status: 'TODO' },
    { id: '2', title: 'Safety Compliance Check', dueDate: '2024-05-03', status: 'IN_PROGRESS' },
  ];

  return (
    <div className="min-h-screen bg-[#090E1A] text-[#F8FAFC]">
      {/* Header */}
      <header className="border-b border-[#1E293B] bg-[#111827] px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-[#7C3AED] p-2 rounded-lg">
            <ClipboardList size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold">Engineer Portal</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-[#94A3B8] hover:text-[#7C3AED] transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#1E293B] border border-[#7C3AED] flex items-center justify-center text-xs font-bold">
            JD
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* KYC Alert */}
        {kycStatus !== 'APPROVED' && (
          <div className={`mb-8 p-4 rounded-xl border flex items-center justify-between ${
            kycStatus === 'PENDING' ? 'bg-[#2D1A00] border-[#F59E0B]/30' : 'bg-[#2D0606] border-[#EF4444]/30'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${
                kycStatus === 'PENDING' ? 'bg-[#F59E0B]/20' : 'bg-[#EF4444]/20'
              }`}>
                <ShieldCheck size={24} className={kycStatus === 'PENDING' ? 'text-[#F59E0B]' : 'text-[#EF4444]'} />
              </div>
              <div>
                <h3 className="font-bold">Identity Verification {kycStatus === 'PENDING' ? 'Pending' : 'Required'}</h3>
                <p className="text-sm text-[#94A3B8]">
                  {kycStatus === 'PENDING' 
                    ? 'Our team is reviewing your documents. Please wait.' 
                    : 'Upload your documents to unlock full platform access.'}
                </p>
              </div>
            </div>
            {kycStatus !== 'PENDING' && (
              <button className="bg-[#7C3AED] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#6D28D9] transition-all">
                Verify Now
              </button>
            )}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#111827] p-4 rounded-xl border border-[#1E293B]">
            <p className="text-xs text-[#64748B] uppercase font-bold tracking-wider mb-1">Open Assignments</p>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div className="bg-[#111827] p-4 rounded-xl border border-[#1E293B]">
            <p className="text-xs text-[#64748B] uppercase font-bold tracking-wider mb-1">Completed This Week</p>
            <p className="text-2xl font-bold text-[#10B981]">8</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-[#1E293B] mb-6">
          <button 
            onClick={() => setActiveTab('assignments')}
            className={`pb-3 px-2 font-semibold transition-all relative ${
              activeTab === 'assignments' ? 'text-[#7C3AED]' : 'text-[#64748B]'
            }`}
          >
            My Assignments
            {activeTab === 'assignments' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED]"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('drafts')}
            className={`pb-3 px-2 font-semibold transition-all relative ${
              activeTab === 'drafts' ? 'text-[#7C3AED]' : 'text-[#64748B]'
            }`}
          >
            Offline Drafts
            {activeTab === 'drafts' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED]"></div>}
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'assignments' ? (
            mockAssignments.map(item => (
              <div key={item.id} className="bg-[#111827] p-4 rounded-xl border border-[#1E293B] hover:border-[#7C3AED]/50 transition-all cursor-pointer group">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#1E293B] p-3 rounded-lg group-hover:bg-[#7C3AED]/10 transition-all">
                      <FileText size={20} className="text-[#94A3B8] group-hover:text-[#7C3AED]" />
                    </div>
                    <div>
                      <h4 className="font-bold">{item.title}</h4>
                      <p className="text-xs text-[#64748B]">Due: {item.dueDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${
                      item.status === 'TODO' ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                    <ChevronRight size={16} className="text-[#334155]" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-[#111827] rounded-xl border border-dashed border-[#1E293B]">
              <PlusCircle size={48} className="mx-auto text-[#1E293B] mb-4" />
              <p className="text-[#64748B]">No offline drafts found</p>
            </div>
          )}
        </div>
      </main>

      {/* Mobile-first bottom nav (for PWA feel) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111827] border-t border-[#1E293B] px-6 py-3 flex justify-between items-center z-10">
        <button className="flex flex-col items-center gap-1 text-[#7C3AED]">
          <ClipboardList size={20} />
          <span className="text-[10px] font-bold">Work</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#64748B]">
          <Bell size={20} />
          <span className="text-[10px] font-bold">Alerts</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#64748B]">
          <LogOut size={20} />
          <span className="text-[10px] font-bold">Exit</span>
        </button>
      </div>
    </div>
  );
}
