import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

export interface AuthPayload {
  id: string;
  tenantId: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'ENGINEER';
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Pass-through public routes (e.g., login/register)
  if (req.path.startsWith('/auth/login') || req.path.startsWith('/auth/register')) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = payload; // Attach to request for the next middleware (license checker)
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
