import { Router } from 'express';
import { checkAccess, createTrial, assignLicense, suspendLicense } from '../controllers/license.controller';
import { requireAuth, requireRoles } from '../middleware/auth.middleware';

export const licenseRouter = Router();

// Internal gateway check
licenseRouter.get('/access/:tenantId', checkAccess);

// Super Admin endpoints
licenseRouter.post('/trial', requireAuth, requireRoles('SUPER_ADMIN'), createTrial);
licenseRouter.post('/assign', requireAuth, requireRoles('SUPER_ADMIN'), assignLicense);
licenseRouter.post('/suspend/:tenantId', requireAuth, requireRoles('SUPER_ADMIN'), suspendLicense);
