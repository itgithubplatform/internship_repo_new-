/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow importing from workspace packages
  transpilePackages: ['@platform/types'],

  // Prisma edge runtime compatibility
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: 'PLATFORM',
  },
};

module.exports = nextConfig;
