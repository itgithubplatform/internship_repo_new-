import { AsyncLocalStorage } from 'async_hooks';

interface TenantContext {
  tenantId: string;
}

const tenantStorage = new AsyncLocalStorage<TenantContext>();

export function runWithTenant(tenantId: string, callback: () => void) {
  tenantStorage.run({ tenantId }, callback);
}

export function getTenantId(): string {
  const store = tenantStorage.getStore();
  if (!store || !store.tenantId) {
    throw new Error('Tenant context is missing! This query/action is rejected for security.');
  }
  return store.tenantId;
}

export function getOptionalTenantId(): string | undefined {
  return tenantStorage.getStore()?.tenantId;
}
