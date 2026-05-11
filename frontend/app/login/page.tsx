'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError, isHydrated, token, user } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isHydrated && token && user) {
      router.push('/dashboard');
    }
  }, [isHydrated, token, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(email, password);
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (err) {
      // Error is handled by store
    }
  };

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  // Don't show login if already authenticated
  if (token && user) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Back to home link */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <img src="/logo.png" alt="EntryPilot Logo" width={40} height={40} className="w-10 h-10" />
            </div>
            <span className="text-xl font-semibold text-gray-900">EntryPilot</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome back
            </h1>
            <p className="text-gray-500">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-gray-900 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-slate-800 active:bg-slate-950 transition-all focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">Demo Credentials</p>
            <div className="space-y-1.5 text-sm text-gray-600">
              <p><span className="font-medium">Super Admin:</span> super@entrypilot.com / admin123</p>
              <p><span className="font-medium">Agency Admin:</span> admin@demo.com / admin123</p>
              <p><span className="font-medium">Employee:</span> employee@demo.com / employee123</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-slate-950 items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-lg text-center"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl" />
            </div>
            <div className="relative grid grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                  className="aspect-square rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                />
              ))}
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">
            Streamline Your Visa Processing
          </h2>
          <p className="text-slate-400">
            Manage groups, applicants, and applications with ease. 
            OCR-powered imports and complete audit trails.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
