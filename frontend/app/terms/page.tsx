'use client';

import { motion } from 'framer-motion';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import PageHeader from '@/components/layout/PageHeader';

export default function TermsOfServicePage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sections = [
    {
      number: 1,
      title: 'Acceptance of Terms',
      content: [
        'By accessing or using EntryPilot, you agree to these Terms of Service.',
        'If you do not agree, you may not use the platform.',
      ],
    },
    {
      number: 2,
      title: 'Service Description',
      content: [
        'EntryPilot is a SaaS platform designed for travel agencies to manage visa processing workflows, applicant records, document handling, and operational collaboration.',
        'EntryPilot does not:',
        '• Provide legal immigration advice',
        '• Guarantee visa approvals',
        '• Submit applications to government authorities on behalf of users',
        'Agencies remain fully responsible for submission accuracy.',
      ],
    },
    {
      number: 3,
      title: 'Account Responsibilities',
      content: [
        'Users are responsible for:',
        '• Maintaining account confidentiality',
        '• Protecting login credentials',
        '• Ensuring authorized platform access',
        '• Reporting suspected unauthorized activity',
        'You are responsible for all activity under your account.',
      ],
    },
    {
      number: 4,
      title: 'Acceptable Use',
      content: [
        'You agree not to:',
        '• Use EntryPilot for unlawful activities',
        '• Upload malicious software',
        '• Attempt unauthorized access',
        '• Interfere with platform operations',
        '• Misuse applicant data',
        '• Reverse engineer the platform',
        'Violation may result in suspension or termination.',
      ],
    },
    {
      number: 5,
      title: 'Data Responsibility',
      content: [
        'Agencies are solely responsible for:',
        '• Accuracy of uploaded applicant data',
        '• Obtaining necessary applicant consent',
        '• Compliance with local privacy laws',
        '• Lawful use of the platform',
      ],
    },
    {
      number: 6,
      title: 'Subscription and Billing',
      content: [
        'Paid subscriptions are billed according to selected plans.',
        'Subscription fees are:',
        '• Non-transferable',
        '• Subject to renewal',
        '• Subject to pricing updates with prior notice',
        'Failure to pay may result in service suspension.',
      ],
    },
    {
      number: 7,
      title: 'Platform Availability',
      content: [
        'We strive for reliable uptime but do not guarantee uninterrupted service.',
        'Scheduled maintenance, upgrades, or unforeseen technical issues may temporarily affect availability.',
      ],
    },
    {
      number: 8,
      title: 'Intellectual Property',
      content: [
        'All EntryPilot software, branding, interface design, and platform functionality are the intellectual property of EntryPilot.',
        'Users may not reproduce or redistribute any part of the platform without permission.',
      ],
    },
    {
      number: 9,
      title: 'Termination',
      content: [
        'We reserve the right to suspend or terminate accounts for:',
        '• Violation of these terms',
        '• Fraudulent activity',
        '• Abuse of platform resources',
        '• Security threats',
        'Agencies may terminate service at any time.',
      ],
    },
    {
      number: 10,
      title: 'Limitation of Liability',
      content: [
        'EntryPilot is provided "as is."',
        'We are not liable for:',
        '• Visa rejection outcomes',
        '• Data entered incorrectly by users',
        '• Business losses resulting from platform misuse',
        '• Indirect or consequential damages',
      ],
    },
    {
      number: 11,
      title: 'Modifications',
      content: [
        'We may update these Terms periodically.',
        'Continued use constitutes acceptance of revised terms.',
      ],
    },
    {
      number: 12,
      title: 'Governing Law',
      content: [
        'These Terms shall be governed by the laws applicable in the jurisdiction where EntryPilot operates.',
      ],
    },
    {
      number: 13,
      title: 'Contact',
      content: [
        'For legal inquiries, contact:',
        'legal@entrypilot.com',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <PublicNavbar scrollToSection={scrollToSection} />

      {/* Main Content with top padding for fixed navbar */}
      <div className="pt-16">
        <PageHeader
          title="Terms of Service"
          subtitle="Rules and conditions for using EntryPilot."
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
              Questions About Our Terms?
            </h3>
            <p className="text-slate-700 mb-4">
              If you have any questions about our Terms of Service, please reach out to us:
            </p>
            <a
              href="mailto:legal@entrypilot.com"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              Email us at legal@entrypilot.com
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
