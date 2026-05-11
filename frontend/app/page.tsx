'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import LandingPage from './landing/page';

export default function Home() {
  const router = useRouter();
  const { isHydrated, token, user } = useAuthStore();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    // If user is authenticated, redirect to dashboard
    if (token && user) {
      router.push('/dashboard');
    } else {
      // Show landing page for non-authenticated users
      setShowLanding(true);
    }
  }, [isHydrated, token, user, router]);

  // Show loading while checking auth
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mt-4" />
          <p className="text-slate-500 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, don't show anything (will redirect)
  if (token && user) {
    return null;
  }

  // Show landing page for non-authenticated users
  return <LandingPage />;
}
