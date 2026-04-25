/**
 * apps/mobile/src/services/kyc.api.js
 * Mobile KYC API calls — wires to the kyc-service via the API Gateway.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL ?? 'http://localhost:4000';

// ─── Shared fetch helper ──────────────────────────────────────────────────────

async function kycFetch(path, options = {}) {
  const token = await AsyncStorage.getItem('authToken');

  try {
    const res = await fetch(`${BASE_URL}/kyc${path}`, {
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

// ─── Engineer: get own KYC status ────────────────────────────────────────────
/**
 * Returns: { ok, data: { status, submissionId?, rejectionReason?, reviewedAt? } }
 * status values: NOT_SUBMITTED | PENDING | UNDER_REVIEW | APPROVED | REJECTED
 */
export async function getMyKYCStatus() {
  return kycFetch('/me', { method: 'GET' });
}

// ─── Engineer: submit KYC documents ──────────────────────────────────────────
/**
 * @param {{ documents: Array<{ type, fileName, mimeType, base64Data }> }} payload
 */
export async function submitKYC(payload) {
  return kycFetch('/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ─── Engineer: poll status (for optimistic UI refresh) ────────────────────────
export async function pollKYCStatus(engineerId) {
  return kycFetch(`/status/${engineerId}`, { method: 'GET' });
}
