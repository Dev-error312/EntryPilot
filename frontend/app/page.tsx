'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { isHydrated, token, user } = useAuthStore();

  useEffect(() => {
    // Wait for hydration before redirecting
    if (!isHydrated) return;

    if (token && user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [isHydrated, token, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">V</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">EntryPilot</h1>
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mt-4" />
        <p className="text-gray-500 mt-2">Loading...</p>
      </div>
    </div>
  );
}
