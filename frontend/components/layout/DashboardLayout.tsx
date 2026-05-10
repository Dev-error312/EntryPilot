'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, isHydrated, token, user } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for Zustand to hydrate from localStorage
    if (!isHydrated) {
      return;
    }

    // After hydration, check if user has valid token
    if (!token || !user) {
      router.push('/login');
      return;
    }

    // Mark as ready to render
    setIsReady(true);
  }, [isHydrated, token, user, router]);

  // Show loading state while hydrating
  if (!isHydrated || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !token) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-[260px]">
        <Navbar title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}