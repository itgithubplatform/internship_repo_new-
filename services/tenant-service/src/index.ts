import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env.TENANT_SERVICE_PORT || 4004;
const prisma = new PrismaClient();

app.use(helmet());
app.use(cors());
app.use(express.json());

// ─── Tenants ──────────────────────────────────────────────────────────────────

// List all tenants (Super Admin only - role check should be at gateway or here)
app.get('/tenant/all', async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: { license: true }
    });
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// Create new tenant (Onboarding)
app.post('/tenant', async (req, res) => {
  try {
    const { name, slug, email, domain, tier } = req.body;
    
    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        email,
        domain,
        license: {
          create: {
            tier: tier || 'TRIAL',
            status: 'ACTIVE',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 day trial
          }
        },
        settings: {
          create: {}
        }
      },
      include: { license: true }
    });
    
    res.status(201).json(tenant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

app.get('/tenant/:id', async (req, res) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.params.id },
      include: { license: true, settings: true }
    });
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tenant' });
  }
});

// ─── Products ────────────────────────────────────────────────────────────────

app.get('/product', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true }
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/product', async (req, res) => {
  try {
    const { name, sku, description, category } = req.body;
    const product = await prisma.product.create({
      data: { name, sku, description, category }
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.listen(PORT, () => {
  console.log(`[tenant-service] Running on port ${PORT}`);
});
