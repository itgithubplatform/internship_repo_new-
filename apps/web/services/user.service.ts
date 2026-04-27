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

export async function listUsers() {
  return request<any[]>('/users');
}

export async function createUser(userData: any) {
  return request<any>('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function deactivateUser(id: string) {
  return request<void>(`/users/${id}`, { method: 'DELETE' });
}
