'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-slate-400 font-medium font-display tracking-tight">Redirecting to login...</p>
      </div>
    </div>
  );
}
