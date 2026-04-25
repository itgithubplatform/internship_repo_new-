import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { getDrafts, deleteDraft, syncPendingDrafts } from '../../store/drafts.store';

const T = {
  bg: '#090E1A', surface: '#111827', surface2: '#1E293B', border: '#2D3748',
  text: '#F8FAFC', textMuted: '#64748B', primary: '#7C3AED', primaryLight: '#A78BFA',
  success: '#10B981', danger: '#EF4444', warning: '#F59E0B',
};

export default function DraftsScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadDrafts();
    }
  }, [isFocused]);

  const loadDrafts = async () => {
    setLoading(true);
    const stored = await getDrafts();
    const arr = Object.values(stored).sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    setDrafts(arr);
    setLoading(false);
  };

  const handleSync = async () => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      Alert.alert('Offline', 'You need an internet connection to sync.');
      return;
    }

    setSyncing(true);
    const { synced, failed } = await syncPendingDrafts();
    setSyncing(false);

    if (synced > 0 || failed > 0) {
      Alert.alert('Sync Complete', `Successfully synced: ${synced}\nFailed: ${failed}`);
      loadDrafts();
    } else {
      Alert.alert('No Sync Needed', 'All forms are up to date.');
    }
  };

  const handleResume = (draft) => {
    navigation.navigate('FormFill', { formId: draft.formId, draftId: draft.id });
  };

  const handleDelete = async (draftId) => {
    Alert.alert('Delete Draft', 'Are you sure you want to delete this draft?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteDraft(draftId);
          loadDrafts();
        } 
      }
    ]);
  };

  const renderItem = ({ item }) => {
    const isPending = item.status === 'PENDING_SYNC';
    const dateStr = new Date(item.savedAt).toLocaleString();

    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSub}>Saved: {dateStr}</Text>
          <View style={[styles.badge, { backgroundColor: isPending ? '#2D1A00' : T.surface }]}>
            <Text style={[styles.badgeText, { color: isPending ? T.warning : T.textMuted }]}>
              {isPending ? 'Pending Sync' : 'Draft'}
            </Text>
          </View>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleResume(item)} style={[styles.btn, styles.btnPrimary]}>
            <Text style={styles.btnText}>Resume</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.btn, styles.btnDanger]}>
            <Text style={styles.btnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator color={T.primary} size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Offline Drafts</Text>
          <Text style={styles.subtitle}>Resume unfinished forms or sync pending ones.</Text>
        </View>
        <TouchableOpacity style={styles.syncBtn} onPress={handleSync} disabled={syncing}>
          {syncing ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.syncBtnText}>Sync All</Text>}
        </TouchableOpacity>
      </View>

      <FlatList
        data={drafts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No drafts or pending forms.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.bg },
  header: { padding: 20, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: T.border },
  title: { fontSize: 22, fontWeight: '700', color: T.text },
  subtitle: { fontSize: 13, color: T.textMuted, marginTop: 4 },
  syncBtn: { backgroundColor: T.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  syncBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  listContent: { padding: 16 },
  card: { backgroundColor: T.surface2, padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: T.border },
  cardTitle: { fontSize: 16, fontWeight: '600', color: T.text },
  cardSub: { fontSize: 12, color: T.textMuted, marginTop: 4, marginBottom: 8 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: T.border },
  badgeText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  actions: { gap: 8 },
  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  btnPrimary: { backgroundColor: T.surface, borderWidth: 1, borderColor: T.primary },
  btnDanger: { backgroundColor: '#2D0606', borderWidth: 1, borderColor: T.danger },
  btnText: { color: T.text, fontSize: 12, fontWeight: '600' },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: T.textMuted },
});
