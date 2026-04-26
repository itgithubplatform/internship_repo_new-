import { getOptionalTenantId } from '../context/tenantContext';

/**
 * Isolated Logger that inherently appends the tenant ID to every log entry.
 * Logs: All log entries include tenant_id for filtering.
 */
export const logger = {
  info: (message: string, meta: any = {}) => {
    const tenantId = getOptionalTenantId() || 'GLOBAL';
    console.log(JSON.stringify({ level: 'INFO', tenantId, message, ...meta, timestamp: new Date().toISOString() }));
  },
  
  warn: (message: string, meta: any = {}) => {
    const tenantId = getOptionalTenantId() || 'GLOBAL';
    console.warn(JSON.stringify({ level: 'WARN', tenantId, message, ...meta, timestamp: new Date().toISOString() }));
  },
  
  error: (message: string, meta: any = {}) => {
    const tenantId = getOptionalTenantId() || 'GLOBAL';
    console.error(JSON.stringify({ level: 'ERROR', tenantId, message, ...meta, timestamp: new Date().toISOString() }));
  }
};
