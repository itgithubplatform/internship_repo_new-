import { Request, Response, NextFunction } from 'express';
import { runWithTenant } from '../context/tenantContext';
import { logger } from '../utils/logger';

export function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  // Extract tenant ID from header or decoded JWT (usually injected by API Gateway)
  const tenantId = req.headers['x-tenant-id'] as string;

  if (!tenantId) {
    logger.warn('Tenant isolation breach attempt or missing header');
    return res.status(401).json({ error: 'Missing tenant identity' });
  }

  // Run the request inside an AsyncLocalStorage context bound to this tenant
  runWithTenant(tenantId, () => {
    next();
  });
}
