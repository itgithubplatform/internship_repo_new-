import { PrismaClient, SubmissionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateSubmissionDto {
  tenantId: string;
  engineerId: string;
  formId: string;
  data: any;
  notes?: string;
  photoIds?: string[];
}

export class SubmissionService {
  async submitForm(data: CreateSubmissionDto) {
    return prisma.submission.create({
      data: {
        tenantId: data.tenantId,
        engineerId: data.engineerId,
        formId: data.formId,
        data: data.data,
        notes: data.notes,
        status: 'SUBMITTED',
        submittedAt: new Date(),
        // Link photos if provided
        photos: data.photoIds?.length ? {
          create: data.photoIds.map(id => ({ photoId: id }))
        } : undefined
      },
    });
  }

  async getSubmissions(tenantId: string, engineerId?: string, status?: SubmissionStatus) {
    return prisma.submission.findMany({
      where: {
        tenantId,
        ...(engineerId ? { engineerId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { photos: true },
    });
  }

  async reviewSubmission(id: string, tenantId: string, reviewerId: string, status: 'APPROVED' | 'REJECTED' | 'ESCALATED', reviewNote?: string) {
    return prisma.submission.updateMany({
      where: { id, tenantId },
      data: {
        status,
        reviewNote,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
      },
    });
  }
}
