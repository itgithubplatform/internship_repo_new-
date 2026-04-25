import type { KYCStatus } from '@platform/types/kyc';

// ─── Status metadata map ──────────────────────────────────────────────────────
const STATUS_META: Record<
  KYCStatus | 'NOT_SUBMITTED',
  { label: string; cssClass: string; dot: string }
> = {
  NOT_SUBMITTED: { label: 'Not Submitted',  cssClass: 'kyc-badge--review',   dot: '○' },
  PENDING:       { label: 'Pending Review', cssClass: 'kyc-badge--pending',  dot: '●' },
  UNDER_REVIEW:  { label: 'Under Review',   cssClass: 'kyc-badge--review',   dot: '●' },
  APPROVED:      { label: 'Approved',       cssClass: 'kyc-badge--approved', dot: '✓' },
  REJECTED:      { label: 'Rejected',       cssClass: 'kyc-badge--rejected', dot: '✕' },
};

interface KYCStatusBadgeProps {
  status: KYCStatus | 'NOT_SUBMITTED';
}

export function KYCStatusBadge({ status }: KYCStatusBadgeProps) {
  const meta = STATUS_META[status] ?? STATUS_META.NOT_SUBMITTED;
  return (
    <span className={`kyc-badge ${meta.cssClass}`}>
      <span aria-hidden="true">{meta.dot}</span>
      {meta.label}
    </span>
  );
}
