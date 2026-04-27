import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VeroFlow | Enterprise Multi-Tenant SaaS Platform',
  description: 'VeroFlow: Enterprise-grade multi-tenant platform for field operations, KYC verification, and compliance tracking. 100K concurrent users, real-time sync, offline-first PWA.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
