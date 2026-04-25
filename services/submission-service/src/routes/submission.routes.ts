import { Router } from 'express';
import { submitForm, getSubmissions, reviewSubmission } from '../controllers/submission.controller';
import { requireAuth, requireRoles } from '../middleware/auth.middleware';

export const submissionRouter = Router();

submissionRouter.post('/', requireAuth, requireRoles('ENGINEER', 'MANAGER', 'ADMIN'), submitForm);
submissionRouter.get('/', requireAuth, getSubmissions);
submissionRouter.patch('/:id/review', requireAuth, requireRoles('MANAGER', 'ADMIN', 'SUPER_ADMIN'), reviewSubmission);
