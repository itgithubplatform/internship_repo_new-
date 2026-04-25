import { PrismaClient } from '@prisma/client';
import { uploadToS3, getPresignedUrl } from '../utils/s3.util';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface UploadPhotoDto {
  tenantId: string;
  uploadedById: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  data: Buffer;
  caption?: string;
  metadata?: any;
}

export class PhotoService {
  async uploadPhoto(dto: UploadPhotoDto) {
    // 1. Upload to S3/MinIO
    const ext = dto.fileName.split('.').pop() || 'jpg';
    const key = `${dto.tenantId}/${dto.uploadedById}/${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    
    const storageUrl = await uploadToS3(key, dto.data, dto.mimeType);

    // 2. Save metadata + S3 key in Database
    return prisma.photo.create({
      data: {
        tenantId: dto.tenantId,
        uploadedById: dto.uploadedById,
        fileName: dto.fileName,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        storageUrl: storageUrl, // Stores the S3 key
        caption: dto.caption,
        metadata: dto.metadata ? JSON.parse(dto.metadata) : null,
      },
      // Exclude binary data from the return to save memory
      select: {
        id: true,
        tenantId: true,
        uploadedById: true,
        fileName: true,
        mimeType: true,
        sizeBytes: true,
        caption: true,
        createdAt: true,
      }
    });
  }

  async getPhotoMetadata(id: string, tenantId?: string) {
    return prisma.photo.findFirst({
      where: {
        id,
        ...(tenantId ? { tenantId } : {}),
      },
      select: {
        id: true,
        tenantId: true,
        uploadedById: true,
        fileName: true,
        mimeType: true,
        sizeBytes: true,
        caption: true,
        createdAt: true,
      }
    });
  }

  async getPhotoData(id: string, tenantId?: string) {
    const photo = await prisma.photo.findFirst({
      where: {
        id,
        ...(tenantId ? { tenantId } : {}),
      },
      select: {
        storageUrl: true,
        mimeType: true,
      }
    });

    if (!photo) return null;

    // Generate short-lived presigned URL
    const url = await getPresignedUrl(photo.storageUrl);
    return { url, mimeType: photo.mimeType };
  }

  async listPhotos(tenantId?: string) {
    return prisma.photo.findMany({
      where: { ...(tenantId ? { tenantId } : {}) },
      select: {
        id: true,
        tenantId: true,
        uploadedById: true,
        fileName: true,
        mimeType: true,
        sizeBytes: true,
        caption: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit for performance
    });
  }
}
