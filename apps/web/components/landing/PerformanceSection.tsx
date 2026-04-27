'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Wifi } from 'lucide-react';

const metrics = [
  { label: '100K+', sublabel: 'Concurrent Users', icon: Zap, color: 'from-blue-500 to-blue-600' },
  { label: '<300ms', sublabel: 'Latency', icon: Clock, color: 'from-purple-500 to-pink-500' },
  { label: 'Offline-First', sublabel: 'PWA Support', icon: Wifi, color: 'from-cyan-500 to-blue-500' },
];

export const PerformanceSection = () => {
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
            Built for Real-Time Scale
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Enterprise-grade performance and reliability that never compromises
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`p-12 bg-gradient-to-br ${metric.color} opacity-10 rounded-3xl border border-white/10 hover:border-white/20 transition-all group relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <metric.icon className="w-8 h-8 mb-6 text-white/50" />
              <div className="text-5xl font-black mb-2">{metric.label}</div>
              <p className="text-slate-400 font-medium">{metric.sublabel}</p>
            </motion.div>
          ))}
        </div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-12 bg-slate-900/50 border border-slate-800 rounded-3xl"
        >
          <h3 className="text-2xl font-bold mb-8">Why VeroFlow is Different</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              'Connection pooling & Redis caching for instant responses',
              'Multi-region database replication with automatic failover',
              'Stateless APIs for horizontal scaling',
              'Real-time sync using WebSockets & message queues',
              'Progressive Web App with offline-first architecture',
              '99.9% uptime SLA with redundant infrastructure'
            ].map((feature, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                </div>
                <p className="text-slate-300">{feature}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
