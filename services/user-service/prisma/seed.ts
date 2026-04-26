import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Super Tenant (The Platform Owner)
  const superTenant = await prisma.tenant.upsert({
    where: { slug: 'platform-admin' },
    update: {},
    create: {
      name: 'Platform Administration',
      slug: 'platform-admin',
      tier: 'ENTERPRISE',
      isActive: true,
    },
  });

  // 2. Create Super Admin User
  // Requirement: "Cannot be created by any other role — seeded at deployment"
  const superAdminEmail = 'superadmin@platform.com';
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('Admin@123456', salt);

  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      email: superAdminEmail,
      firstName: 'System',
      lastName: 'Administrator',
      passwordHash: passwordHash,
      role: 'SUPER_ADMIN',
      tenantId: superTenant.id,
      isActive: true,
    },
  });

  console.log(`✅ Super Admin seeded: ${superAdminEmail}`);
  console.log('🚀 Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
