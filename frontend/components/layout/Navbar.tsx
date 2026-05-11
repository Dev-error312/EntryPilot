'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Command,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

export default function Navbar({ title, subtitle }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <header className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Page title */}
        <div>
          {title && (
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 
                       text-sm text-gray-500 hover:border-gray-300 hover:bg-gray-50 
                       transition-all duration-150"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 
                           rounded text-xs bg-gray-100 text-gray-400 font-mono">
              <Command className="w-3 h-3" />K
            </kbd>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setNotificationsOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-white 
                               border border-gray-100 shadow-lg z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-medium text-gray-900">Notifications</h3>
                    </div>
                    <div className="p-2 max-h-80 overflow-y-auto">
                      <div className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm text-gray-900">No new notifications</p>
                        <p className="text-xs text-gray-500 mt-1">
                          You're all caught up!
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Search modal */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50"
            >
              <div className="bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search applicants, groups, applications..."
                    className="flex-1 text-gray-900 placeholder:text-gray-400 outline-none"
                    autoFocus
                  />
                  <kbd className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-400 font-mono">
                    ESC
                  </kbd>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500 text-center">
                    Start typing to search...
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
