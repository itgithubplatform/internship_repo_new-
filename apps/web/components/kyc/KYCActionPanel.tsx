'use client';

/**
 * KYCActionPanel — client component
 * Approve / Reject form wired to the admin API service layer.
 * Lives in the detail page right column.
 */

import { useState, useTransition } from 'react';
import { approveKYC, rejectKYC } from '@/services/kyc.service';

interface Props {
  submissionId: string;
}

export function KYCActionPanel({ submissionId }: Props) {
  const [mode, setMode] = useState<'idle' | 'reject'>('idle');
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      const result = await approveKYC(submissionId);
      if (result.ok) {
        setFeedback({ type: 'success', msg: 'KYC submission approved successfully.' });
      } else {
        setFeedback({ type: 'error', msg: result.error ?? 'Failed to approve submission.' });
      }
    });
  }

  function handleReject() {
    if (reason.trim().length < 10) {
      setFeedback({ type: 'error', msg: 'Please provide a rejection reason (min 10 characters).' });
      return;
    }
    startTransition(async () => {
      const result = await rejectKYC(submissionId, reason.trim());
      if (result.ok) {
        setFeedback({ type: 'success', msg: 'KYC submission rejected with reason recorded.' });
        setMode('idle');
      } else {
        setFeedback({ type: 'error', msg: result.error ?? 'Failed to reject submission.' });
      }
    });
  }

  return (
    <div
      className="kyc-card p-5 flex flex-col gap-4"
      aria-label="KYC review actions"
    >
      <h2
        className="text-sm font-semibold uppercase tracking-wider"
        style={{ color: 'hsl(var(--kyc-text-subtle))' }}
      >
        Review Actions
      </h2>

      {/* Feedback banner */}
      {feedback && (
        <div
          className="rounded-lg px-3 py-2 text-sm"
          role="alert"
          style={{
            background: `hsl(var(${feedback.type === 'success' ? '--kyc-approved-bg' : '--kyc-rejected-bg'}))`,
            color: `hsl(var(${feedback.type === 'success' ? '--kyc-approved-fg' : '--kyc-rejected-fg'}))`,
          }}
        >
          {feedback.msg}
        </div>
      )}

      {/* Approve button */}
      {mode === 'idle' && !feedback && (
        <>
          <button
            id={`approve-btn-${submissionId}`}
            className="kyc-btn-primary w-full"
            onClick={handleApprove}
            disabled={isPending}
          >
            {isPending ? 'Processing…' : '✓ Approve KYC'}
          </button>

          <button
            id={`reject-btn-${submissionId}`}
            className="kyc-btn-danger w-full"
            onClick={() => setMode('reject')}
            disabled={isPending}
          >
            ✕ Reject KYC
          </button>
        </>
      )}

      {/* Reject form */}
      {mode === 'reject' && !feedback && (
        <div className="flex flex-col gap-3">
          <label
            htmlFor={`rejection-reason-${submissionId}`}
            className="text-sm font-medium"
            style={{ color: 'hsl(var(--kyc-text-muted))' }}
          >
            Rejection Reason <span style={{ color: 'hsl(var(--kyc-rejected))' }}>*</span>
          </label>
          <textarea
            id={`rejection-reason-${submissionId}`}
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain clearly why this KYC submission is being rejected…"
            className="w-full rounded-lg px-3 py-2 text-sm resize-none"
            style={{
              background: 'hsl(var(--kyc-surface-2))',
              border: '1px solid hsl(var(--kyc-border))',
              color: 'hsl(var(--kyc-text))',
              outline: 'none',
            }}
          />
          <div className="flex gap-2">
            <button
              id={`confirm-reject-btn-${submissionId}`}
              className="kyc-btn-danger flex-1"
              onClick={handleReject}
              disabled={isPending}
            >
              {isPending ? 'Sending…' : 'Confirm Reject'}
            </button>
            <button
              id={`cancel-reject-btn-${submissionId}`}
              className="flex-1 rounded-lg py-2 text-sm font-medium"
              onClick={() => { setMode('idle'); setReason(''); setFeedback(null); }}
              disabled={isPending}
              style={{
                background: 'hsl(var(--kyc-surface-2))',
                color: 'hsl(var(--kyc-text-muted))',
                border: '1px solid hsl(var(--kyc-border))',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Post-action link */}
      {feedback?.type === 'success' && (
        <a
          href="/admin/kyc"
          className="text-center text-sm underline"
          style={{ color: 'hsl(var(--kyc-text-muted))' }}
        >
          ← Back to queue
        </a>
      )}
    </div>
  );
}
