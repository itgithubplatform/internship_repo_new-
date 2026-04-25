import Link from 'next/link';
import type { KYCSubmission } from '@platform/types/kyc';
import { KYCStatusBadge } from './KYCStatusBadge';

interface KYCReviewCardProps {
  submission: KYCSubmission;
}

export function KYCReviewCard({ submission }: KYCReviewCardProps) {
  const submittedDate = new Date(submission.submittedAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article
      className="kyc-card p-5 flex flex-col gap-3"
      aria-label={`KYC submission from engineer ${submission.engineerId}`}
    >
      {/* ── Header row ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className="text-sm font-mono"
            style={{ color: 'hsl(var(--kyc-text-muted))' }}
          >
            ID: {submission.id}
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ color: 'hsl(var(--kyc-text-subtle))' }}
          >
            Submitted {submittedDate}
          </p>
        </div>
        <KYCStatusBadge status={submission.status} />
      </div>

      {/* ── Document list ── */}
      <ul className="flex flex-wrap gap-2">
        {submission.documents.map((doc) => (
          <li
            key={doc.id}
            className="text-xs px-2 py-1 rounded"
            style={{
              background: 'hsl(var(--kyc-surface-2))',
              color: 'hsl(var(--kyc-text-muted))',
            }}
          >
            {doc.type.replace(/_/g, ' ')}
          </li>
        ))}
      </ul>

      {/* ── Rejection reason ── */}
      {submission.status === 'REJECTED' && submission.rejectionReason && (
        <p
          className="text-sm rounded px-3 py-2"
          style={{
            background: 'hsl(var(--kyc-rejected-bg))',
            color: 'hsl(var(--kyc-rejected-fg))',
            borderLeft: '3px solid hsl(var(--kyc-rejected))',
          }}
        >
          <strong>Rejection reason:</strong> {submission.rejectionReason}
        </p>
      )}

      {/* ── Action ── */}
      {(submission.status === 'PENDING' || submission.status === 'UNDER_REVIEW') && (
        <div className="flex justify-end mt-1">
          <Link
            href={`/admin/kyc/${submission.id}`}
            className="kyc-btn-primary text-sm"
            id={`review-btn-${submission.id}`}
          >
            Review →
          </Link>
        </div>
      )}
    </article>
  );
}
