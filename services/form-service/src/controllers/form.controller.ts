import { Request, Response } from 'express';
import { FormService } from '../services/form.service';
import { logger } from '../utils/logger';

const formService = new FormService();

export async function createForm(req: Request, res: Response) {
  try {
    const { tenantId, id: userId } = req.user!;
    const formData = { ...req.body, tenantId, createdById: userId };
    
    const form = await formService.createForm(formData);
    res.status(201).json(form);
  } catch (err) {
    logger.error('[Form] createForm error', err);
    res.status(500).json({ error: 'Failed to create form' });
  }
}

export async function getForms(req: Request, res: Response) {
  try {
    const { tenantId } = req.user!;
    const isActive = req.query.active ? req.query.active === 'true' : undefined;
    
    const forms = await formService.getFormsByTenant(tenantId, isActive);
    res.json(forms);
  } catch (err) {
    logger.error('[Form] getForms error', err);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
}

export async function getForm(req: Request, res: Response) {
  try {
    const { tenantId } = req.user!;
    const { id } = req.params;
    
    const form = await formService.getFormById(id, tenantId);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    
    res.json(form);
  } catch (err) {
    logger.error('[Form] getForm error', err);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
}
