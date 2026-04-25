import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL ?? 'http://localhost:4000';

async function apiFetch(service, path, options = {}) {
  const token = await AsyncStorage.getItem('authToken');

  try {
    const res = await fetch(`${BASE_URL}/${service}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, error: json.error ?? `HTTP ${res.status}` };
    }
    return { ok: true, data: json };
  } catch (err) {
    return { ok: false, error: err.message ?? 'Network error' };
  }
}

// ─── Forms API ───────────────────────────────────────────────────────────────

export async function getForms() {
  return apiFetch('form', '?active=true', { method: 'GET' });
}

export async function getFormDetails(formId) {
  return apiFetch('form', `/${formId}`, { method: 'GET' });
}

// ─── Submissions API ─────────────────────────────────────────────────────────

export async function submitForm(payload) {
  return apiFetch('submission', '/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
