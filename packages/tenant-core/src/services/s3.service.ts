import { getTenantId } from '../context/tenantContext';
import { logger } from '../utils/logger';

// Mock S3 client for demonstration
const mockS3Client = {
  upload: async (key: string, _data: Buffer) => {
    logger.info(`[S3] Uploading securely to isolated path: ${key}`);
    return `https://s3.example.com/${key}`;
  }
};

/**
 * Uploads a file to S3, strictly enforcing tenant isolation at the storage level.
 * It automatically prefixes the S3 key with the current tenant's ID.
 */
export async function uploadTenantIsolatedFile(folder: string, filename: string, data: Buffer) {
  const tenantId = getTenantId();
  
  // Storage isolation: Force prefix /tenants/{tenant_id}/
  const safePath = `tenants/${tenantId}/${folder.replace(/^\/+/, '')}/${filename}`;
  
  return await mockS3Client.upload(safePath, data);
}

export function buildIsolatedS3Prefix(folder: string) {
  const tenantId = getTenantId();
  return `tenants/${tenantId}/${folder}/`;
}
