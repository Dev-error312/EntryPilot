'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import LandingPage from '@/app/landing/page';

export default function Home() {
  const router = useRouter();
  const { isHydrated, token, user } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    if (token && user) {
      router.replace('/dashboard');
    }
  }, [isHydrated, token, user, router]);

  // Root path behavior:
  // - Logged-in user -> dashboard
  // - Guest (or while hydration resolves) -> landing page
  if (isHydrated && token && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return <LandingPage />;
}
