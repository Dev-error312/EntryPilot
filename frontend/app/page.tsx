'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { isHydrated, token, user } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    if (token && user) {
      router.replace('/dashboard');
    } else {
      router.replace('/landing');
    }
  }, [isHydrated, token, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
}
