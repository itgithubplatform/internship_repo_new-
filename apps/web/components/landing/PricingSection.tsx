'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '0',
    desc: '7-day free trial to explore VeroFlow',
    features: ['Up to 3 Tenants', '50 Users', 'Basic Forms & KYC', 'Mobile App Access', '7-Day Data History', 'Email Support'],
    btn: 'Start Free Trial',
    popular: false
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'Full power with dedicated support',
    features: ['Unlimited Tenants', 'Unlimited Users', 'Enterprise KYC Suite', 'Advanced Analytics', 'Custom Workflows', 'API Access', 'Dedicated Account Manager', '99.9% SLA', '24/7 Priority Support'],
    btn: 'Contact Sales',
    popular: true
  }
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl lg:text-5xl font-black mb-6">
            Simple, Transparent <span className="text-blue-400">Pricing</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Start free, scale as you grow. Only pay when you need enterprise features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 md:p-12 rounded-3xl border transition-all ${
                p.popular
                  ? 'bg-gradient-to-b from-blue-600/20 to-purple-600/10 border-blue-500/40 relative overflow-hidden shadow-xl'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              {p.popular && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                >
                  <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full">
                    Most Popular
                  </span>
                </motion.div>
              )}

              <h3 className="text-2xl font-bold mb-3 pt-4">{p.name}</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black">
                  {p.price === '0' ? 'Free' : p.price}
                </span>
                {p.price !== 'Custom' && p.price !== '0' && <span className="text-slate-400">/month</span>}
              </div>
              <p className="text-slate-400 mb-8">{p.desc}</p>

              <ul className="space-y-4 mb-12">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <Check size={18} className="text-blue-400 mt-1 flex-shrink-0" />
                    <span className="text-slate-300">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={p.price === '0' ? '/register' : '/contact'}
                className={`w-full py-4 px-6 rounded-lg font-bold transition-all flex justify-center items-center gap-2 ${
                  p.popular
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/50'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {p.btn} <ArrowRight size={18} />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* FAQ Hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-slate-400">
            Have questions?{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 font-medium">
              Check our FAQ
            </a>
            {' '}or{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 font-medium">
              schedule a demo
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};
