import { Request, Response, NextFunction } from 'express';

export interface AuthPayload {
  id: string;
  tenantId: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'ENGINEER';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const id = req.headers['x-user-id'] as string;
  const tenantId = req.headers['x-tenant-id'] as string;
  const role = req.headers['x-user-role'] as AuthPayload['role'];

  if (!id || !tenantId || !role) {
    return res.status(401).json({ error: 'Unauthenticated - Missing Gateway Headers' });
  }

  req.user = { id, tenantId, role };
  next();
}

export function requireRoles(...roles: AuthPayload['role'][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
