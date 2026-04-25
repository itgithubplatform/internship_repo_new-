import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Switch } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { getFormDetails, submitForm } from '../../services/form.api';
import { saveDraft, getDrafts } from '../../store/drafts.store';

// ─── Theme tokens (mirrors UI) ────────────────────────────────────────────────
const T = {
  bg: '#090E1A', surface: '#111827', surface2: '#1E293B', border: '#2D3748',
  text: '#F8FAFC', textMuted: '#64748B', primary: '#7C3AED', primaryLight: '#A78BFA',
  success: '#10B981', danger: '#EF4444',
};

export default function FormFillScreen({ route, navigation }) {
  const { formId, draftId } = route.params;

  const [formDef, setFormDef] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState(draftId || `${formId}_${Date.now()}`);

  useEffect(() => {
    async function loadData() {
      // 1. Fetch form definition
      const res = await getFormDetails(formId);
      if (res.ok) {
        setFormDef(res.data);
      } else {
        Alert.alert('Error', 'Could not load form template.');
        navigation.goBack();
        return;
      }

      // 2. Load draft if exists
      if (draftId) {
        const drafts = await getDrafts();
        if (drafts[draftId]) {
          setFormData(drafts[draftId].data);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [formId, draftId]);

  // ─── Auto-save Draft ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!formDef) return;
    const timer = setTimeout(() => {
      saveDraft({
        id: activeDraftId,
        formId,
        title: formDef.title,
        data: formData,
        status: 'DRAFT',
      });
    }, 2000); // auto-save every 2s after typing stops
    return () => clearTimeout(timer);
  }, [formData, formDef, activeDraftId]);

  // ─── Client-side Validation ──────────────────────────────────────────────────
  const validateField = (field, value) => {
    if (field.isRequired && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'This field is required';
    }
    if (field.type === 'NUMBER' && value && isNaN(Number(value))) {
      return 'Must be a valid number';
    }
    // Zod schema could be executed here if using a JS validation lib
    return null;
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;
    formDef.fields.forEach((f) => {
      const error = validateField(f, formData[f.id]);
      if (error) {
        newErrors[f.id] = error;
        isValid = false;
      }
    });
    setErrors(newErrors);
    return isValid;
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateAll()) {
      Alert.alert('Validation Error', 'Please check the highlighted fields.');
      return;
    }

    setSaving(true);
    const state = await NetInfo.fetch();
    
    if (state.isConnected) {
      const res = await submitForm({ formId, data: formData });
      if (res.ok) {
        Alert.alert('Success', 'Form submitted successfully!');
        // clear draft
        saveDraft({ id: activeDraftId, status: 'SUBMITTED' }); // or delete
        navigation.goBack();
      } else {
        Alert.alert('Submission Failed', res.error);
      }
    } else {
      // Offline mode
      await saveDraft({
        id: activeDraftId,
        formId,
        title: formDef.title,
        data: formData,
        status: 'PENDING_SYNC', // Marked for offline sync
      });
      Alert.alert('Offline', 'Saved to drafts. Will sync when online.');
      navigation.goBack();
    }
    setSaving(false);
  };

  // ─── Renderers ───────────────────────────────────────────────────────────────
  const renderField = (field) => {
    const value = formData[field.id] ?? '';
    const hasError = !!errors[field.id];

    return (
      <View key={field.id} style={styles.fieldContainer}>
        <Text style={styles.label}>
          {field.label} {field.isRequired && <Text style={{ color: T.danger }}>*</Text>}
        </Text>
        
        {field.type === 'TEXT' || field.type === 'NUMBER' ? (
          <TextInput
            style={[styles.input, hasError && styles.inputError]}
            placeholder={field.placeholder}
            placeholderTextColor={T.textMuted}
            keyboardType={field.type === 'NUMBER' ? 'numeric' : 'default'}
            value={value}
            onChangeText={(text) => {
              setFormData({ ...formData, [field.id]: text });
              if (hasError) setErrors({ ...errors, [field.id]: null });
            }}
          />
        ) : field.type === 'TEXTAREA' ? (
          <TextInput
            style={[styles.input, styles.textarea, hasError && styles.inputError]}
            placeholder={field.placeholder}
            placeholderTextColor={T.textMuted}
            multiline
            numberOfLines={4}
            value={value}
            onChangeText={(text) => {
              setFormData({ ...formData, [field.id]: text });
              if (hasError) setErrors({ ...errors, [field.id]: null });
            }}
          />
        ) : field.type === 'CHECKBOX' ? (
          <View style={styles.switchRow}>
            <Text style={{ color: T.textMuted }}>{field.placeholder || 'Select'}</Text>
            <Switch
              value={!!value}
              onValueChange={(val) => setFormData({ ...formData, [field.id]: val })}
              trackColor={{ false: T.border, true: T.primary }}
              thumbColor={value ? '#fff' : '#f4f3f4'}
            />
          </View>
        ) : (
          <Text style={{ color: T.textMuted, fontSize: 12 }}>Unsupported field type: {field.type}</Text>
        )}

        {hasError && <Text style={styles.errorText}>{errors[field.id]}</Text>}
      </View>
    );
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator color={T.primary} size="large" /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{formDef.title}</Text>
      {formDef.description ? <Text style={styles.subtitle}>{formDef.description}</Text> : null}

      <View style={styles.formArea}>
        {formDef.fields.map(renderField)}
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Form</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.bg },
  content: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: '700', color: T.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: T.textMuted, marginBottom: 24 },
  formArea: { backgroundColor: T.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: T.border, marginBottom: 20 },
  fieldContainer: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: T.text, marginBottom: 8 },
  input: { backgroundColor: T.surface2, borderWidth: 1, borderColor: T.border, borderRadius: 8, padding: 12, color: T.text, fontSize: 15 },
  inputError: { borderColor: T.danger },
  textarea: { height: 100, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.surface2, padding: 12, borderRadius: 8 },
  errorText: { color: T.danger, fontSize: 12, marginTop: 4 },
  submitBtn: { backgroundColor: T.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
