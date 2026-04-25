/**
 * prisma/seed.ts
 *
 * Seeds the platform with:
 *  1. A Super Admin user (platform owner)
 *  2. A sample Tenant with Platinum license
 *  3. An Admin user for that tenant
 *  4. Sample products in the global catalogue
 *
 * Run: npm run prisma:seed
 */

import { PrismaClient, Role, LicenseTier, LicenseStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding platform database…');

  // ── 1. Super Admin ──────────────────────────────────────────────────────────
  const superAdminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD ?? 'SuperAdmin@123!';
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@platform.io' },
    update: {},
    create: {
      email:        'superadmin@platform.io',
      passwordHash: await bcrypt.hash(superAdminPassword, 12),
      firstName:    'Platform',
      lastName:     'Owner',
      role:         Role.SUPER_ADMIN,
      tenantId:     null,
      kycStatus:    'APPROVED', // Super Admin is always approved
      isActive:     true,
    },
  });
  console.log(`  ✅  Super Admin created: ${superAdmin.email}`);

  // ── 2. Sample Tenant ────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name:     'Acme Corporation',
      slug:     'acme-corp',
      email:    'admin@acme-corp.com',
      phone:    '+44 20 1234 5678',
      address:  '1 Innovation Drive, London, UK',
      isActive: true,
    },
  });
  console.log(`  ✅  Tenant created: ${tenant.name} (${tenant.slug})`);

  // ── 3. Platinum License for Tenant ─────────────────────────────────────────
  await prisma.license.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId:    tenant.id,
      tier:        LicenseTier.PLATINUM,
      status:      LicenseStatus.ACTIVE,
      expiresAt:   null, // Platinum = perpetual
      assignedById: superAdmin.id,
    },
  });
  console.log(`  ✅  Platinum license assigned to ${tenant.name}`);

  // ── 4. Admin user for the Tenant ───────────────────────────────────────────
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@Acme123!';
  const admin = await prisma.user.upsert({
    where: { email: 'admin@acme-corp.com' },
    update: {},
    create: {
      email:        'admin@acme-corp.com',
      passwordHash: await bcrypt.hash(adminPassword, 12),
      firstName:    'Alice',
      lastName:     'Admin',
      role:         Role.ADMIN,
      tenantId:     tenant.id,
      kycStatus:    'APPROVED',
      isActive:     true,
      createdById:  superAdmin.id,
    },
  });
  console.log(`  ✅  Admin created: ${admin.email}`);

  // ── 5. Sample Products ──────────────────────────────────────────────────────
  const products = [
    { name: 'Site Inspection',   sku: 'PROD-INSPECT-001', description: 'Field site inspection module' },
    { name: 'Safety Audit',      sku: 'PROD-SAFETY-001',  description: 'Safety audit and compliance forms' },
    { name: 'Equipment Survey',  sku: 'PROD-EQUIP-001',   description: 'Equipment condition survey forms' },
    { name: 'Photo Documentation', sku: 'PROD-PHOTO-001', description: 'Photograph capture and upload module' },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: { ...p, isActive: true },
    });
  }
  console.log(`  ✅  ${products.length} products seeded`);

  // ── 6. Enable all products for the sample tenant ───────────────────────────
  const allProducts = await prisma.product.findMany({ select: { id: true } });
  for (const product of allProducts) {
    await prisma.tenantProduct.upsert({
      where: { tenantId_productId: { tenantId: tenant.id, productId: product.id } },
      update: {},
      create: { tenantId: tenant.id, productId: product.id },
    });
  }
  console.log(`  ✅  All products enabled for ${tenant.name}`);

  console.log('\n🎉  Seed complete!\n');
  console.log('  Super Admin →', superAdmin.email, '|', superAdminPassword);
  console.log('  Admin       →', admin.email,       '|', adminPassword);
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
