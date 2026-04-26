import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL ?? 'http://localhost:4000';

export async function uploadPhotoAPI(photoData, caption = '') {
  const token = await AsyncStorage.getItem('authToken');

  const formData = new FormData();
  
  formData.append('photo', {
    uri: photoData.uri,
    type: photoData.type,
    name: photoData.name,
  });

  if (caption) {
    formData.append('caption', caption);
  }

  if (photoData.metadata) {
    formData.append('metadata', JSON.stringify(photoData.metadata));
  }

  try {
    const res = await fetch(`${BASE_URL}/photo/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
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
