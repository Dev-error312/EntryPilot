'use client';

import { motion } from 'framer-motion';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import PageHeader from '@/components/layout/PageHeader';

export default function PrivacyPolicyPage() {
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
      <PublicNavbar scrollToSection={scrollToSection} />

      {/* Main Content with top padding for fixed navbar */}
      <div className="pt-16">
        <PageHeader
          title="Privacy Policy"
          subtitle="How EntryPilot collects, uses, and protects your information."
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

    <PublicFooter />
    </div>
  );
}
