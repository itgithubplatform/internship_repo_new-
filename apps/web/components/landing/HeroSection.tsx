'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';

export const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <section className="min-h-screen flex items-center justify-center pt-32 pb-20 px-6 relative overflow-hidden">
      <motion.div
        className="max-w-5xl mx-auto text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="inline-block mb-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-sm text-blue-300 font-medium">Enterprise-Grade Control</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight"
        >
          <span className="bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
            Stop Managing Operations.
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Start Controlling Them.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          VeroFlow is the enterprise multi-tenant SaaS platform that gives you complete visibility and control over your field operations, KYC verification, and data capture at scale.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link href="/register" className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-bold flex items-center gap-2 hover:shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105">
            Start Free Trial
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="px-8 py-4 border border-white/20 text-white rounded-lg font-bold hover:bg-white/10 transition-all">
            Book Demo
          </button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-blue-400" />
            <span>100K concurrent users</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-blue-400" />
            <span>&lt;300ms latency</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-blue-400" />
            <span>99.9% uptime SLA</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Elements Animation */}
      <motion.div
        className="absolute top-40 right-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"
        animate={{ y: [0, 30, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-10 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity, delay: 1 }}
      />
    </section>
  );
};
