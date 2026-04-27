'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { submitKYC } from '../../../services/kyc.service';

export default function KYCSubmissionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [docType, setDocType] = useState('GOVT_ID');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      // Convert file to base64 for simplicity in demo
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const result = await submitKYC({
          documents: [{
            type: docType,
            fileName: file.name,
            mimeType: file.type,
            base64Data: base64Data
          }]
        });

        if (result.ok) {
          setSuccess(true);
        } else {
          setError(result.error);
        }
        setLoading(false);
      };
    } catch (err: any) {
      setError('Failed to upload document');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#090E1A] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#111827] p-10 rounded-3xl border border-[#1E293B] text-center shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Documents Submitted</h2>
          <p className="text-[#94A3B8] mb-8">Our verification team will review your identity proof shortly. You will be notified once approved.</p>
          <button 
            onClick={() => router.push('/engineer')}
            className="w-full bg-[#7C3AED] py-4 rounded-xl font-bold hover:bg-[#6D28D9] transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090E1A] text-[#F8FAFC] p-6">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#94A3B8] hover:text-white mb-10 transition-colors"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="max-w-2xl mx-auto">
        <header className="mb-10">
          <div className="bg-[#7C3AED]/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-[#7C3AED]/20">
            <ShieldCheck size={32} className="text-[#7C3AED]" />
          </div>
          <h1 className="text-4xl font-bold mb-2 font-display">Identity Verification</h1>
          <p className="text-[#94A3B8]">To ensure the security of the platform, field engineers must provide valid identification.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <label className="text-sm font-bold uppercase tracking-widest text-[#64748B]">Document Type</label>
            <div className="grid grid-cols-2 gap-4">
              {['GOVT_ID', 'PASSPORT', 'DRIVERS_LICENSE', 'COMPANY_ID'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDocType(type)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    docType === type 
                    ? 'bg-[#7C3AED]/10 border-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/10' 
                    : 'bg-[#111827] border-[#1E293B] text-[#94A3B8] hover:border-[#334155]'
                  }`}
                >
                  <p className="font-bold text-sm">{type.replace('_', ' ')}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold uppercase tracking-widest text-[#64748B]">Upload Document</label>
            <div className="relative">
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden" 
                id="kyc-upload"
                accept="image/*,.pdf"
              />
              <label 
                htmlFor="kyc-upload"
                className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-[#1E293B] rounded-3xl bg-[#111827] hover:bg-[#1E293B]/50 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 bg-[#1E293B] rounded-full flex items-center justify-center mb-4 group-hover:bg-[#7C3AED]/10 transition-all">
                  <Upload size={24} className="text-[#64748B] group-hover:text-[#7C3AED]" />
                </div>
                <p className="font-bold text-lg mb-1">{file ? file.name : 'Select file or drag & drop'}</p>
                <p className="text-sm text-[#64748B]">PNG, JPG or PDF up to 10MB</p>
              </label>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || !file}
            className="w-full bg-[#7C3AED] py-5 rounded-2xl font-bold text-lg hover:bg-[#6D28D9] transition-all shadow-xl shadow-[#7C3AED]/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Submit for Verification'}
          </button>
        </form>
      </div>
    </div>
  );
}
