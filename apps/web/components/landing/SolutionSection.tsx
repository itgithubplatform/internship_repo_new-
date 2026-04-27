'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Layers, Users } from 'lucide-react';

export const SolutionSection = () => {
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
            Enter VeroFlow: The Complete Solution
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            A unified platform built for the modern enterprise. One system. Multiple tenants. Unlimited scale.
          </p>
        </motion.div>

        {/* Three Pillars */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Layers,
              title: 'Multi-Tenant Architecture',
              description: 'Complete data isolation with shared infrastructure. Run unlimited customer tenants on one platform.'
            },
            {
              icon: Users,
              title: 'Role-Based Control',
              description: 'Admin > Manager > Engineer workflows built in. Each role has the exact visibility and permissions they need.'
            },
            {
              icon: Zap,
              title: 'Real-Time Operations',
              description: 'Instant syncing, live dashboards, and offline-first PWA support. Never lose visibility.'
            }
          ].map((pillar, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group p-8 bg-gradient-to-b from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl hover:border-blue-500/40 transition-all"
            >
              <pillar.icon className="w-12 h-12 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-3">{pillar.title}</h3>
              <p className="text-slate-400">{pillar.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Visual Flow Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-12 bg-slate-900/50 border border-slate-800 rounded-3xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {['Admin Dashboard', 'Manager Portal', 'Engineer Mobile', 'Form Engine', 'KYC Verification', 'Analytics'].map((step, idx) => (
              <div key={idx} className="flex items-center gap-8 flex-1">
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-3">
                    <span className="text-white font-bold text-lg">{idx + 1}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-300">{step}</p>
                </div>
                {idx < 5 && (
                  <div className="hidden md:block w-8 h-1 bg-gradient-to-r from-blue-500 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
