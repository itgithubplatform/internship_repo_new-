/**
 * lib/prisma.ts
 *
 * Prisma Client singleton for the Next.js web app.
 *
 * Why a singleton?
 * Next.js hot-reload in development would create a new PrismaClient on every
 * module reload, quickly exhausting the DB connection pool.
 * We attach the instance to `globalThis` so it survives HMR reloads.
 *
 * In production a single instance is created and reused for the process lifetime.
 */

import { PrismaClient, Prisma } from '@prisma/client';

// ─── Log levels per environment ───────────────────────────────────────────────

const logLevels: Prisma.LogLevel[] =
  process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'];

// ─── Singleton factory ────────────────────────────────────────────────────────

function createPrismaClient() {
  return new PrismaClient({
    log: logLevels,
    errorFormat: 'pretty',
  });
}

// Extend globalThis type to hold our singleton
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// ─── Export singleton ─────────────────────────────────────────────────────────

export const prisma: PrismaClient =
  globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export default prisma;

// ─── Re-export Prisma namespace for type use across the app ──────────────────
export { Prisma };
