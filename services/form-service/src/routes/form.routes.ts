import { Router } from 'express';
import { createForm, getForms, getForm } from '../controllers/form.controller';
import { requireAuth, requireRoles } from '../middleware/auth.middleware';

export const formRouter = Router();

formRouter.post('/', requireAuth, requireRoles('ADMIN'), createForm);
formRouter.get('/', requireAuth, getForms); // All roles can list forms
formRouter.get('/:id', requireAuth, getForm); // All roles can get form details
