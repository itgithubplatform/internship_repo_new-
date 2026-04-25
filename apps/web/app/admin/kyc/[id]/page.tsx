/**
 * apps/web/app/admin/kyc/[id]/page.tsx
 * Admin KYC Detail & Review — server component with approve / reject client actions
 */

import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { KYCSubmission } from '@platform/types/kyc';
import { KYCStatusBadge } from '@/components/kyc/KYCStatusBadge';
import { KYCActionPanel } from '@/components/kyc/KYCActionPanel';
import '@/styles/kyc-theme.css';

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchSubmission(id: string): Promise<KYCSubmission | null> {
  const token = cookies().get('token')?.value ?? '';
  const res = await fetch(`${process.env.KYC_SERVICE_URL}/kyc/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load submission');
  return res.json();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DOC_LABEL: Record<string, string> = {
  GOVERNMENT_ID:    'Government ID',
  PASSPORT:         'Passport',
  DRIVERS_LICENSE:  "Driver's Licence",
  PROOF_OF_ADDRESS: 'Proof of Address',
  SELFIE_PHOTOGRAPH:'Selfie Photograph',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `KYC Submission ${params.id} | Admin Review`,
    description: 'Review individual KYC submission details and approve or reject engineer verification.',
  };
}

export default async function KYCDetailPage({ params }: { params: { id: string } }) {
  const submission = await fetchSubmission(params.id);
  if (!submission) notFound();

  const submittedDate = new Date(submission.submittedAt).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const reviewedDate = submission.reviewedAt
    ? new Date(submission.reviewedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  const canReview = submission.status === 'PENDING' || submission.status === 'UNDER_REVIEW';

  return (
    <div
      className="min-h-screen px-6 py-8 max-w-4xl mx-auto"
      style={{ background: 'hsl(var(--kyc-bg))', color: 'hsl(var(--kyc-text))' }}
    >
      {/* ── Breadcrumb ── */}
      <nav className="mb-6 text-sm" style={{ color: 'hsl(var(--kyc-text-muted))' }}>
        <a href="/admin/kyc" className="hover:underline">KYC Queue</a>
        {' / '}
        <span style={{ color: 'hsl(var(--kyc-text))' }}>{submission.id}</span>
      </nav>

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">KYC Submission Review</h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(var(--kyc-text-muted))' }}>
            Engineer ID: <code className="font-mono">{submission.engineerId}</code>
          </p>
        </div>
        <KYCStatusBadge status={submission.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: metadata ── */}
        <section className="lg:col-span-2 flex flex-col gap-6">

          {/* Submission meta */}
          <div className="kyc-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: 'hsl(var(--kyc-text-subtle))' }}>
              Submission Details
            </h2>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt style={{ color: 'hsl(var(--kyc-text-muted))' }}>Submitted</dt>
              <dd>{submittedDate}</dd>

              <dt style={{ color: 'hsl(var(--kyc-text-muted))' }}>Tenant ID</dt>
              <dd><code className="font-mono text-xs">{submission.tenantId}</code></dd>

              {reviewedDate && (
                <>
                  <dt style={{ color: 'hsl(var(--kyc-text-muted))' }}>Reviewed</dt>
                  <dd>{reviewedDate}</dd>
                </>
              )}
              {submission.reviewedBy && (
                <>
                  <dt style={{ color: 'hsl(var(--kyc-text-muted))' }}>Reviewed by</dt>
                  <dd><code className="font-mono text-xs">{submission.reviewedBy}</code></dd>
                </>
              )}
            </dl>
          </div>

          {/* Documents */}
          <div className="kyc-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: 'hsl(var(--kyc-text-subtle))' }}>
              Uploaded Documents
            </h2>
            <ul className="flex flex-col gap-3">
              {submission.documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg px-4 py-3"
                  style={{ background: 'hsl(var(--kyc-surface-2))' }}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {DOC_LABEL[doc.type] ?? doc.type}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--kyc-text-muted))' }}>
                      {doc.fileName}
                    </p>
                  </div>
                  {/* Document download / view — resolves to separate endpoint */}
                  <a
                    href={`${process.env.NEXT_PUBLIC_KYC_SERVICE_URL}/kyc/document/${doc.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    id={`view-doc-${doc.id}`}
                    className="text-xs px-3 py-1.5 rounded font-medium"
                    style={{
                      background: 'hsl(var(--kyc-primary))',
                      color: 'hsl(var(--kyc-primary-fg))',
                    }}
                  >
                    View
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Rejection reason (read-only if already rejected) */}
          {submission.status === 'REJECTED' && submission.rejectionReason && (
            <div
              className="rounded-xl px-5 py-4 text-sm"
              style={{
                background: 'hsl(var(--kyc-rejected-bg))',
                color: 'hsl(var(--kyc-rejected-fg))',
                border: '1px solid hsl(var(--kyc-rejected))',
              }}
            >
              <p className="font-semibold mb-1">Rejection Reason</p>
              <p>{submission.rejectionReason}</p>
            </div>
          )}
        </section>

        {/* ── Right: action panel ── */}
        <aside>
          {canReview ? (
            <KYCActionPanel submissionId={submission.id} />
          ) : (
            <div
              className="kyc-card p-5 text-sm text-center"
              style={{ color: 'hsl(var(--kyc-text-muted))' }}
            >
              This submission has already been <strong>{submission.status.toLowerCase()}</strong>.
              No further actions available.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
