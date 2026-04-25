import { Router } from 'express';
import {
  submitKYC,
  getKYCStatus,
  getMySubmission,
  listSubmissions,
  getSubmissionById,
  approveKYC,
  rejectKYC,
  getTenantSubmissions,
} from '../controllers/kyc.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/auth.middleware';

export const kycRouter = Router();

// ──────────────────────────────────────────────────────────────────────────────
//  ENGINEER routes
//  POST   /kyc/submit                 — Submit KYC documents
//  GET    /kyc/status/:engineerId     — Check own KYC status
//  GET    /kyc/me                     — Get own full submission detail
// ──────────────────────────────────────────────────────────────────────────────

kycRouter.post(
  '/submit',
  requireAuth,
  requireRoles('ENGINEER'),
  submitKYC,
);

kycRouter.get(
  '/status/:engineerId',
  requireAuth,
  requireRoles('ENGINEER', 'ADMIN', 'SUPER_ADMIN'),
  getKYCStatus,
);

kycRouter.get(
  '/me',
  requireAuth,
  requireRoles('ENGINEER'),
  getMySubmission,
);

// ──────────────────────────────────────────────────────────────────────────────
//  ADMIN routes (scoped to their tenant)
//  GET    /kyc/submissions            — List all pending/all submissions for tenant
//  GET    /kyc/:id                    — Get one submission detail
//  PUT    /kyc/:id/approve            — Approve a KYC submission
//  PUT    /kyc/:id/reject             — Reject a KYC submission with reason
// ──────────────────────────────────────────────────────────────────────────────

kycRouter.get(
  '/submissions',
  requireAuth,
  requireRoles('ADMIN', 'SUPER_ADMIN'),
  listSubmissions,
);

kycRouter.get(
  '/:id',
  requireAuth,
  requireRoles('ADMIN', 'SUPER_ADMIN'),
  getSubmissionById,
);

kycRouter.put(
  '/:id/approve',
  requireAuth,
  requireRoles('ADMIN', 'SUPER_ADMIN'),
  approveKYC,
);

kycRouter.put(
  '/:id/reject',
  requireAuth,
  requireRoles('ADMIN', 'SUPER_ADMIN'),
  rejectKYC,
);

// ──────────────────────────────────────────────────────────────────────────────
//  SUPER ADMIN routes (cross-tenant)
//  GET    /kyc/tenant/:tenantId       — All submissions for a specific tenant
// ──────────────────────────────────────────────────────────────────────────────

kycRouter.get(
  '/tenant/:tenantId',
  requireAuth,
  requireRoles('SUPER_ADMIN'),
  getTenantSubmissions,
);
