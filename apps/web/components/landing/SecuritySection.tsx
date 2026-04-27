'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, FileCheck, Shield } from 'lucide-react';

const securityFeatures = [
  {
    icon: Lock,
    title: 'JWT Authentication',
    description: 'Stateless, industry-standard token-based authentication'
  },
  {
    icon: Eye,
    title: 'Tenant Isolation',
    description: 'Complete data isolation at database and application layers'
  },
  {
    icon: FileCheck,
    title: 'Audit Logs',
    description: 'Complete audit trail of all data access and modifications'
  },
  {
    icon: Shield,
    title: 'Data Privacy',
    description: 'GDPR-compliant with encryption at rest and in transit'
  }
];

export const SecuritySection = () => {
  return (
    <section id="security" className="py-20 px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Enterprise Security Built In
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Trust is non-negotiable. VeroFlow meets the highest standards of data security and privacy.
          </p>
        </motion.div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {securityFeatures.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 bg-gradient-to-b from-green-500/10 to-transparent border border-green-500/20 rounded-2xl hover:border-green-500/40 transition-all"
            >
              <feature.icon className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Compliance Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-12 bg-slate-900/50 border border-slate-800 rounded-3xl text-center"
        >
          <p className="text-sm uppercase tracking-widest text-slate-400 mb-8">Compliance & Certifications</p>
          <div className="flex flex-wrap justify-center gap-8 text-slate-400">
            <div>GDPR Compliant</div>
            <div>ISO 27001</div>
            <div>SOC 2 Type II</div>
            <div>Data Residency</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
