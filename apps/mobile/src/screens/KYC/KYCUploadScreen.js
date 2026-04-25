/**
 * apps/mobile/src/screens/KYC/KYCUploadScreen.js
 *
 * Engineer KYC submission screen.
 * Flow:
 *   1. Show current KYC status (fetched on mount)
 *   2. If NOT_SUBMITTED or REJECTED → show upload form
 *   3. Collect document type + pick from camera/library
 *   4. Convert to base64 and submit to KYC service via submitKYC()
 *   5. Show success / pending state
 *
 * Theme: matches the platform's Violet/Slate palette
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { submitKYC, getMyKYCStatus } from '../../services/kyc.api';

// ─── Theme tokens (mirrors kyc-theme.css) ─────────────────────────────────────
const T = {
  bg:           '#090E1A',
  surface:      '#111827',
  surface2:     '#1E293B',
  border:       '#2D3748',
  text:         '#F8FAFC',
  textMuted:    '#64748B',
  primary:      '#7C3AED',
  primaryLight: '#A78BFA',
  success:      '#10B981',
  successBg:    '#022C22',
  warning:      '#F59E0B',
  warningBg:    '#2D1A00',
  danger:       '#EF4444',
  dangerBg:     '#2D0606',
};

// ─── Supported document types ─────────────────────────────────────────────────
const DOC_TYPES = [
  { value: 'GOVERNMENT_ID',    label: 'Government ID' },
  { value: 'PASSPORT',         label: 'Passport' },
  { value: 'DRIVERS_LICENSE',  label: "Driver's Licence" },
  { value: 'PROOF_OF_ADDRESS', label: 'Proof of Address' },
  { value: 'SELFIE_PHOTOGRAPH',label: 'Selfie Photograph' },
];

// ─── Status Banner ────────────────────────────────────────────────────────────
function StatusBanner({ status, rejectionReason }) {
  if (!status || status === 'NOT_SUBMITTED') return null;

  const configs = {
    PENDING:      { bg: T.warningBg,  color: T.warning,  icon: '⏳', label: 'Pending Review' },
    UNDER_REVIEW: { bg: '#0C1A2E',    color: '#38BDF8',  icon: '🔍', label: 'Under Review' },
    APPROVED:     { bg: T.successBg,  color: T.success,  icon: '✅', label: 'Approved' },
    REJECTED:     { bg: T.dangerBg,   color: T.danger,   icon: '❌', label: 'Rejected' },
  };

  const c = configs[status] ?? configs.PENDING;

  return (
    <View style={[styles.statusBanner, { backgroundColor: c.bg, borderColor: c.color }]}>
      <Text style={[styles.statusIcon]}>{c.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.statusLabel, { color: c.color }]}>{c.label}</Text>
        {status === 'REJECTED' && rejectionReason ? (
          <Text style={[styles.statusSub, { color: T.textMuted }]}>
            Reason: {rejectionReason}
          </Text>
        ) : null}
        {status === 'PENDING' || status === 'UNDER_REVIEW' ? (
          <Text style={[styles.statusSub, { color: T.textMuted }]}>
            An admin will review your documents shortly.
          </Text>
        ) : null}
        {status === 'APPROVED' ? (
          <Text style={[styles.statusSub, { color: T.textMuted }]}>
            Your identity has been verified. Full platform access granted.
          </Text>
        ) : null}
      </View>
    </View>
  );
}

// ─── Document Row ─────────────────────────────────────────────────────────────
function DocumentRow({ doc, onRemove }) {
  return (
    <View style={styles.docRow}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.docType, { color: T.primaryLight }]}>{doc.label}</Text>
        <Text style={[styles.docName, { color: T.textMuted }]} numberOfLines={1}>
          {doc.fileName}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onRemove}
        style={styles.docRemoveBtn}
        accessibilityLabel={`Remove ${doc.label}`}
      >
        <Text style={{ color: T.danger, fontSize: 18 }}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function KYCUploadScreen({ navigation }) {
  const [kycStatus, setKycStatus]             = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [documents, setDocuments]             = useState([]);
  const [selectedType, setSelectedType]       = useState(DOC_TYPES[0].value);
  const [loading, setLoading]                 = useState(true);
  const [submitting, setSubmitting]           = useState(false);

  // ── Load current KYC status on mount ──────────────────────────────────────
  useEffect(() => {
    (async () => {
      const result = await getMyKYCStatus();
      if (result.ok) {
        setKycStatus(result.data.status);
        setRejectionReason(result.data.rejectionReason ?? null);
      }
      setLoading(false);
    })();
  }, []);

  const canSubmit = kycStatus === 'NOT_SUBMITTED' || kycStatus === 'REJECTED' || kycStatus === null;

  // ── Pick document from library or camera ───────────────────────────────────
  const pickDocument = useCallback(async (source) => {
    let result;
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is needed to capture documents.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        base64: true,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        base64: true,
      });
    }

    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      const alreadyAdded = documents.some((d) => d.type === selectedType);
      if (alreadyAdded) {
        Alert.alert('Already Added', 'You have already attached a document of this type.');
        return;
      }
      const label = DOC_TYPES.find((d) => d.value === selectedType)?.label ?? selectedType;
      setDocuments((prev) => [
        ...prev,
        {
          type: selectedType,
          label,
          fileName: asset.fileName ?? `${selectedType.toLowerCase()}.jpg`,
          mimeType: asset.mimeType ?? 'image/jpeg',
          base64Data: asset.base64 ?? '',
        },
      ]);
    }
  }, [documents, selectedType]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (documents.length < 2) {
      Alert.alert('Insufficient Documents', 'Please attach at least 2 documents.');
      return;
    }
    setSubmitting(true);
    const result = await submitKYC({ documents });
    setSubmitting(false);
    if (result.ok) {
      setKycStatus('PENDING');
      setDocuments([]);
    } else {
      Alert.alert('Submission Failed', result.error ?? 'Please try again.');
    }
  }, [documents]);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={T.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>Identity Verification</Text>
        <Text style={styles.subtitle}>
          Upload your documents to verify your identity and unlock full platform access.
        </Text>
      </View>

      {/* ── Status banner ── */}
      <StatusBanner status={kycStatus} rejectionReason={rejectionReason} />

      {/* ── Upload form — only if not approved / not pending ── */}
      {canSubmit && (
        <>
          {/* Document type selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Select Document Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.typeRow}>
                {DOC_TYPES.map((dt) => {
                  const isSelected = selectedType === dt.value;
                  const alreadyAdded = documents.some((d) => d.type === dt.value);
                  return (
                    <TouchableOpacity
                      key={dt.value}
                      onPress={() => setSelectedType(dt.value)}
                      style={[
                        styles.typeChip,
                        isSelected && styles.typeChipSelected,
                        alreadyAdded && styles.typeChipDone,
                      ]}
                      accessibilityLabel={`Select ${dt.label}`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      {alreadyAdded && <Text style={{ color: T.success, fontSize: 10 }}>✓ </Text>}
                      <Text style={[
                        styles.typeChipText,
                        isSelected && { color: T.text },
                        alreadyAdded && { color: T.success },
                      ]}>
                        {dt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Source buttons */}
          <View style={styles.sourceRow}>
            <TouchableOpacity
              style={[styles.sourceBtn, { borderColor: T.primary }]}
              onPress={() => pickDocument('camera')}
              accessibilityLabel="Take Photo"
            >
              <Text style={styles.sourceBtnIcon}>📷</Text>
              <Text style={[styles.sourceBtnText, { color: T.primaryLight }]}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sourceBtn, { borderColor: T.border }]}
              onPress={() => pickDocument('library')}
              accessibilityLabel="Choose from Library"
            >
              <Text style={styles.sourceBtnIcon}>🖼️</Text>
              <Text style={[styles.sourceBtnText, { color: T.textMuted }]}>Library</Text>
            </TouchableOpacity>
          </View>

          {/* Attached documents list */}
          {documents.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Attached Documents ({documents.length})</Text>
              {documents.map((doc, i) => (
                <DocumentRow
                  key={doc.type}
                  doc={doc}
                  onRemove={() => setDocuments((prev) => prev.filter((_, idx) => idx !== i))}
                />
              ))}
            </View>
          )}

          {/* Submit button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              (submitting || documents.length < 2) && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting || documents.length < 2}
            accessibilityLabel="Submit KYC documents"
          >
            {submitting ? (
              <ActivityIndicator color={T.text} />
            ) : (
              <Text style={styles.submitBtnText}>
                Submit Verification ({documents.length}/2 min)
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.hint}>
            Minimum 2 documents required. Accepted formats: JPG, PNG, PDF.
          </Text>
        </>
      )}

      {/* Approved full-access CTA */}
      {kycStatus === 'APPROVED' && (
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={() => navigation.navigate('Home')}
          accessibilityLabel="Go to Dashboard"
        >
          <Text style={styles.submitBtnText}>Go to Dashboard →</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: T.bg },
  centered:   { justifyContent: 'center', alignItems: 'center' },
  content:    { padding: 20, paddingBottom: 60 },

  header:     { marginBottom: 24 },
  title:      { fontSize: 26, fontWeight: '700', color: T.text, marginBottom: 6 },
  subtitle:   { fontSize: 14, color: T.textMuted, lineHeight: 20 },

  statusBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  statusIcon:  { fontSize: 22, marginTop: 2 },
  statusLabel: { fontSize: 15, fontWeight: '700' },
  statusSub:   { fontSize: 13, marginTop: 4, lineHeight: 18 },

  section:      { marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: T.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },

  typeRow:          { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  typeChip:         { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: T.border, flexDirection: 'row', alignItems: 'center' },
  typeChipSelected: { borderColor: T.primary, backgroundColor: '#2E0E60' },
  typeChipDone:     { borderColor: T.success },
  typeChipText:     { fontSize: 13, color: T.textMuted, fontWeight: '500' },

  sourceRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  sourceBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: T.surface,
    gap: 6,
  },
  sourceBtnIcon: { fontSize: 28 },
  sourceBtnText: { fontSize: 13, fontWeight: '600' },

  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: T.surface2,
    borderRadius: 10,
    marginBottom: 8,
  },
  docType:      { fontSize: 13, fontWeight: '600' },
  docName:      { fontSize: 11, marginTop: 2 },
  docRemoveBtn: { padding: 8 },

  submitBtn:         { backgroundColor: T.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText:     { color: T.text, fontSize: 16, fontWeight: '700' },

  hint: { textAlign: 'center', color: T.textMuted, fontSize: 12, marginTop: 12, lineHeight: 18 },
});
