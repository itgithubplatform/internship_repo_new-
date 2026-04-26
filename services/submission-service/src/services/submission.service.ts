import { PrismaClient, SubmissionStatus } from '@prisma/client';
import { logger } from '../utils/logger';

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
        status: SubmissionStatus.SUBMITTED,
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

  async reviewSubmission(
    id: string,
    tenantId: string,
    reviewerId: string,
    reviewerRole: string,
    status: SubmissionStatus,
    reviewNote?: string
  ) {
    const submission = await prisma.submission.update({
      where: { id, tenantId },
      data: {
        status,
        reviewNote,
        ...(reviewerRole === 'MANAGER' ? { reviewedByManagerId: reviewerId } : { reviewedByAdminId: reviewerId }),
        reviewedAt: new Date(),
        approvalLogs: {
          create: {
            actorId: reviewerId,
            actorRole: reviewerRole,
            action: status,
            comment: reviewNote
          }
        }
      },
      include: {
        approvalLogs: true
      }
    });

    // Fire-and-forget notification request
    this.sendNotification(submission, status).catch(err => {
      logger.error('[SubmissionService] Failed to send notification', err);
    });

    return submission;
  }

  private async sendNotification(submission: any, status: SubmissionStatus) {
    try {
      const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3000';
      const typeMap: Record<string, string> = {
        'APPROVED': 'SUBMISSION_APPROVED',
        'REJECTED': 'SUBMISSION_REJECTED',
        'ESCALATED': 'SUBMISSION_ESCALATED',
        'FINALIZED': 'SUBMISSION_APPROVED', // Admin final approval
      };

      const notificationType = typeMap[status];
      if (!notificationType) return;

      await fetch(`${notificationUrl}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: submission.engineerId,
          tenantId: submission.tenantId,
          channel: 'IN_APP', // And PUSH maybe? Let notification service handle it.
          type: notificationType,
          subject: `Submission ${status}`,
          body: `Your submission for form ${submission.formId} has been ${status.toLowerCase()}.`,
          metadata: { submissionId: submission.id }
        })
      });
      
      // Also send Push notification
      await fetch(`${notificationUrl}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: submission.engineerId,
          tenantId: submission.tenantId,
          channel: 'PUSH',
          type: notificationType,
          subject: `Submission ${status}`,
          body: `Your submission for form ${submission.formId} has been ${status.toLowerCase()}.`,
          metadata: { submissionId: submission.id }
        })
      });
    } catch (err) {
      logger.error('Error notifying user', err);
    }
  }
}
