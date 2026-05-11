'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Menu } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sections = [
    {
      number: 1,
      title: 'Introduction',
      content: [
        'EntryPilot ("we," "our," or "us") is committed to protecting the privacy and security of our users and their data.',
        'This Privacy Policy explains how we collect, use, store, and safeguard information when agencies use the EntryPilot platform.',
        'By accessing or using EntryPilot, you agree to the practices described in this policy.',
      ],
    },
    {
      number: 2,
      title: 'Information We Collect',
      subsections: [
        {
          subtitle: 'Account Information',
          content: [
            'We collect information provided during account registration, including:',
            '• Agency name',
            '• User names',
            '• Email addresses',
            '• Login credentials',
            '• Subscription details',
          ],
        },
        {
          subtitle: 'Applicant Data Uploaded by Agencies',
          content: [
            'Agencies may upload applicant information including:',
            '• Full name',
            '• Date of birth',
            '• Passport information',
            '• Contact details',
            '• Travel-related information',
            '• Uploaded forms and supporting documents',
            'EntryPilot processes this information solely to provide workflow management services.',
          ],
        },
        {
          subtitle: 'Usage Information',
          content: [
            'We automatically collect technical usage data such as:',
            '• Browser type',
            '• Device information',
            '• IP address',
            '• Login timestamps',
            '• Activity logs',
            '• Platform interactions',
          ],
        },
      ],
    },
    {
      number: 3,
      title: 'How We Use Information',
      content: [
        'We use collected information to:',
        '• Provide and maintain the platform',
        '• Authenticate users',
        '• Process uploaded applicant data',
        '• Improve platform performance',
        '• Provide customer support',
        '• Monitor system security',
        '• Prevent unauthorized access',
        '• Comply with legal obligations',
        'We do not sell user data.',
      ],
    },
    {
      number: 4,
      title: 'Data Ownership',
      content: [
        'Agencies retain full ownership of all applicant and operational data uploaded to EntryPilot.',
        'EntryPilot acts solely as a secure data processor and platform provider.',
      ],
    },
    {
      number: 5,
      title: 'Data Security',
      content: [
        'We implement industry-standard safeguards including:',
        '• Encrypted authentication',
        '• Role-based access controls',
        '• Audit logging',
        '• Secure cloud infrastructure',
        '• Access monitoring',
        '• Data isolation between organizations',
        'While we take strong precautions, no online platform can guarantee absolute security.',
      ],
    },
    {
      number: 6,
      title: 'Data Retention',
      content: [
        'We retain data only as long as necessary to:',
        '• Provide services',
        '• Meet legal obligations',
        '• Resolve disputes',
        '• Maintain operational integrity',
        'Agencies may request deletion of their data upon account termination.',
      ],
    },
    {
      number: 7,
      title: 'Third-Party Services',
      content: [
        'EntryPilot may use trusted third-party providers for:',
        '• Cloud hosting',
        '• Database management',
        '• Payment processing',
        '• Error monitoring',
        '• Analytics',
        'These providers are contractually required to maintain data security.',
      ],
    },
    {
      number: 8,
      title: 'International Data Transfers',
      content: [
        'If data is processed outside your jurisdiction, we apply appropriate safeguards to protect it.',
      ],
    },
    {
      number: 9,
      title: 'Your Rights',
      content: [
        'Users may request to:',
        '• Access stored data',
        '• Correct inaccurate information',
        '• Request deletion',
        '• Export organization data',
        '• Restrict certain processing activities',
        'Requests can be submitted through official support channels.',
      ],
    },
    {
      number: 10,
      title: 'Policy Updates',
      content: [
        'We may update this Privacy Policy periodically.',
        'Changes become effective upon posting.',
        'Continued use of EntryPilot constitutes acceptance of updated terms.',
      ],
    },
    {
      number: 11,
      title: 'Contact',
      content: [
        'For privacy-related questions, contact:',
        'privacy@entrypilot.com',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* Navbar */}
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
            <button onClick={() => scrollToSection('contact')} className="bg-slate-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-800 transition-all shadow-sm cursor-pointer border-none">
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
            <button onClick={() => scrollToSection('contact')} className="block w-full bg-slate-900 text-white px-4 py-2 rounded text-center font-medium cursor-pointer border-none">Book Demo</button>
          </motion.div>
        )}
      </nav>

      {/* Main Content with top padding for fixed navbar */}
      <div className="pt-16">
        {/* Header */}
        <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Privacy Policy
              </h1>
              <p className="text-lg text-slate-600">
                How EntryPilot collects, uses, and protects your information.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-12"
          >
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100">
                    <span className="text-sm font-bold text-blue-600">{section.number}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    {section.title}
                  </h2>

                  {section.content && (
                    <div className="space-y-3">
                      {section.content.map((line, idx) => (
                        <p
                          key={idx}
                          className={`text-slate-700 leading-relaxed ${
                            line.startsWith('•') ? 'ml-4' : ''
                          }`}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  )}

                  {section.subsections && (
                    <div className="space-y-6">
                      {section.subsections.map((subsection, subIdx) => (
                        <div key={subIdx} className="ml-4">
                          <h3 className="text-lg font-semibold text-slate-900 mb-3">
                            {subsection.subtitle}
                          </h3>
                          <div className="space-y-2">
                            {subsection.content.map((line, idx) => (
                              <p
                                key={idx}
                                className={`text-slate-700 leading-relaxed ${
                                  line.startsWith('•') ? 'ml-4' : ''
                                }`}
                              >
                                {line}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="mt-16 pt-12 border-t border-slate-200"
        >
          <div className="bg-blue-50 rounded-xl p-8 border border-blue-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Questions About Our Privacy Policy?
            </h3>
            <p className="text-slate-700 mb-4">
              If you have any privacy-related questions or concerns, please reach out to us:
            </p>
            <a
              href="mailto:privacy@entrypilot.com"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              Email us at privacy@entrypilot.com
            </a>
          </div>
        </motion.div>

        {/* Last Updated */}
        <div className="mt-12 text-center text-sm text-slate-500">
          <p>Last updated: May 2026</p>
        </div>
      </div>
    </div>

    {/* Footer */}
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
              <li><a href="/privacy" className="hover:text-blue-600">Privacy Policy</a></li>
              <li><a href="/" className="hover:text-blue-600">Terms of Service</a></li>
              <li><a href="/" className="hover:text-blue-600">Cookie Policy</a></li>
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
    </div>
  );
}
