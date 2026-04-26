import { Request, Response } from 'express';
import { SubmissionStatus } from '@prisma/client';
import { SubmissionService } from '../services/submission.service';
import { logger } from '../utils/logger';

const submissionService = new SubmissionService();

export async function submitForm(req: Request, res: Response) {
  try {
    const { tenantId, id: engineerId } = req.user!;
    const { formId, data, notes, photoIds } = req.body;

    if (!formId || !data) {
      return res.status(400).json({ error: 'formId and data are required' });
    }

    const submission = await submissionService.submitForm({
      tenantId,
      engineerId,
      formId,
      data,
      notes,
      photoIds,
    });

    res.status(201).json(submission);
  } catch (err) {
    logger.error('[Submission] submitForm error', err);
    res.status(500).json({ error: 'Failed to submit form' });
  }
}

export async function getSubmissions(req: Request, res: Response) {
  try {
    const { tenantId, role, id } = req.user!;
    // Engineers only see their own submissions
    const targetEngineerId = role === 'ENGINEER' ? id : (req.query.engineerId as string);
    const status = req.query.status as any;

    const submissions = await submissionService.getSubmissions(tenantId, targetEngineerId, status);
    res.json(submissions);
  } catch (err) {
    logger.error('[Submission] getSubmissions error', err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
}

export async function reviewSubmission(req: Request, res: Response) {
  try {
    const { tenantId, id: reviewerId, role: reviewerRole } = req.user!;
    const { id } = req.params;
    const { status, reviewNote } = req.body;

    if (!['APPROVED', 'REJECTED', 'ESCALATED', 'FINALIZED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (status === 'FINALIZED' && reviewerRole !== 'ADMIN' && reviewerRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only admins can finalize submissions' });
    }

    await submissionService.reviewSubmission(id, tenantId, reviewerId, reviewerRole, status as SubmissionStatus, reviewNote);
    res.json({ success: true });
  } catch (err) {
    logger.error('[Submission] reviewSubmission error', err);
    res.status(500).json({ error: 'Failed to review submission' });
  }
}
