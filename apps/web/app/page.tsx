'use client';

import React from 'react';
import { motion, useScroll } from 'framer-motion';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PerformanceSection } from '@/components/landing/PerformanceSection';
import { UseCasesSection } from '@/components/landing/UseCasesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { SecuritySection } from '@/components/landing/SecuritySection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  const { scrollYProgress } = useScroll();

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-950 via-blue-950/30 to-slate-950 selection:bg-blue-500/30">
      {/* Animated scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 z-[60] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <Navbar />

      <main className="relative">
        {/* Background gradient elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <HeroSection />
          <ProblemSection />
          <SolutionSection />
          <FeaturesSection />
          <HowItWorksSection />
          <PerformanceSection />
          <UseCasesSection />
          <PricingSection />
          <SecuritySection />
          <FinalCTASection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
