import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFTS_KEY = '@platform_drafts';

/**
 * Draft structure:
 * {
 *   [formId_timestamp]: {
 *     id: string (local draft id),
 *     formId: string,
 *     title: string,
 *     data: object,
 *     savedAt: ISO string,
 *     status: 'DRAFT' | 'PENDING_SYNC'
 *   }
 * }
 */

export async function getDrafts() {
  const json = await AsyncStorage.getItem(DRAFTS_KEY);
  return json ? JSON.parse(json) : {};
}

export async function saveDraft(draft) {
  const drafts = await getDrafts();
  drafts[draft.id] = { ...draft, savedAt: new Date().toISOString() };
  await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

export async function deleteDraft(draftId) {
  const drafts = await getDrafts();
  delete drafts[draftId];
  await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

export async function clearAllDrafts() {
  await AsyncStorage.removeItem(DRAFTS_KEY);
}

// ─── Sync logic ──────────────────────────────────────────────────────────────
import { submitForm } from '../services/form.api';
import NetInfo from '@react-native-community/netinfo';

export async function syncPendingDrafts() {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return { synced: 0, failed: 0 };

  const drafts = await getDrafts();
  const pendingIds = Object.keys(drafts).filter(id => drafts[id].status === 'PENDING_SYNC');
  
  let synced = 0;
  let failed = 0;

  for (const id of pendingIds) {
    const draft = drafts[id];
    const res = await submitForm({ formId: draft.formId, data: draft.data });
    if (res.ok) {
      await deleteDraft(id);
      synced++;
    } else {
      failed++;
    }
  }

  return { synced, failed };
}
