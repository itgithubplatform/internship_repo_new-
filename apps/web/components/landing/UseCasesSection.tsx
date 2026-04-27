'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Eye, CheckSquare, Truck } from 'lucide-react';

const useCases = [
  {
    icon: Eye,
    title: 'Field Operations',
    description: 'Real-time team tracking, job assignment, photo capture, and instant approvals'
  },
  {
    icon: CheckSquare,
    title: 'Inspection Systems',
    description: 'Automated compliance checks, form templates, and audit trail reporting'
  },
  {
    icon: Zap,
    title: 'Compliance Tracking',
    description: 'KYC verification, document management, and regulatory audit logs'
  },
  {
    icon: Truck,
    title: 'Logistics & Workforce',
    description: 'Multi-tenant workforces, skill-based assignment, and delivery tracking'
  }
];

export const UseCasesSection = () => {
  return (
    <section className="py-20 px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Built for Your Industry
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Whether you're running field operations, inspections, or compliance workflows, VeroFlow adapts to your needs
          </p>
        </motion.div>

        {/* Use Cases Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {useCases.map((useCase, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group p-8 bg-gradient-to-b from-slate-800/50 to-transparent border border-slate-700 hover:border-blue-500/40 rounded-2xl transition-all"
            >
              <useCase.icon className="w-12 h-12 text-blue-400 mb-4 group-hover:scale-110 group-hover:text-purple-400 transition-all" />
              <h3 className="text-xl font-bold mb-3">{useCase.title}</h3>
              <p className="text-slate-400">{useCase.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Integration CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center p-12 bg-slate-900/50 border border-slate-800 rounded-3xl"
        >
          <p className="text-sm uppercase tracking-widest text-slate-400 mb-4">Ready to See It in Action?</p>
          <h3 className="text-3xl font-bold mb-6">Get a personalized demo for your use case</h3>
          <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-blue-500/50 transition-all">
            Schedule Demo
          </button>
        </motion.div>
      </div>
    </section>
  );
};
