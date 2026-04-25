/**
 * apps/web/app/admin/kyc/page.tsx
 * Admin KYC Queue — server component (Next.js App Router)
 * Displays paginated list of KYC submissions for the admin's tenant.
 */

import { cookies } from 'next/headers';
import Link from 'next/link';
import { KYCReviewCard } from '@/components/kyc/KYCReviewCard';
import { KYCStatusBadge } from '@/components/kyc/KYCStatusBadge';
import type { KYCListResponse, KYCStatus } from '@platform/types/kyc';
import '@/styles/kyc-theme.css';

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchSubmissions(
  status: string | undefined,
  page: number,
): Promise<KYCListResponse> {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value ?? '';

  const params = new URLSearchParams({ page: String(page), pageSize: '12' });
  if (status) params.set('status', status);

  const res = await fetch(
    `${process.env.KYC_SERVICE_URL}/kyc/submissions?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    },
  );

  if (!res.ok) throw new Error('Failed to load KYC submissions');
  return res.json();
}

// ─── Status filter tabs ───────────────────────────────────────────────────────

const STATUS_TABS: Array<{ label: string; value: string | undefined }> = [
  { label: 'All',           value: undefined        },
  { label: 'Pending',       value: 'PENDING'        },
  { label: 'Under Review',  value: 'UNDER_REVIEW'   },
  { label: 'Approved',      value: 'APPROVED'       },
  { label: 'Rejected',      value: 'REJECTED'       },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: { status?: string; page?: string };
}

export const metadata = {
  title: 'KYC Review Queue | Admin',
  description: 'Review and action pending KYC verification submissions from field engineers.',
};

export default async function AdminKYCPage({ searchParams }: PageProps) {
  const activeStatus = searchParams.status;
  const page = parseInt(searchParams.page ?? '1', 10);

  let data: KYCListResponse | null = null;
  let error: string | null = null;

  try {
    data = await fetchSubmissions(activeStatus, page);
  } catch {
    error = 'Could not load submissions. Please try again.';
  }

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div
      className="min-h-screen px-6 py-8"
      style={{ background: 'hsl(var(--kyc-bg))', color: 'hsl(var(--kyc-text))' }}
    >
      {/* ── Page header ── */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'hsl(var(--kyc-text))' }}>
          KYC Review Queue
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'hsl(var(--kyc-text-muted))' }}>
          Review and action identity verification submissions from field engineers.
        </p>
      </header>

      {/* ── Status filter tabs ── */}
      <nav
        className="flex gap-2 mb-6 overflow-x-auto pb-1"
        aria-label="Filter KYC submissions by status"
      >
        {STATUS_TABS.map((tab) => {
          const isActive = activeStatus === tab.value;
          const href = tab.value ? `/admin/kyc?status=${tab.value}` : '/admin/kyc';
          return (
            <Link
              key={tab.label}
              href={href}
              id={`tab-${tab.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
              style={{
                background: isActive ? 'hsl(var(--kyc-primary))' : 'hsl(var(--kyc-surface))',
                color: isActive ? 'hsl(var(--kyc-primary-fg))' : 'hsl(var(--kyc-text-muted))',
                border: `1px solid ${isActive ? 'transparent' : 'hsl(var(--kyc-border))'}`,
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* ── Error state ── */}
      {error && (
        <div
          className="rounded-lg px-4 py-3 mb-6 text-sm"
          style={{ background: 'hsl(var(--kyc-rejected-bg))', color: 'hsl(var(--kyc-rejected-fg))' }}
          role="alert"
        >
          {error}
        </div>
      )}

      {/* ── Summary row ── */}
      {data && (
        <p className="text-sm mb-4" style={{ color: 'hsl(var(--kyc-text-subtle))' }}>
          Showing {data.submissions.length} of {data.total} submissions
          {activeStatus && (
            <> · Filtered by <KYCStatusBadge status={activeStatus as KYCStatus} /></>
          )}
        </p>
      )}

      {/* ── Submissions grid ── */}
      {data && data.submissions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.submissions.map((submission) => (
            <KYCReviewCard key={submission.id} submission={submission} />
          ))}
        </div>
      ) : (
        !error && (
          <div
            className="kyc-card flex flex-col items-center justify-center py-20 text-center"
            style={{ color: 'hsl(var(--kyc-text-muted))' }}
          >
            <span className="text-4xl mb-3">📋</span>
            <p className="font-medium">No submissions found</p>
            <p className="text-sm mt-1" style={{ color: 'hsl(var(--kyc-text-subtle))' }}>
              {activeStatus ? 'Try a different status filter.' : 'No KYC submissions have been received yet.'}
            </p>
          </div>
        )
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <nav
          className="flex items-center justify-center gap-3 mt-10"
          aria-label="Pagination"
        >
          {page > 1 && (
            <Link
              href={`/admin/kyc?${activeStatus ? `status=${activeStatus}&` : ''}page=${page - 1}`}
              className="kyc-btn-primary text-sm"
            >
              ← Previous
            </Link>
          )}
          <span className="text-sm" style={{ color: 'hsl(var(--kyc-text-muted))' }}>
            Page {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/kyc?${activeStatus ? `status=${activeStatus}&` : ''}page=${page + 1}`}
              className="kyc-btn-primary text-sm"
            >
              Next →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
