import { getTenantId } from '../context/tenantContext';
import { createClient } from 'redis';

// Simple mocked connection for demonstration
const client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

/**
 * Wraps Redis caching to enforce tenant-based key namespacing.
 * Cache: Redis keys are namespaced per tenant: `tenant:{tenant_id}:{key}`
 */
export const isolatedRedis = {
  async connect() {
    if (!client.isOpen) await client.connect();
  },

  async set(key: string, value: string, expireSeconds?: number) {
    const isolatedKey = `tenant:${getTenantId()}:${key}`;
    if (expireSeconds) {
      await client.setEx(isolatedKey, expireSeconds, value);
    } else {
      await client.set(isolatedKey, value);
    }
  },

  async get(key: string): Promise<string | null> {
    const isolatedKey = `tenant:${getTenantId()}:${key}`;
    return await client.get(isolatedKey);
  },

  async delete(key: string) {
    const isolatedKey = `tenant:${getTenantId()}:${key}`;
    await client.del(isolatedKey);
  }
};
