import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  Shield,
  RefreshCw,
  Edit,
  CheckCircle2,
  X,
  ChevronDown,
  ArrowRight,
  Menu,
  Mail,
  AlertCircle,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Group-Based Management',
    description: 'Organize applicants by travel batch, group code, or specific departure dates for seamless coordination.',
  },
  {
    icon: FileText,
    title: 'OCR + Handwritten Reading',
    description: 'Proprietary AI reads scanned PDFs and handwritten forms to auto-populate applicant profiles instantly.',
  },
  {
    icon: RefreshCw,
    title: 'Workflow Automation',
    description: 'Moving applicants from Draft to Approved is automated through your custom defined pipeline.',
  },
  {
    icon: Shield,
    title: 'Multi-Tenant Architecture',
    description: 'Secure isolation for multi-office firms. Manage branches, sub-agents, and HQ in one secure portal.',
  },
  {
    icon: Edit,
    title: 'Smart Form Templates',
    description: 'Country-specific intelligence that validates data as you type, ensuring 100% submission success rate.',
  },
  {
    icon: CheckCircle2,
    title: 'Audit & Compliance',
    description: 'Every action is recorded. Filter by user, date, or applicant to see the full history of an application.',
  },
];

const workflowSteps = [
  { number: 1, title: 'Create Travel Group', description: 'Define your batch, destination, and key processing dates.' },
  { number: 2, title: 'Import Applicants', description: 'Bulk upload or manual entry. Secure link collection available.' },
  { number: 3, title: 'Auto-Extract Data', description: 'Our OCR engine reads passports and forms automatically.' },
  { number: 4, title: 'Review & Approve', description: 'Quality control check by your senior visa officers.' },
  { number: 5, title: 'Track Submission', description: 'Real-time status updates from submission to stamping.' },
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
    question: 'What is EntryPilot?',
    answer: 'A visa workflow platform that helps travel agencies manage applicants, documents, group processing, and application tracking in one place.',
  },
  {
    question: 'Who is EntryPilot built for?',
    answer: 'EntryPilot is designed for travel agencies, visa processing teams, and tour operators handling individual or group applications.',
  },
  {
    question: 'Can we manage applicants by group?',
    answer: 'Yes. Organize applicants by group code, batch, or departure date for faster processing and better tracking.',
  },
  {
    question: 'Does it support PDF and handwritten form reading?',
    answer: 'Yes. EntryPilot can extract and process data from PDFs and handwritten forms to reduce manual entry.',
  },
  {
    question: 'Can multiple employees use it together?',
    answer: 'Absolutely. Role-based access lets your team collaborate securely across shared workflows.',
  },
  {
    question: 'Is our client data secure?',
    answer: 'Yes. EntryPilot uses secure authentication, audit logging, and organization-level data isolation.',
  },
  {
    question: 'Can we customize visa templates?',
    answer: 'Yes. Create country-specific templates with custom fields and validation rules.',
  },
  {
    question: 'Why choose EntryPilot over spreadsheets?',
    answer: 'It reduces errors, speeds up processing, improves visibility, and scales with your agency.',
  },
];

const testimonials = [
  {
    quote: "EntryPilot reduced our processing time by 70%. What used to take days now takes hours.",
    author: "Sarah Chen",
    role: "Operations Director, GlobalVisa Co.",
  },
  {
    quote: "The OCR feature alone pays for itself. We've eliminated manual data entry completely.",
    author: "Marcus Johnson",
    role: "CEO, Swift Travel Agency",
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState('');
  const [counters, setCounters] = useState({ manual: 0, ocr: 0, soc2: 0, monitoring: 0 });
  
  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactError, setContactError] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Animate counters on page load
  useEffect(() => {
    const animateCounters = () => {
      let manualCount = 0;
      const manualInterval = setInterval(() => {
        if (manualCount < 70) {
          manualCount += 2;
          setCounters(prev => ({ ...prev, manual: Math.min(manualCount, 70) }));
        }
      }, 10);
      return manualInterval;
    };

    const interval = animateCounters();
    return () => clearInterval(interval);
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscriptionError('');

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setSubscriptionError('Please enter a valid email address');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }, 500);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactError('');

    if (!contactForm.name.trim()) {
      setContactError('Please enter your name');
      return;
    }
    if (!contactForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setContactError('Please enter a valid email address');
      return;
    }
    if (!contactForm.subject.trim()) {
      setContactError('Please enter a subject');
      return;
    }
    if (!contactForm.message.trim()) {
      setContactError('Please enter a message');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setContactSubmitted(true);
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setContactSubmitted(false), 3000);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer p-0">
              <div className="w-8 h-8 rounded flex items-center justify-center">
                <img src="/logo.png" alt="EntryPilot Logo" width={32} height={32} className="w-8 h-8" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">EntryPilot</span>
            </button>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <button onClick={() => scrollToSection('features')} className="hover:text-slate-900 transition-colors cursor-pointer">Features</button>
              <button onClick={() => scrollToSection('workflow')} className="hover:text-slate-900 transition-colors cursor-pointer">Workflow</button>
              <button onClick={() => scrollToSection('pricing')} className="hover:text-slate-900 transition-colors cursor-pointer">Pricing</button>
              <button onClick={() => scrollToSection('security')} className="hover:text-slate-900 transition-colors cursor-pointer">Security</button>
              <button onClick={() => scrollToSection('faq')} className="hover:text-slate-900 transition-colors cursor-pointer">FAQ</button>
              <button onClick={() => scrollToSection('contact')} className="hover:text-slate-900 transition-colors cursor-pointer">Contact</button>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <a href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </a>
            <button onClick={() => scrollToSection('contact')} className="bg-slate-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-800 transition-all shadow-sm cursor-pointer">
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
            <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2 text-slate-600 hover:text-slate-900">Features</button>
            <button onClick={() => scrollToSection('workflow')} className="block w-full text-left py-2 text-slate-600 hover:text-slate-900">Workflow</button>
            <button onClick={() => scrollToSection('pricing')} className="block w-full text-left py-2 text-slate-600 hover:text-slate-900">Pricing</button>
            <button onClick={() => scrollToSection('security')} className="block w-full text-left py-2 text-slate-600 hover:text-slate-900">Security</button>
            <button onClick={() => scrollToSection('faq')} className="block w-full text-left py-2 text-slate-600 hover:text-slate-900">FAQ</button>
            <button onClick={() => scrollToSection('contact')} className="block w-full text-left py-2 text-slate-600 hover:text-slate-900">Contact</button>
            <hr className="my-3" />
            <a href="/login" className="block py-2 text-slate-600 hover:text-slate-900">Sign In</a>
            <button onClick={() => scrollToSection('contact')} className="block w-full bg-slate-900 text-white px-4 py-2 rounded text-center font-medium cursor-pointer border-none">Book Demo</button>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: 'radial-gradient(circle at top center, #f8fafc 0%, #ffffff 100%)' }}>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.4 }}></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
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
              <button onClick={() => scrollToSection('contact')} className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 cursor-pointer border-none">
                Book a Demo
              </button>
              <button onClick={() => scrollToSection('features')} className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 rounded-lg font-semibold border border-slate-200 hover:border-slate-300 transition-all cursor-pointer">
                Explore Platform
              </button>
            </div>
          </motion.div>

          {/* Dashboard Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative max-w-6xl mx-auto"
          >
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
                  <div className="bg-white px-3 py-1.5 rounded border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                    Search Applicants...
                  </div>
                  <div className="bg-blue-600 px-3 py-1.5 rounded text-white text-xs font-medium">+ Add Applicant</div>
                </div>
              </div>
              <div className="flex h-[400px]">
                <div className="w-48 bg-slate-50 border-r border-slate-200 p-4 hidden md:block">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Workspace</div>
                      <div className="bg-white px-2 py-1.5 rounded border border-slate-200 text-xs font-medium text-slate-900">Dashboard</div>
                      <div className="px-2 py-1.5 text-xs font-medium text-slate-500">Travel Groups</div>
                      <div className="px-2 py-1.5 text-xs font-medium text-slate-500">Applications</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Operations</div>
                      <div className="px-2 py-1.5 text-xs font-medium text-slate-500 flex justify-between">
                        OCR Queue <span className="bg-blue-100 text-blue-600 px-1.5 rounded text-[10px]">12</span>
                      </div>
                      <div className="px-2 py-1.5 text-xs font-medium text-slate-500">Audit Logs</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-6">
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
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-slate-100 py-12 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div className="text-center md:text-left" whileHover={{ scale: 1.05 }}>
              <div className="text-2xl font-bold text-slate-900">{counters.manual}%</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Manual Effort Reduced</div>
            </motion.div>
            <div className="text-center md:text-left">
              <div className="text-2xl font-bold text-slate-900">Instant</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">OCR Data Extraction</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl font-bold text-slate-900">SOC2</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Enterprise Compliance</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl font-bold text-slate-900">24/7</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Workflow Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-8 leading-tight">Legacy workflows are holding back your growth.</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl border border-red-50 bg-red-50/30">
                <X className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Spreadsheet Chaos</h4>
                  <p className="text-sm text-slate-500">Losing track of applicant data in unsecure, disconnected Excel files.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl border border-red-50 bg-red-50/30">
                <X className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">WhatsApp Coordination</h4>
                  <p className="text-sm text-slate-500">Collecting sensitive passport scans via messaging apps with zero audit trail.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl border border-red-50 bg-red-50/30">
                <X className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Duplicate Data Entry</h4>
                  <p className="text-sm text-slate-500">Re-entering the same information across multiple forms and systems.</p>
                </div>
              </div>
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
                  <CheckCircle2 className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
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

      {/* Core Features Grid */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Precision-engineered features.</h2>
            <p className="text-slate-600 max-w-xl">Every tool you need to process volume without sacrificing quality.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl border border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
              >
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                  <feature.icon className="w-5 h-5 text-slate-600 group-hover:text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </motion.div>
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
            {workflowSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative z-10 flex-1"
              >
                <div className={`w-12 h-12 border-2 rounded-full flex items-center justify-center font-bold mb-6 ${
                  step.number === 4 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {step.number}
                </div>
                <h4 className="font-bold text-slate-900 mb-2">{step.title}</h4>
                <p className="text-xs text-slate-500">{step.description}</p>
              </motion.div>
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
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white p-8 rounded-2xl flex flex-col ${
                  plan.popular 
                    ? 'border-2 border-blue-600 shadow-xl relative' 
                    : 'border border-slate-200 shadow-sm'
                }`}
              >
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
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${plan.popular ? 'text-blue-500' : 'text-emerald-500'}`} />
                      ) : (
                        <span className="w-4 h-px bg-slate-200 flex-shrink-0"></span>
                      )}
                      {feature.text}
                    </li>
                  ))}
                </ul>
                <a
                  href="#demo"
                  className={`w-full py-3 px-4 rounded-lg text-sm font-bold text-center transition-all ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {plan.cta}
                </a>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-slate-500 text-sm">
            Need a tailored deployment for your agency network? <a href="#contact" className="text-blue-600 font-semibold hover:underline">Talk to our team.</a>
          </p>
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

      {/* Who It's For */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-16">Built for scale. Trusted by operators.</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: 'Travel Agencies', description: 'Handle high-volume tourist groups without increasing headcount.' },
              { title: 'Visa Firms', description: 'Professionalize your backend and offer a premium client portal.' },
              { title: 'Pilgrimage Operators', description: 'Manage large religious travel batches with complex requirements.' },
              { title: 'Corporate Mobility', description: 'Seamlessly coordinate employee relocation and business travel.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 border border-slate-100 rounded-xl bg-slate-50/50"
              >
                <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
                <p className="text-sm text-slate-500">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-slate-50/50 border-y border-slate-100">
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
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-slate-500 text-sm leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section id="signup" className="py-24 bg-gradient-to-r from-blue-50 to-slate-50 border-y border-slate-100">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Stay Updated</h2>
            <p className="text-slate-600 mb-8">Get the latest updates on EntryPilot features and visa industry insights.</p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>

            {subscriptionError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center justify-center gap-2 text-red-600 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {subscriptionError}
              </motion.div>
            )}

            {subscribed && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 flex items-center justify-center gap-2 text-emerald-600 text-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Thanks for subscribing!
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Get in Touch</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">Have questions? Our team is here to help. Reach out to us and we'll get back to you as soon as possible.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Contact Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Phone</h3>
              <p className="text-slate-600 mb-4">Call us during business hours</p>
              <a href="tel:+1234567890" className="text-blue-600 font-semibold hover:text-blue-700">+1 (234) 567-8900</a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Email</h3>
              <p className="text-slate-600 mb-4">We typically respond within 24 hours</p>
              <a href="mailto:hello@entrypilot.com" className="text-blue-600 font-semibold hover:text-blue-700">hello@entrypilot.com</a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Office</h3>
              <p className="text-slate-600 mb-4">Visit us at our headquarters</p>
              <p className="text-blue-600 font-semibold">San Francisco, CA</p>
            </motion.div>
          </div>

          {/* Contact Form and Info */}
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="What is this about?"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {contactError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {contactError}
                  </motion.div>
                )}

                {contactSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 p-3 rounded-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Message sent successfully! We'll be in touch soon.
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Send Message
                </button>
              </form>
            </motion.div>

            {/* Right Column - Info & Features */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Why Contact Us?</h3>
                <p className="text-slate-600 mb-6">Whether you're interested in our platform, need support, or want to discuss a partnership opportunity, we're here to help.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Expert Support</h4>
                    <p className="text-slate-600 text-sm">Get help from our knowledgeable support team</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Quick Response</h4>
                    <p className="text-slate-600 text-sm">We typically respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Demo Available</h4>
                    <p className="text-slate-600 text-sm">Schedule a personalized product demo</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Custom Solutions</h4>
                    <p className="text-slate-600 text-sm">Enterprise deployments tailored to your needs</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-slate-900">Business Hours</h4>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <p><span className="font-medium text-slate-900">Monday - Friday:</span> 9:00 AM - 6:00 PM PT</p>
                  <p><span className="font-medium text-slate-900">Saturday - Sunday:</span> 10:00 AM - 4:00 PM PT</p>
                </div>
              </div>
            </motion.div>
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
                <button onClick={() => scrollToSection('contact')} className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-slate-50 transition-all shadow-lg cursor-pointer border-none">
                  Book Demo
                </button>
                <button onClick={() => scrollToSection('signup')} className="px-8 py-4 bg-blue-700 text-white rounded-lg font-bold hover:bg-blue-800 transition-all border border-blue-400/30 cursor-pointer">
                  Get Started
                </button>
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
              <button onClick={() => scrollToSection('signup')} className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer p-0">
                <div className="w-6 h-6 rounded flex items-center justify-center">
                  <img src="/logo.png" alt="EntryPilot Logo" width={24} height={24} className="w-6 h-6" />
                </div>
                <span className="text-lg font-bold text-slate-900">EntryPilot</span>
              </button>
              <p className="text-sm text-slate-500 leading-relaxed">
                The modern standard for global visa processing operations.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-slate-900 mb-6 text-sm">Product</h5>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-blue-600 bg-transparent border-none cursor-pointer p-0">Features</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-blue-600 bg-transparent border-none cursor-pointer p-0">OCR Engine</button></li>
                <li><button onClick={() => scrollToSection('security')} className="hover:text-blue-600 bg-transparent border-none cursor-pointer p-0">Security</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-blue-600 bg-transparent border-none cursor-pointer p-0">Pricing</button></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-slate-900 mb-6 text-sm">Company</h5>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-blue-600 bg-transparent border-none cursor-pointer p-0">About Us</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-blue-600 bg-transparent border-none cursor-pointer p-0">Contact</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-blue-600 bg-transparent border-none cursor-pointer p-0">Careers</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-blue-600 bg-transparent border-none cursor-pointer p-0">Blog</button></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-slate-900 mb-6 text-sm">Legal</h5>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="/privacy" className="hover:text-blue-600">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-blue-600">Terms of Service</a></li>
                <li><a href="/cookies" className="hover:text-blue-600">Cookie Policy</a></li>
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
