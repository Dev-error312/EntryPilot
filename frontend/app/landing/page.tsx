'use client';

import { useState } from 'react';
import Link from 'next/link';

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Group-Based Management',
    description: 'Organize applicants by travel batch, group code, or specific departure dates for seamless coordination.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'OCR + Handwritten Reading',
    description: 'Proprietary AI reads scanned PDFs and handwritten forms to auto-populate applicant profiles instantly.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: 'Workflow Automation',
    description: 'Moving applicants from Draft to Approved is automated through your custom defined pipeline.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: 'Multi-Tenant Architecture',
    description: 'Secure isolation for multi-office firms. Manage branches, sub-agents, and HQ in one secure portal.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    title: 'Smart Form Templates',
    description: 'Country-specific intelligence that validates data as you type, ensuring 100% submission success rate.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Audit & Compliance',
    description: 'Every action is recorded. Filter by user, date, or applicant to see the full history of an application.',
  },
];

const pricingPlans = [
  {
    name: 'Basic',
    price: '$39',
    description: 'For Small Agencies',
    features: [
      { text: 'Up to 5 team members', included: true },
      { text: 'Up to 300 applicants / mo', included: true },
      { text: 'Group applicant management', included: true },
      { text: 'Workflow tracking', included: true },
      { text: 'CSV / Excel imports', included: true },
      { text: 'OCR PDF extraction', included: false },
      { text: 'Custom templates', included: false },
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Premium',
    price: '$149',
    description: 'For Growing Agencies',
    features: [
      { text: 'Up to 25 team members', included: true },
      { text: 'Up to 3,000 applicants / mo', included: true },
      { text: 'OCR PDF extraction', included: true },
      { text: 'Handwritten form parsing', included: true },
      { text: 'Custom visa templates', included: true },
      { text: 'Full audit logs', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Start Premium',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For High-Volume Operations',
    features: [
      { text: 'Unlimited users & applicants', included: true },
      { text: 'Multi-branch operations', included: true },
      { text: 'White-label deployment', included: true },
      { text: 'API access & webhooks', included: true },
      { text: 'Dedicated onboarding', included: true },
      { text: 'SLA support', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const faqs = [
  {
    question: 'Can I upgrade anytime?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time from your organization settings. Changes are applied immediately and prorated for the current billing cycle.',
  },
  {
    question: 'Is onboarding included?',
    answer: 'Standard onboarding is available to all users. Enterprise customers receive a dedicated implementation specialist to help migrate existing data and setup custom workflows.',
  },
  {
    question: 'How does OCR billing work?',
    answer: 'OCR and Handwriting parsing are included in our Premium and Enterprise tiers. There are no per-document fees within your monthly applicant limit.',
  },
  {
    question: 'Do you support enterprise deployments?',
    answer: 'Absolutely. We support multi-branch configurations, custom data residency requirements, and SAML/SSO integration for large-scale agency networks.',
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/landing" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">EntryPilot</span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
              <a href="#workflow" className="hover:text-slate-900 transition-colors">Workflow</a>
              <a href="#security" className="hover:text-slate-900 transition-colors">Security</a>
              <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Link href="/login" className="bg-slate-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-800 transition-all shadow-sm">
              Book Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: 'radial-gradient(circle at top center, #f8fafc 0%, #ffffff 100%)' }}>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.4 }}></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-slate-200 bg-white/50 text-xs font-semibold text-slate-500 mb-6 tracking-wide">
              NOW IN EARLY ACCESS
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight leading-[1.1]">
              Visa Processing, Rebuilt for <br/><span className="text-blue-600">Modern Agencies</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Manage groups, applicants, applications, OCR imports, approvals, and audit trails from one intelligent platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                Book a Demo
              </Link>
              <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 rounded-lg font-semibold border border-slate-200 hover:border-slate-300 transition-all">
                Explore Platform
              </a>
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div className="relative max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  </div>
                  <div className="h-4 w-px bg-slate-200 mx-2"></div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Group: Q3_EUROPE_TOUR_04</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white px-3 py-1.5 rounded border border-slate-200 text-xs text-slate-600">
                    Search Applicants...
                  </div>
                  <div className="bg-blue-600 px-3 py-1.5 rounded text-white text-xs font-medium">+ Add Applicant</div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Applicant Overview</h3>
                  <div className="flex gap-2">
                    <div className="text-[11px] font-medium text-slate-500 border border-slate-200 px-2 py-1 rounded">All (142)</div>
                    <div className="text-[11px] font-medium text-slate-500 border border-slate-200 px-2 py-1 rounded">Pending Review (18)</div>
                  </div>
                </div>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-100">
                      <th className="pb-3 font-semibold">Applicant Name</th>
                      <th className="pb-3 font-semibold">Passport</th>
                      <th className="pb-3 font-semibold">Type</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Last Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600">
                    {[
                      { name: 'Sarah Jenkins', passport: 'P22938421', type: 'Schengen Business', status: 'Approved', statusColor: 'bg-emerald-50 text-emerald-600', time: '2 mins ago' },
                      { name: 'Marcus Thorne', passport: 'P88231002', type: 'Schengen Tourist', status: 'In Review', statusColor: 'bg-blue-50 text-blue-600', time: '14 mins ago' },
                      { name: 'Elena Rodriguez', passport: 'P11209348', type: 'UK Standard Visitor', status: 'Drafting', statusColor: 'bg-amber-50 text-amber-600', time: '1 hour ago' },
                      { name: 'Chen Wei', passport: 'P99304122', type: 'US B1/B2', status: 'Pending OCR', statusColor: 'bg-slate-100 text-slate-500', time: '3 hours ago' },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 font-medium text-slate-900">{row.name}</td>
                        <td className="py-4 font-mono text-xs">{row.passport}</td>
                        <td className="py-4">{row.type}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${row.statusColor}`}>{row.status}</span>
                        </td>
                        <td className="py-4 text-xs text-slate-400">{row.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-slate-100 py-12 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { stat: '70%', label: 'Manual Effort Reduced' },
              { stat: 'Instant', label: 'OCR Data Extraction' },
              { stat: 'SOC2', label: 'Enterprise Compliance' },
              { stat: '24/7', label: 'Workflow Monitoring' },
            ].map((item, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="text-2xl font-bold text-slate-900">{item.stat}</div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-8 leading-tight">Legacy workflows are holding back your growth.</h2>
            <div className="space-y-4">
              {[
                { title: 'Spreadsheet Chaos', description: 'Losing track of applicant data in unsecure, disconnected Excel files.' },
                { title: 'WhatsApp Coordination', description: 'Collecting sensitive passport scans via messaging apps with zero audit trail.' },
                { title: 'Duplicate Data Entry', description: 'Re-entering the same information across multiple forms and systems.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-red-50 bg-red-50/30">
                  <svg className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                    <p className="text-sm text-slate-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-950 p-10 rounded-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px]"></div>
            <h2 className="text-3xl font-bold mb-8 leading-tight">EntryPilot is the <span className="text-blue-400">Operating System</span> for Visas.</h2>
            <div className="space-y-6">
              {[
                { title: 'Group-First Workflow', description: 'Organize applications by travel batch, group leader, or corporate entity.' },
                { title: 'OCR + Automation', description: 'Extract handwritten data from scans instantly with high accuracy.' },
                { title: 'Audit-Ready Compliance', description: 'Track every data modification, download, and approval automatically.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    <p className="text-sm text-slate-400">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Precision-engineered features.</h2>
            <p className="text-slate-600 max-w-xl">Every tool you need to process volume without sacrificing quality.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl border border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                  <span className="text-slate-600 group-hover:text-white">{feature.icon}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How EntryPilot Works</h2>
            <p className="text-slate-600 max-w-xl mx-auto">A unified workflow designed for speed and precision.</p>
          </div>
          <div className="relative flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="hidden md:block absolute top-6 left-0 right-0 h-0.5 bg-slate-100 z-0"></div>
            {[
              { number: 1, title: 'Create Travel Group', description: 'Define your batch, destination, and key processing dates.' },
              { number: 2, title: 'Import Applicants', description: 'Bulk upload or manual entry. Secure link collection available.' },
              { number: 3, title: 'Auto-Extract Data', description: 'Our OCR engine reads passports and forms automatically.' },
              { number: 4, title: 'Review & Approve', description: 'Quality control check by your senior visa officers.' },
              { number: 5, title: 'Track Submission', description: 'Real-time status updates from submission to stamping.' },
            ].map((step, index) => (
              <div key={index} className="relative z-10 flex-1">
                <div className={`w-12 h-12 border-2 rounded-full flex items-center justify-center font-bold mb-6 ${
                  step.number === 4 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {step.number}
                </div>
                <h4 className="font-bold text-slate-900 mb-2">{step.title}</h4>
                <p className="text-xs text-slate-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Simple Pricing for Agencies of Every Size</h2>
            <p className="text-slate-600 text-lg">Scale your visa operations with a plan built for your workflow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`bg-white p-8 rounded-2xl flex flex-col ${
                plan.popular 
                  ? 'border-2 border-blue-600 shadow-xl relative' 
                  : 'border border-slate-200 shadow-sm'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <h4 className={`text-sm font-bold uppercase tracking-widest mb-1 ${plan.popular ? 'text-blue-600' : 'text-slate-400'}`}>
                    {plan.name}
                  </h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-slate-500 text-sm">/ month</span>}
                  </div>
                  <p className="text-xs font-medium text-slate-500 mt-2">{plan.description}</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className={`flex items-center gap-3 text-sm ${feature.included ? 'text-slate-600' : 'text-slate-300'}`}>
                      {feature.included ? (
                        <svg className={`w-4 h-4 flex-shrink-0 ${plan.popular ? 'text-blue-500' : 'text-emerald-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="w-4 h-px bg-slate-200 flex-shrink-0"></span>
                      )}
                      {feature.text}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`w-full py-3 px-4 rounded-lg text-sm font-bold text-center transition-all ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8">Enterprise Security <br/>by Design</h2>
              <p className="text-slate-400 mb-12 text-lg leading-relaxed">
                EntryPilot is built on a "Privacy First" foundation. We provide the tools required for strict regulatory compliance in the travel industry.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { title: 'RBAC', description: 'Role-Based Access Control to manage permissions per user.' },
                  { title: 'Data Isolation', description: 'Physical and logical data separation for all organizations.' },
                  { title: 'Encrypted Storage', description: 'AES-256 encryption for all sensitive PII and documents.' },
                  { title: 'SAML / SSO', description: 'Connect with your existing enterprise identity providers.' },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <h5 className="text-sm font-bold">{item.title}</h5>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <div className="space-y-4 font-mono text-[11px] text-blue-300">
                  <div><span className="text-slate-500">01</span> {'{'}</div>
                  <div><span className="text-slate-500">02</span> &nbsp;&nbsp;"security_level": "enterprise",</div>
                  <div><span className="text-slate-500">03</span> &nbsp;&nbsp;"encryption": "AES_256_GCM",</div>
                  <div><span className="text-slate-500">04</span> &nbsp;&nbsp;"audit_status": "logging_enabled",</div>
                  <div><span className="text-slate-500">05</span> &nbsp;&nbsp;"data_residency": "region_locked",</div>
                  <div><span className="text-slate-500">06</span> &nbsp;&nbsp;"iso_27001": "compliant"</div>
                  <div><span className="text-slate-500">07</span> {'}'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-3xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-slate-900 mb-12 text-center">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <h5 className="text-slate-900 font-bold pr-4">{faq.question}</h5>
                  <svg className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-slate-500 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-blue-600 rounded-3xl p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-500"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Stop Managing Visa Operations <br className="hidden md:block"/> in Spreadsheets.</h2>
              <p className="text-blue-100 mb-10 text-lg max-w-2xl mx-auto">
                Upgrade your agency with structured, scalable workflow automation. Join the future of visa operations.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login" className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-slate-50 transition-all shadow-lg">
                  Book Demo
                </Link>
                <Link href="/login" className="px-8 py-4 bg-blue-700 text-white rounded-lg font-bold hover:bg-blue-800 transition-all border border-blue-400/30">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div>
              <Link href="/landing" className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
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
                <li><a href="#features" className="hover:text-blue-600">Features</a></li>
                <li><a href="#features" className="hover:text-blue-600">OCR Engine</a></li>
                <li><a href="#security" className="hover:text-blue-600">Security</a></li>
                <li><a href="#pricing" className="hover:text-blue-600">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-slate-900 mb-6 text-sm">Company</h5>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="#" className="hover:text-blue-600">About Us</a></li>
                <li><a href="#" className="hover:text-blue-600">Contact</a></li>
                <li><a href="#" className="hover:text-blue-600">Careers</a></li>
                <li><a href="#" className="hover:text-blue-600">Blog</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-slate-900 mb-6 text-sm">Legal</h5>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="/privacy" className="hover:text-blue-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600">Terms of Service</a></li>
                <li><a href="/cookies" className="hover:text-blue-600">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-50 text-[11px] text-slate-400 font-medium uppercase tracking-widest">
            <div>© 2024 EntryPilot Systems Inc. All rights reserved.</div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-slate-900">Twitter</a>
              <a href="#" className="hover:text-slate-900">LinkedIn</a>
              <a href="#" className="hover:text-slate-900">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
