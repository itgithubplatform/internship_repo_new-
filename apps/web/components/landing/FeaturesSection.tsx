'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  Database, 
  Globe,
  Layers,
  Lock
} from 'lucide-react';

const features = [
  {
    title: 'Multi-Tenant Architecture',
    desc: 'Strict logical isolation for every customer, from database to caching layer.',
    icon: Layers,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  {
    title: 'Enterprise KYC',
    desc: 'Automated identity verification workflows with manual admin approval gates.',
    icon: ShieldCheck,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  {
    title: 'PWA & Native Mobile',
    desc: 'Offline-first field operations with real-time sync and camera integration.',
    icon: Smartphone,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10'
  },
  {
    title: '100K Concurrent Support',
    desc: 'Built for scale with Redis caching, connection pooling, and stateless APIs.',
    icon: Zap,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10'
  },
  {
    title: 'Data Sovereignty',
    desc: 'Encrypted at rest with field-level security and comprehensive audit logs.',
    icon: Lock,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10'
  },
  {
    title: 'Global Infrastructure',
    desc: 'Deploy worldwide with edge caching and multi-region database support.',
    icon: Globe,
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10'
  }
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6">Designed for <span className="text-blue-500">Scale.</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Everything you need to run high-stakes enterprise field operations at a global scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card p-8 hover:bg-white/[0.08] transition-all group"
            >
              <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <f.icon className={f.color} size={28} />
              </div>
              <h3 className="text-xl font-bold mb-4">{f.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
