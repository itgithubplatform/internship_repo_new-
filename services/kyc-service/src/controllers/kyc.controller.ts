import { Request, Response } from 'express';
import { z } from 'zod';
import { KYCService } from '../services/kyc.service';
import { logger } from '../utils/logger';

const kycService = new KYCService();

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const DocumentSchema = z.object({
  type: z.enum([
    'GOVERNMENT_ID',
    'PASSPORT',
    'DRIVERS_LICENSE',
    'PROOF_OF_ADDRESS',
    'SELFIE_PHOTOGRAPH',
  ]),
  fileName: z.string().min(1),
  mimeType: z.string().regex(/^(image\/(jpeg|png|webp)|application\/pdf)$/),
  base64Data: z.string().min(1),
});

const SubmitKYCSchema = z.object({
  documents: z.array(DocumentSchema).min(2, 'At least 2 documents required'),
});

const RejectSchema = z.object({
  rejectionReason: z.string().min(10, 'Rejection reason must be at least 10 characters'),
});

// ─── Helper ───────────────────────────────────────────────────────────────────
function sendError(res: Response, status: number, message: string, details?: unknown) {
  res.status(status).json({ error: message, ...(details && { details }) });
}

// ──────────────────────────────────────────────────────────────────────────────
//  POST /kyc/submit
//  Engineer submits their KYC documents.
//  If a previous REJECTED submission exists, this creates a new one (resubmission).
// ──────────────────────────────────────────────────────────────────────────────
export async function submitKYC(req: Request, res: Response) {
  try {
    const parsed = SubmitKYCSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 422, 'Validation failed', parsed.error.flatten());

    const { id: engineerId, tenantId } = (req as any).user;

    // Block resubmission if already APPROVED or PENDING/UNDER_REVIEW
    const currentStatus = await kycService.getStatusByEngineer(engineerId);
    if (currentStatus === 'APPROVED') {
      return sendError(res, 409, 'KYC already approved — no resubmission needed');
    }
    if (currentStatus === 'PENDING' || currentStatus === 'UNDER_REVIEW') {
      return sendError(res, 409, 'A KYC submission is already under review');
    }

    const submission = await kycService.submit({ engineerId, tenantId, documents: parsed.data.documents });
    logger.info(`[KYC] Engineer ${engineerId} submitted KYC — submission ${submission.id}`);

    res.status(201).json({ submissionId: submission.id, status: submission.status });
  } catch (err) {
    logger.error('[KYC] submitKYC error', err);
    sendError(res, 500, 'Failed to submit KYC');
  }
}

// ──────────────────────────────────────────────────────────────────────────────
//  GET /kyc/status/:engineerId
// ──────────────────────────────────────────────────────────────────────────────
export async function getKYCStatus(req: Request, res: Response) {
  try {
    const { engineerId } = req.params;
    const statusData = await kycService.getFullStatus(engineerId);
    if (!statusData) return sendError(res, 404, 'No KYC submission found for this engineer');
    res.json(statusData);
  } catch (err) {
    logger.error('[KYC] getKYCStatus error', err);
    sendError(res, 500, 'Failed to retrieve KYC status');
  }
}

// ──────────────────────────────────────────────────────────────────────────────
//  GET /kyc/me  — Engineer's own submission detail
// ──────────────────────────────────────────────────────────────────────────────
export async function getMySubmission(req: Request, res: Response) {
  try {
    const { id: engineerId } = (req as any).user;
    const submission = await kycService.getLatestByEngineer(engineerId);
    if (!submission) return res.json({ status: 'NOT_SUBMITTED' });
    res.json(submission);
  } catch (err) {
    logger.error('[KYC] getMySubmission error', err);
    sendError(res, 500, 'Failed to retrieve submission');
  }
}

// ──────────────────────────────────────────────────────────────────────────────
//  GET /kyc/submissions  — Admin: list submissions within their tenant
//  Query params: status, page, pageSize
// ──────────────────────────────────────────────────────────────────────────────
export async function listSubmissions(req: Request, res: Response) {
  try {
    const { tenantId, role } = (req as any).user;
    const status = req.query.status as string | undefined;
    const page = parseInt(String(req.query.page || '1'), 10);
    const pageSize = parseInt(String(req.query.pageSize || '20'), 10);

    // SUPER_ADMIN can pass any tenantId via query, ADMIN is locked to their tenant
    const targetTenant = role === 'SUPER_ADMIN'
      ? (req.query.tenantId as string || tenantId)
      : tenantId;

    const result = await kycService.listByTenant({ tenantId: targetTenant, status, page, pageSize });
    res.json(result);
  } catch (err) {
    logger.error('[KYC] listSubmissions error', err);
    sendError(res, 500, 'Failed to list submissions');
  }
}

// ──────────────────────────────────────────────────────────────────────────────
//  GET /kyc/:id  — Admin: single submission detail with document metadata
// ──────────────────────────────────────────────────────────────────────────────
export async function getSubmissionById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { tenantId, role } = (req as any).user;

    const submission = await kycService.getById(id);
    if (!submission) return sendError(res, 404, 'Submission not found');

    // Admin can only view their own tenant's submissions
    if (role === 'ADMIN' && submission.tenantId !== tenantId) {
      return sendError(res, 403, 'Access denied');
    }

    res.json(submission);
  } catch (err) {
    logger.error('[KYC] getSubmissionById error', err);
    sendError(res, 500, 'Failed to retrieve submission');
  }
}

// ──────────────────────────────────────────────────────────────────────────────
//  PUT /kyc/:id/approve  — Admin approves KYC
// ──────────────────────────────────────────────────────────────────────────────
export async function approveKYC(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { id: adminId, tenantId, role } = (req as any).user;

    const submission = await kycService.getById(id);
    if (!submission) return sendError(res, 404, 'Submission not found');
    if (role === 'ADMIN' && submission.tenantId !== tenantId) {
      return sendError(res, 403, 'Access denied');
    }
    if (submission.status === 'APPROVED') {
      return sendError(res, 409, 'Submission already approved');
    }

    const updated = await kycService.approve({ submissionId: id, adminId });
    logger.info(`[KYC] Admin ${adminId} approved submission ${id}`);
    res.json({ message: 'KYC approved', submission: updated });
  } catch (err) {
    logger.error('[KYC] approveKYC error', err);
    sendError(res, 500, 'Failed to approve KYC');
  }
}

// ──────────────────────────────────────────────────────────────────────────────
//  PUT /kyc/:id/reject  — Admin rejects KYC with a reason
// ──────────────────────────────────────────────────────────────────────────────
export async function rejectKYC(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { id: adminId, tenantId, role } = (req as any).user;

    const parsed = RejectSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 422, 'Validation failed', parsed.error.flatten());

    const submission = await kycService.getById(id);
    if (!submission) return sendError(res, 404, 'Submission not found');
    if (role === 'ADMIN' && submission.tenantId !== tenantId) {
      return sendError(res, 403, 'Access denied');
    }
    if (submission.status === 'REJECTED') {
      return sendError(res, 409, 'Submission already rejected');
    }

    const updated = await kycService.reject({
      submissionId: id,
      adminId,
      rejectionReason: parsed.data.rejectionReason,
    });
    logger.info(`[KYC] Admin ${adminId} rejected submission ${id}`);
    res.json({ message: 'KYC rejected', submission: updated });
  } catch (err) {
    logger.error('[KYC] rejectKYC error', err);
    sendError(res, 500, 'Failed to reject KYC');
  }
}

// ──────────────────────────────────────────────────────────────────────────────
//  GET /kyc/tenant/:tenantId  — Super Admin cross-tenant view
// ──────────────────────────────────────────────────────────────────────────────
export async function getTenantSubmissions(req: Request, res: Response) {
  try {
    const { tenantId } = req.params;
    const page = parseInt(String(req.query.page || '1'), 10);
    const pageSize = parseInt(String(req.query.pageSize || '20'), 10);
    const status = req.query.status as string | undefined;

    const result = await kycService.listByTenant({ tenantId, status, page, pageSize });
    res.json(result);
  } catch (err) {
    logger.error('[KYC] getTenantSubmissions error', err);
    sendError(res, 500, 'Failed to retrieve tenant submissions');
  }
}
