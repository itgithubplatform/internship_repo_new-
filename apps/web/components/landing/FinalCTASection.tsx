'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const FinalCTASection = () => {
  return (
    <section className="py-20 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-16 md:p-24 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl text-center relative overflow-hidden group"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

          <motion.div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              Stop Managing Operations.
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Start Controlling Them.
              </span>
            </h2>

            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
              Join enterprise teams that have transformed their field operations with VeroFlow. Get started with a 7-day free trial—no credit card required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register" className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-bold flex items-center gap-2 hover:shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105">
                Start Free Trial
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-8 py-4 border border-white/20 text-white rounded-lg font-bold hover:bg-white/10 transition-all">
                Book Demo
              </button>
            </div>

            {/* Trust Note */}
            <p className="text-sm text-slate-400 mt-8">
              ✓ Used by leading enterprises • ✓ Enterprise SLA included • ✓ 24/7 support
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
