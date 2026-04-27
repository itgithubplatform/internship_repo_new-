const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function getToken(): string {
  if (typeof document === 'undefined') return '';
  return document.cookie
    .split('; ')
    .find((r) => r.startsWith('token='))
    ?.split('=')[1] ?? '';
}

async function request<T>(path: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${GATEWAY_URL}${path}`, {
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

export async function listSubmissions(status?: string) {
  const path = status ? `/submissions?status=${status}` : '/submissions';
  return request<any[]>(path);
}

export async function getSubmission(id: string) {
  return request<any>(`/submissions/${id}`);
}

export async function submitForm(formId: string, submissionData: any) {
  return request<any>(`/submissions/${formId}/submit`, {
    method: 'POST',
    body: JSON.stringify(submissionData),
  });
}

export async function reviewSubmission(id: string, status: string, notes?: string) {
  return request<any>(`/submissions/${id}/review`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  });
}
