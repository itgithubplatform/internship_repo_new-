import { getTenantId } from '../context/tenantContext';

/**
 * Helper for building explicit tenant-scoped queries where Prisma Client Extensions
 * might be bypassed or when writing raw SQL.
 */
export function withTenant<T extends Record<string, any>>(queryOrData: T): T & { tenantId: string } {
  return {
    ...queryOrData,
    tenantId: getTenantId(),
  };
}

export function buildTenantWhereClause(additionalWhere: Record<string, any> = {}) {
  return {
    ...additionalWhere,
    tenantId: getTenantId(),
  };
}
