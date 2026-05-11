'use client';

import Link from 'next/link';

export default function PublicFooter() {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
              <div className="w-6 h-6 rounded flex items-center justify-center">
                <img src="/logo.png" alt="EntryPilot Logo" width={24} height={24} className="w-6 h-6" />
              </div>
              <span className="text-lg font-bold text-slate-900">EntryPilot</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              The modern standard for global visa processing operations.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 mb-6 text-sm">Product</h5>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="/" className="hover:text-blue-600">Features</a></li>
              <li><a href="/" className="hover:text-blue-600">OCR Engine</a></li>
              <li><a href="/" className="hover:text-blue-600">Security</a></li>
              <li><a href="/" className="hover:text-blue-600">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 mb-6 text-sm">Company</h5>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="/" className="hover:text-blue-600">About Us</a></li>
              <li><a href="/" className="hover:text-blue-600">Contact</a></li>
              <li><a href="/" className="hover:text-blue-600">Careers</a></li>
              <li><a href="/" className="hover:text-blue-600">Blog</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 mb-6 text-sm">Legal</h5>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-blue-600">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-50 text-[11px] text-slate-400 font-medium uppercase tracking-widest">
          <div>© 2026 EntryPilot Systems Inc. All rights reserved.</div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">Twitter</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">LinkedIn</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
