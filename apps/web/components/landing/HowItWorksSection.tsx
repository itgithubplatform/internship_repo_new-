'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const steps = [
  { num: 1, title: 'Create Tenant', desc: 'Set up a new isolated environment in seconds' },
  { num: 2, title: 'Assign Team', desc: 'Add Admins, Managers, and Engineers with role-based permissions' },
  { num: 3, title: 'Configure Workflows', desc: 'Define approval chains and form structures' },
  { num: 4, title: 'Deploy to Field', desc: 'Send work orders and forms to your team' },
  { num: 5, title: 'Capture Data', desc: 'Field teams complete KYC, forms, and photo submissions' },
  { num: 6, title: 'Approve & Analyze', desc: 'Managers approve, analyze trends, and export reports' }
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            How It Works
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            From setup to scale in just 6 steps
          </p>
        </motion.div>

        {/* Timeline Steps */}
        <div className="space-y-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex gap-8 items-start group"
            >
              {/* Step Number */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-black text-white text-xl group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
                  {step.num}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pt-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-blue-500/30 transition-all">
                <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                <p className="text-slate-400 text-lg">{step.desc}</p>
              </div>

              {/* Arrow */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:flex flex-col items-center -mr-8">
                  <div className="w-1 h-12 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center p-12 bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-3xl"
        >
          <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Operations?</h3>
          <p className="text-slate-400 mb-8">Start with a 7-day free trial. No credit card required.</p>
          <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-blue-500/50 transition-all">
            Start Free Trial Now
          </button>
        </motion.div>
      </div>
    </section>
  );
};
