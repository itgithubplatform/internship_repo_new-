import { PrismaClient, KYCStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubmitParams {
  engineerId: string;
  tenantId: string;
  documents: Array<{
    type: string;
    fileName: string;
    mimeType: string;
    base64Data: string;
  }>;
}

interface ListParams {
  tenantId: string;
  status?: string;
  page: number;
  pageSize: number;
}

interface ApproveParams {
  submissionId: string;
  adminId: string;
}

interface RejectParams {
  submissionId: string;
  adminId: string;
  rejectionReason: string;
}

// ─── KYCService ───────────────────────────────────────────────────────────────

export class KYCService {
  /**
   * Create a new KYC submission with accompanying documents.
   * Documents are stored as raw bytes (Buffer) in the DB.
   */
  async submit(params: SubmitParams) {
    const { engineerId, tenantId, documents } = params;

    const submission = await prisma.kYCSubmission.create({
      data: {
        engineerId,
        tenantId,
        status: 'PENDING',
        documents: {
          create: documents.map((doc) => ({
            type: doc.type as any,
            fileName: doc.fileName,
            mimeType: doc.mimeType,
            data: Buffer.from(doc.base64Data, 'base64'),
          })),
        },
        auditLogs: {
          create: {
            actorId: engineerId,
            actorRole: 'ENGINEER',
            action: 'SUBMITTED',
            metadata: { documentCount: documents.length },
          },
        },
      },
      include: { documents: { select: { id: true, type: true, fileName: true } } },
    });

    return submission;
  }

  /** Quick status check — returns just the KYCStatus string or null */
  async getStatusByEngineer(engineerId: string): Promise<KYCStatus | null> {
    const latest = await prisma.kYCSubmission.findFirst({
      where: { engineerId },
      orderBy: { submittedAt: 'desc' },
      select: { status: true },
    });
    return latest?.status ?? null;
  }

  /** Full status response including submissionId and rejectionReason */
  async getFullStatus(engineerId: string) {
    const latest = await prisma.kYCSubmission.findFirst({
      where: { engineerId },
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        status: true,
        rejectionReason: true,
        reviewedAt: true,
      },
    });
    if (!latest) return null;
    return {
      engineerId,
      submissionId: latest.id,
      status: latest.status,
      rejectionReason: latest.rejectionReason,
      reviewedAt: latest.reviewedAt,
    };
  }

  /** Latest submission with document metadata (no binary data sent over wire) */
  async getLatestByEngineer(engineerId: string) {
    return prisma.kYCSubmission.findFirst({
      where: { engineerId },
      orderBy: { submittedAt: 'desc' },
      include: {
        documents: {
          select: { id: true, type: true, fileName: true, mimeType: true, uploadedAt: true },
        },
      },
    });
  }

  /** Paginated list for Admin view — filters by tenantId + optional status */
  async listByTenant(params: ListParams) {
    const { tenantId, status, page, pageSize } = params;
    const skip = (page - 1) * pageSize;

    const where = {
      tenantId,
      ...(status ? { status: status as KYCStatus } : {}),
    };

    const [total, submissions] = await prisma.$transaction([
      prisma.kYCSubmission.count({ where }),
      prisma.kYCSubmission.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { submittedAt: 'desc' },
        include: {
          documents: {
            select: { id: true, type: true, fileName: true, mimeType: true, uploadedAt: true },
          },
        },
      }),
    ]);

    return { total, page, pageSize, submissions };
  }

  /** Single submission with document metadata */
  async getById(id: string) {
    return prisma.kYCSubmission.findUnique({
      where: { id },
      include: {
        documents: {
          select: { id: true, type: true, fileName: true, mimeType: true, uploadedAt: true },
        },
        auditLogs: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /** Approve a KYC submission — sets status to APPROVED, records reviewer */
  async approve(params: ApproveParams) {
    const { submissionId, adminId } = params;

    return prisma.kYCSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'APPROVED',
        reviewedById: adminId,
        reviewedAt: new Date(),
        auditLogs: {
          create: {
            actorId: adminId,
            actorRole: 'ADMIN',
            action: 'APPROVED',
          },
        },
      },
    });
  }

  /** Reject a KYC submission — sets status to REJECTED, stores rejection reason */
  async reject(params: RejectParams) {
    const { submissionId, adminId, rejectionReason } = params;

    return prisma.kYCSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'REJECTED',
        reviewedById: adminId,
        reviewedAt: new Date(),
        rejectionReason,
        auditLogs: {
          create: {
            actorId: adminId,
            actorRole: 'ADMIN',
            action: 'REJECTED',
            metadata: { rejectionReason },
          },
        },
      },
    });
  }
}
