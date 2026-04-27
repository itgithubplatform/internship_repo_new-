'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Globe, Mail } from 'lucide-react';

export default function Footer() {
  const footerSections = [
    {
      title: 'Product',
      links: ['Features', 'Security', 'Pricing', 'Roadmap', 'Status']
    },
    {
      title: 'Resources',
      links: ['Documentation', 'API Reference', 'Community', 'Blog', 'Templates']
    },
    {
      title: 'Company',
      links: ['About Us', 'Careers', 'Press', 'Contact', 'Partners']
    },
    {
      title: 'Legal',
      links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Data Processing']
    }
  ];

  return (
    <footer className="border-t border-white/5 bg-card/50 backdrop-blur-lg mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        {/* Main Footer Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center font-black text-white shadow-lg shadow-primary/20">
                V
              </div>
              <span className="font-black text-xl text-foreground">VeroFlow</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Enterprise multi-tenant SaaS platform for field operations, KYC verification, and compliance tracking at scale.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a href="#" className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
                <X size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a href="#" className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
                <Globe size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a href="#" className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
                <Mail size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section, idx) => (
            <div key={idx}>
              <h4 className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-6">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-muted-foreground text-sm font-medium">
            © 2026 VeroFlow Inc. All rights reserved. | Crafted for enterprises, by operators.
          </p>
          <div className="flex gap-6 text-muted-foreground text-sm font-medium">
            <a href="#" className="hover:text-primary transition-colors">Status</a>
            <a href="#" className="hover:text-primary transition-colors">Security</a>
            <a href="#" className="hover:text-primary transition-colors">Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
