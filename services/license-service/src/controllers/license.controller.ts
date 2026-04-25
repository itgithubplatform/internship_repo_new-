import { Request, Response } from 'express';
import { z } from 'zod';
import { LicenseService } from '../services/license.service';
import { logger } from '../utils/logger';

const licenseService = new LicenseService();

const AssignLicenseSchema = z.object({
  tenantId: z.string().min(1),
  tier: z.enum(['TRIAL', 'BASIC', 'PROFESSIONAL', 'PLATINUM']),
  expiresAt: z.string().datetime().optional().nullable(),
});

const SuspendLicenseSchema = z.object({
  reason: z.string().min(5),
});

export async function checkAccess(req: Request, res: Response) {
  try {
    const { tenantId } = req.params;
    const result = await licenseService.checkAccess(tenantId);
    
    // API Gateway uses this to block/allow
    if (!result.hasAccess) {
      return res.status(403).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    logger.error('[License] checkAccess error', err);
    return res.status(500).json({ error: 'Failed to check license access' });
  }
}

export async function createTrial(req: Request, res: Response) {
  try {
    // Usually called internally by Tenant service on signup, so role check might be bypassed for internal calls
    // but assuming Super Admin or system creates it
    const { tenantId } = req.body;
    if (!tenantId) return res.status(400).json({ error: 'tenantId is required' });

    const license = await licenseService.createTrialLicense(tenantId);
    return res.status(201).json(license);
  } catch (err) {
    logger.error('[License] createTrial error', err);
    return res.status(500).json({ error: 'Failed to create trial license' });
  }
}

export async function assignLicense(req: Request, res: Response) {
  try {
    const parsed = AssignLicenseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(422).json({ error: 'Validation failed', details: parsed.error.flatten() });

    const superAdminId = req.user!.id;
    const { tenantId, tier, expiresAt } = parsed.data;

    const license = await licenseService.assignLicense({
      tenantId,
      tier,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      superAdminId,
    });

    logger.info(`[License] SuperAdmin ${superAdminId} assigned ${tier} to Tenant ${tenantId}`);
    return res.json(license);
  } catch (err) {
    logger.error('[License] assignLicense error', err);
    return res.status(500).json({ error: 'Failed to assign license' });
  }
}

export async function suspendLicense(req: Request, res: Response) {
  try {
    const { tenantId } = req.params;
    const parsed = SuspendLicenseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(422).json({ error: 'Validation failed', details: parsed.error.flatten() });

    const superAdminId = req.user!.id;
    const license = await licenseService.suspendLicense(tenantId, superAdminId, parsed.data.reason);

    logger.info(`[License] SuperAdmin ${superAdminId} suspended Tenant ${tenantId} license`);
    return res.json(license);
  } catch (err) {
    logger.error('[License] suspendLicense error', err);
    return res.status(500).json({ error: 'Failed to suspend license' });
  }
}
