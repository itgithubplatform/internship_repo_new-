import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env.ADMIN_PORT || 4010;
const prisma = new PrismaClient();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Dummy Auth Middleware for Admin Service (assuming Gateway passes headers)
const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const role = req.headers['x-user-role'];
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Super Admin only' });
  }
  next();
};

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const role = req.headers['x-user-role'];
  if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin only' });
  }
  next();
};

// ─── Global Configuration ──────────────────────────────────────────────────
app.get('/api/admin/config', requireAdmin, async (req, res) => {
  try {
    const configs = await prisma.globalConfig.findMany();
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch configs' });
  }
});

app.post('/api/admin/config', requireSuperAdmin, async (req, res) => {
  try {
    const { key, value, description } = req.body;
    const actorId = req.headers['x-user-id'] as string;

    const config = await prisma.globalConfig.upsert({
      where: { key },
      update: { value, description, updatedBy: actorId },
      create: { key, value, description, updatedBy: actorId }
    });

    await logAudit(actorId, 'SUPER_ADMIN', 'UPDATE_CONFIG', 'CONFIG', { key, value });

    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update config' });
  }
});

// ─── Audit Logs ─────────────────────────────────────────────────────────────
app.get('/api/admin/audit-logs', requireSuperAdmin, async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

app.post('/api/admin/audit-logs', requireAdmin, async (req, res) => {
  try {
    const { action, entityType, metadata, entityId, tenantId } = req.body;
    const actorId = req.headers['x-user-id'] as string;
    const actorRole = req.headers['x-user-role'] as string;

    const log = await logAudit(actorId, actorRole, action, entityType, metadata, entityId, tenantId);
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create audit log' });
  }
});

// Helper for logging actions
async function logAudit(actorId: string, actorRole: string, action: string, entityType: string, metadata?: any, entityId?: string, tenantId?: string) {
  return prisma.auditLog.create({
    data: { actorId, actorRole, action, entityType, metadata: metadata || {}, entityId, tenantId }
  });
}

// ─── Products & Companies (Aggregator/Proxy endpoints) ──────────────────────
// Super Admin needs to manage products and see companies. We proxy or fetch from tenant-service.
const TENANT_SERVICE_URL = process.env.TENANT_SERVICE_URL || 'http://localhost:4004';

app.get('/api/admin/companies', requireSuperAdmin, async (req, res) => {
  try {
    const response = await fetch(`${TENANT_SERVICE_URL}/tenant/all`, {
      headers: {
        'x-user-id': req.headers['x-user-id'] as string,
        'x-user-role': req.headers['x-user-role'] as string
      }
    });
    if (!response.ok) throw new Error('Failed to fetch from tenant-service');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

app.get('/api/admin/products', requireAdmin, async (req, res) => {
  try {
    const response = await fetch(`${TENANT_SERVICE_URL}/product`, {
      headers: {
        'x-user-id': req.headers['x-user-id'] as string,
        'x-user-role': req.headers['x-user-role'] as string
      }
    });
    if (!response.ok) throw new Error('Failed to fetch from tenant-service');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/admin/products', requireSuperAdmin, async (req, res) => {
  try {
    const response = await fetch(`${TENANT_SERVICE_URL}/product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': req.headers['x-user-id'] as string,
        'x-user-role': req.headers['x-user-role'] as string
      },
      body: JSON.stringify(req.body)
    });
    if (!response.ok) throw new Error('Failed to create product in tenant-service');
    const data = await response.json();

    await logAudit(req.headers['x-user-id'] as string, 'SUPER_ADMIN', 'CREATE_PRODUCT', 'PRODUCT', { sku: req.body.sku });

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.listen(PORT, () => {
  console.log(`[admin-service] Running on port ${PORT}`);
});
