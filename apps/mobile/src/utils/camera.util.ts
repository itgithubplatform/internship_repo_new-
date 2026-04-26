import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Location from 'expo-location';

/**
 * Capture a photo from camera, compress it to < 2MB, and attach GPS location.
 */
export async function capturePhotoWithMetadata() {
  // 1. Request Permissions
  const camPerm = await ImagePicker.requestCameraPermissionsAsync();
  if (!camPerm.granted) {
    throw new Error('Camera permission is required');
  }

  const locPerm = await Location.requestForegroundPermissionsAsync();
  
  // 2. Capture Photo
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false, // Don't crop, keep original data
    quality: 0.8, // Initial compression
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  let uri = asset.uri;

  // 3. Ensure file size is < 2MB
  // A typical 12MP phone camera JPEG is ~3-5MB. 
  // Resizing to max 1920px width/height and 0.7 quality usually brings it under 2MB.
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1920 } }], // Compress resolution safely
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  
  uri = manipResult.uri;

  // 4. Get GPS if permitted
  let location = null;
  if (locPerm.granted) {
    try {
      location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
    } catch (err) {
      console.warn('Could not fetch GPS location', err);
    }
  }

  return {
    uri,
    type: 'image/jpeg',
    name: `photo_${Date.now()}.jpg`,
    metadata: {
      timestamp: new Date().toISOString(),
      gps: location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      } : null,
    }
  };
}
