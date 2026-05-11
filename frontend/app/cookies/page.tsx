'use client';

import { motion } from 'framer-motion';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import PageHeader from '@/components/layout/PageHeader';

export default function CookiePolicyPage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sections = [
    {
      number: 1,
      title: 'What Are Cookies',
      content: [
        'Cookies are small text files stored on your device that help websites function efficiently.',
        'EntryPilot uses cookies to improve platform functionality and user experience.',
      ],
    },
    {
      number: 2,
      title: 'How We Use Cookies',
      content: [
        'We use cookies for:',
        '',
        'Essential Authentication',
        'To keep users securely logged in.',
        '',
        'Security',
        'To detect suspicious activity and prevent unauthorized access.',
        '',
        'Performance',
        'To improve speed, reliability, and usability.',
        '',
        'Preferences',
        'To remember settings such as:',
        '• Session preferences',
        '• Interface selections',
        '• User configurations',
      ],
    },
    {
      number: 3,
      title: 'Analytics Cookies',
      content: [
        'We may use analytics tools to understand:',
        '• Feature usage',
        '• Performance bottlenecks',
        '• User interaction patterns',
        '',
        'This helps improve EntryPilot.',
      ],
    },
    {
      number: 4,
      title: 'Third-Party Cookies',
      content: [
        'Some integrated services may place cookies for operational purposes such as:',
        '• Payment processing',
        '• Error monitoring',
        '• Infrastructure optimization',
      ],
    },
    {
      number: 5,
      title: 'Managing Cookies',
      content: [
        'Most browsers allow users to:',
        '• View stored cookies',
        '• Delete cookies',
        '• Block future cookies',
        '• Configure cookie preferences',
        '',
        'Disabling essential cookies may impact platform functionality.',
      ],
    },
    {
      number: 6,
      title: 'Policy Updates',
      content: [
        'We may update this Cookie Policy periodically.',
        'Updated versions will be posted on this page.',
      ],
    },
    {
      number: 7,
      title: 'Contact',
      content: [
        'For questions about our Cookie Policy, contact:',
        'cookies@entrypilot.com',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <PublicNavbar scrollToSection={scrollToSection} />

      {/* Main Content with top padding for fixed navbar */}
      <div className="pt-16">
        <PageHeader
          title="Cookie Policy"
          subtitle="How EntryPilot uses cookies and similar technologies."
        />

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

                  <div className="space-y-3">
                    {section.content.map((line, idx) => (
                      line === '' ? (
                        <div key={idx} />
                      ) : (
                        <p
                          key={idx}
                          className={`text-slate-700 leading-relaxed ${
                            line.startsWith('•') ? 'ml-4' : ''
                          }`}
                        >
                          {line}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Questions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="mt-16 pt-12 border-t border-slate-200"
        >
          <div className="bg-blue-50 rounded-xl p-8 border border-blue-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Questions About Our Cookie Policy?
            </h3>
            <p className="text-slate-700 mb-4">
              If you have any questions about how we use cookies, please reach out to us:
            </p>
            <a
              href="mailto:cookies@entrypilot.com"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              Email us at cookies@entrypilot.com
            </a>
          </div>
        </motion.div>

        {/* Last Updated */}
        <div className="mt-12 text-center text-sm text-slate-500">
          <p>Last updated: May 2026</p>
        </div>
      </div>
    </div>

    <PublicFooter />
    </div>
  );
}
