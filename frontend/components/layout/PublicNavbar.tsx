'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Menu } from 'lucide-react';

interface PublicNavbarProps {
  scrollToSection?: (id: string) => void;
}

export default function PublicNavbar({ scrollToSection }: PublicNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleBookDemo = () => {
    setMobileMenuOpen(false);
    if (scrollToSection) {
      scrollToSection('contact');
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded flex items-center justify-center">
              <img src="/logo.png" alt="EntryPilot Logo" width={32} height={32} className="w-8 h-8" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">EntryPilot</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="/" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="/" className="hover:text-slate-900 transition-colors">Workflow</a>
            <a href="/" className="hover:text-slate-900 transition-colors">Pricing</a>
            <a href="/" className="hover:text-slate-900 transition-colors">Security</a>
            <a href="/" className="hover:text-slate-900 transition-colors">FAQ</a>
            <a href="/" className="hover:text-slate-900 transition-colors">Contact</a>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <a href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Sign In
          </a>
          <button onClick={handleBookDemo} className="bg-slate-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-800 transition-all shadow-sm cursor-pointer border-none">
            Book Demo
          </button>
        </div>
        
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-slate-100 rounded transition-colors"
        >
          <Menu className="w-6 h-6 text-slate-900" />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3"
        >
          <a href="/" className="block w-full text-left py-2 text-slate-600 hover:text-slate-900">Features</a>
          <a href="/" className="block w-full text-left py-2 text-slate-600 hover:text-slate-900">Workflow</a>
          <a href="/" className="block w-full text-left py-2 text-slate-600 hover:text-slate-900">Pricing</a>
          <a href="/" className="block w-full text-left py-2 text-slate-600 hover:text-slate-900">Security</a>
          <a href="/" className="block w-full text-left py-2 text-slate-600 hover:text-slate-900">FAQ</a>
          <a href="/" className="block w-full text-left py-2 text-slate-600 hover:text-slate-900">Contact</a>
          <hr className="my-3" />
          <a href="/login" className="block py-2 text-slate-600 hover:text-slate-900">Sign In</a>
          <button onClick={handleBookDemo} className="block w-full bg-slate-900 text-white px-4 py-2 rounded text-center font-medium cursor-pointer border-none">Book Demo</button>
        </motion.div>
      )}
    </nav>
  );
}
