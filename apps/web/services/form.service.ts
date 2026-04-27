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

export async function listForms() {
  return request<any[]>('/forms');
}

export async function getForm(id: string) {
  return request<any>(`/forms/${id}`);
}

export async function createForm(formData: any) {
  return request<any>('/forms', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
}
