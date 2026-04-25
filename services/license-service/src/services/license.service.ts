import { PrismaClient, LicenseTier, LicenseStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class LicenseService {
  /**
   * Check if a tenant's license is active.
   * Called internally by API Gateway on every request to validate tenant access.
   */
  async checkAccess(tenantId: string): Promise<{
    hasAccess: boolean;
    tier: LicenseTier;
    status: LicenseStatus;
    reason?: string;
  }> {
    const license = await prisma.license.findUnique({
      where: { tenantId },
    });

    if (!license) {
      return { hasAccess: false, tier: 'TRIAL', status: 'CANCELLED', reason: 'NO_LICENSE_FOUND' };
    }

    if (license.status !== 'ACTIVE') {
      return { hasAccess: false, tier: license.tier, status: license.status, reason: `LICENSE_${license.status}` };
    }

    // Check expiration (Trial or fixed-term licenses)
    if (license.expiresAt && new Date() > license.expiresAt) {
      // Auto-update status to EXPIRED
      await prisma.license.update({
        where: { id: license.id },
        data: { status: 'EXPIRED' },
      });
      return { hasAccess: false, tier: license.tier, status: 'EXPIRED', reason: 'LICENSE_EXPIRED' };
    }

    return { hasAccess: true, tier: license.tier, status: license.status };
  }

  /**
   * Create a 1-week trial license for a new tenant
   */
  async createTrialLicense(tenantId: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days trial

    return prisma.license.create({
      data: {
        tenantId,
        tier: 'TRIAL',
        status: 'ACTIVE',
        expiresAt,
      },
    });
  }

  /**
   * Super Admin assigns a new tier
   */
  async assignLicense(params: {
    tenantId: string;
    tier: LicenseTier;
    expiresAt?: Date | null;
    superAdminId: string;
  }) {
    const { tenantId, tier, expiresAt, superAdminId } = params;

    const existing = await prisma.license.findUnique({ where: { tenantId } });

    if (!existing) {
      // Create new
      return prisma.license.create({
        data: {
          tenantId,
          tier,
          status: 'ACTIVE',
          expiresAt: expiresAt ?? null,
          assignedById: superAdminId,
          history: {
            create: {
              fromTier: 'TRIAL',
              toTier: tier,
              changedById: superAdminId,
              reason: 'Initial assignment',
            },
          },
        },
      });
    }

    // Update existing
    return prisma.license.update({
      where: { id: existing.id },
      data: {
        tier,
        status: 'ACTIVE',
        expiresAt: expiresAt ?? null,
        assignedById: superAdminId,
        history: {
          create: {
            fromTier: existing.tier,
            toTier: tier,
            changedById: superAdminId,
            reason: 'Tier upgrade/change',
          },
        },
      },
    });
  }

  /**
   * Suspend a tenant's license
   */
  async suspendLicense(tenantId: string, superAdminId: string, reason: string) {
    const existing = await prisma.license.findUnique({ where: { tenantId } });
    if (!existing) throw new Error('License not found');

    return prisma.license.update({
      where: { id: existing.id },
      data: {
        status: 'SUSPENDED',
        history: {
          create: {
            fromTier: existing.tier,
            toTier: existing.tier,
            changedById: superAdminId,
            reason: `Suspended: ${reason}`,
          },
        },
      },
    });
  }
}
