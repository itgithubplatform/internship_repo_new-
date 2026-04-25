import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const LICENSE_SERVICE_URL = process.env.LICENSE_SERVICE_URL || 'http://license-service:4008';

// In-memory cache to prevent hitting license-service on every single API request
// In production, use Redis.
const licenseCache = new Map<string, { hasAccess: boolean; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function licenseMiddleware(req: Request, res: Response, next: NextFunction) {
  // Pass-through public routes
  if (req.path.startsWith('/auth/login') || req.path.startsWith('/auth/register')) {
    return next();
  }

  // Super Admin bypasses tenant license checks (they own the platform)
  if (req.user?.role === 'SUPER_ADMIN') {
    return next();
  }

  const tenantId = req.user?.tenantId;
  if (!tenantId) {
    return res.status(403).json({ error: 'No tenant ID found in token' });
  }

  try {
    const now = Date.now();
    const cached = licenseCache.get(tenantId);

    if (cached && cached.expiresAt > now) {
      if (!cached.hasAccess) {
        return res.status(403).json({ error: 'Tenant license inactive or expired (cached)' });
      }
      return next();
    }

    // Cache miss or expired — fetch from license-service
    const response = await fetch(`${LICENSE_SERVICE_URL}/license/access/${tenantId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.warn(`[Gateway] License check failed for tenant ${tenantId}`, errorData);
      
      // Update cache to reflect no access
      licenseCache.set(tenantId, { hasAccess: false, expiresAt: now + CACHE_TTL_MS });
      
      return res.status(403).json({
        error: 'Tenant license inactive or expired',
        details: errorData.reason || 'LICENSE_CHECK_FAILED'
      });
    }

    const data = await response.json();
    
    // Update cache
    licenseCache.set(tenantId, { hasAccess: data.hasAccess, expiresAt: now + CACHE_TTL_MS });

    if (!data.hasAccess) {
      return res.status(403).json({
        error: 'Tenant license inactive or expired',
        details: data.reason
      });
    }

    next();
  } catch (err) {
    logger.error(`[Gateway] Error communicating with license-service for tenant ${tenantId}`, err);
    // Fail closed: if we can't verify the license, deny access
    return res.status(500).json({ error: 'Could not verify tenant license status' });
  }
}
