'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, Link2, Database } from 'lucide-react';

const problems = [
  {
    icon: AlertCircle,
    title: 'Disconnected Tools',
    description: 'Managing operations across multiple platforms creates chaos and errors'
  },
  {
    icon: Clock,
    title: 'No Real-Time Visibility',
    description: 'Can\'t track field work, approvals, or data as it happens'
  },
  {
    icon: Link2,
    title: 'Manual Approvals',
    description: 'Tedious workflows create bottlenecks and slow down operations'
  },
  {
    icon: Database,
    title: 'Data Inconsistency',
    description: 'Different teams work with different data, reducing accuracy'
  }
];

export const ProblemSection = () => {
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
            The Operations Chaos is Real
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Most field operations teams are drowning in tools, delays, and data inconsistencies
          </p>
        </motion.div>

        {/* Problems Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {problems.map((problem, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group p-8 bg-slate-900/50 border border-slate-800 hover:border-red-500/30 rounded-2xl transition-all hover:shadow-lg hover:shadow-red-500/10"
            >
              <problem.icon className="w-12 h-12 text-red-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-3">{problem.title}</h3>
              <p className="text-slate-400">{problem.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stat Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 p-8 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl text-center"
        >
          <p className="text-sm uppercase tracking-widest text-slate-400 mb-2">The Cost</p>
          <p className="text-3xl font-black text-white">45% of field operations teams waste time on manual data entry and approvals</p>
        </motion.div>
      </div>
    </section>
  );
};
