import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Antigravity | Multi-Tenant SaaS Platform',
  description: 'Enterprise-grade platform for engineering field operations at scale.',
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
