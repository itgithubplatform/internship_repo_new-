/**
 * apps/web/services/kyc.service.ts
 * Web-layer API calls to the KYC microservice.
 * Used by client components (action panels) and server actions.
 */

const KYC_API = process.env.NEXT_PUBLIC_KYC_SERVICE_URL ?? '';

function getToken(): string {
  if (typeof document === 'undefined') return '';
  return document.cookie
    .split('; ')
    .find((r) => r.startsWith('token='))
    ?.split('=')[1] ?? '';
}

// ─── Shared fetch helper ──────────────────────────────────────────────────────

async function kyc<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${KYC_API}/kyc${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
        ...(options.headers ?? {}),
      },
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, error: json.error ?? `HTTP ${res.status}` };
    }
    return { ok: true, data: json as T };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// ─── Engineer: submit KYC ─────────────────────────────────────────────────────

export async function submitKYC(payload: {
  documents: Array<{
    type: string;
    fileName: string;
    mimeType: string;
    base64Data: string;
  }>;
}) {
  return kyc<{ submissionId: string; status: string }>('/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ─── Engineer: get own status ─────────────────────────────────────────────────

export async function getMyKYCStatus() {
  return kyc<{
    status: string;
    submissionId?: string;
    rejectionReason?: string;
    reviewedAt?: string;
  }>('/me');
}

// ─── Admin: approve ───────────────────────────────────────────────────────────

export async function approveKYC(
  submissionId: string,
): Promise<{ ok: boolean; error?: string }> {
  const result = await kyc<unknown>(`/${submissionId}/approve`, { method: 'PUT' });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

// ─── Admin: reject ────────────────────────────────────────────────────────────

export async function rejectKYC(
  submissionId: string,
  rejectionReason: string,
): Promise<{ ok: boolean; error?: string }> {
  const result = await kyc<unknown>(`/${submissionId}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ rejectionReason }),
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

// ─── Admin: list submissions ──────────────────────────────────────────────────

export async function listKYCSubmissions(params: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.page) qs.set('page', String(params.page));
  if (params.pageSize) qs.set('pageSize', String(params.pageSize));
  return kyc<import('@platform/types/kyc').KYCListResponse>(`/submissions?${qs}`);
}
