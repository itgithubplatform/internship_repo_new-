'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Security', href: '#security' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 overflow-hidden rounded-xl border border-white/10 shadow-xl group-hover:border-primary/50 transition-all">
            <img 
              src="/logo.png" 
              alt="VeroFlow Logo" 
              className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-500" 
            />
          </div>
          <span className="font-black text-2xl tracking-tighter text-foreground bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">VeroFlow</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
            Sign In
          </Link>
          <Link href="/register" className="px-6 py-2 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-primary/50 transition-all">
            Start Free Trial
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          {isOpen ? <X size={24} className="text-foreground" /> : <Menu size={24} className="text-foreground" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="lg:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-md"
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-slate-400 hover:text-white transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="border-t border-white/10 pt-4 flex gap-3">
              <Link href="/login" className="flex-1 px-4 py-2 text-slate-400 hover:text-white transition-colors font-medium text-center border border-white/10 rounded-lg">
                Sign In
              </Link>
              <Link href="/register" className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg font-medium text-center">
                Free Trial
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};
