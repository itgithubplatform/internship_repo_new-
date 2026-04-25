import { Router } from 'express';
import multer from 'multer';
import { uploadPhoto, getPhoto, listPhotos } from '../controllers/photo.controller';
import { requireAuth, requireRoles } from '../middleware/auth.middleware';

export const photoRouter = Router();

// Memory storage keeps the file as a Buffer in memory
// We limit size to 2MB as per requirements
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// Upload: Any authenticated role can upload
photoRouter.post('/upload', requireAuth, upload.single('photo'), uploadPhoto);

// Get binary photo data
photoRouter.get('/:id', requireAuth, getPhoto);

// List metadata of photos
photoRouter.get('/', requireAuth, requireRoles('MANAGER', 'ADMIN', 'SUPER_ADMIN'), listPhotos);
