'use client';

import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            {title}
          </h1>
          <p className="text-lg text-slate-600">
            {subtitle}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
