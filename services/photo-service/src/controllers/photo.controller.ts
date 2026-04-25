import { Request, Response } from 'express';
import { PhotoService } from '../services/photo.service';
import { logger } from '../utils/logger';

const photoService = new PhotoService();

export async function uploadPhoto(req: Request, res: Response) {
  try {
    const { tenantId, id: uploadedById } = req.user!;
    const file = req.file;
    const { caption, metadata } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    if (file.size > 2 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 2MB limit. Please compress on the client side.' });
    }

    const photo = await photoService.uploadPhoto({
      tenantId,
      uploadedById,
      fileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      data: file.buffer,
      caption,
      metadata,
    });

    res.status(201).json(photo);
  } catch (err) {
    logger.error('[Photo] uploadPhoto error', err);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
}

export async function getPhoto(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { tenantId, role } = req.user!;
    
    // Super Admin can access across tenants
    const targetTenantId = role === 'SUPER_ADMIN' ? undefined : tenantId;

    const photo = await photoService.getPhotoData(id, targetTenantId);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    // Redirect the client to the AWS S3 presigned URL
    res.redirect(302, photo.url);
  } catch (err) {
    logger.error('[Photo] getPhoto error', err);
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
}

export async function listPhotos(req: Request, res: Response) {
  try {
    const { tenantId, role } = req.user!;
    
    // Super Admin can see all tenant's photos
    const targetTenantId = role === 'SUPER_ADMIN' ? undefined : tenantId;

    const photos = await photoService.listPhotos(targetTenantId);
    res.json(photos);
  } catch (err) {
    logger.error('[Photo] listPhotos error', err);
    res.status(500).json({ error: 'Failed to list photos' });
  }
}
