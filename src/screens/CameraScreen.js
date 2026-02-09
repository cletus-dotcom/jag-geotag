import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { saveGeoPhoto } from '../storage/geoStorage';
import { TARGET_ACCURACY_METERS, ACCURACY_WAIT_TIMEOUT_MS } from '../config/locationAccuracy';

// Fallback values in case import fails
const TARGET_ACCURACY = TARGET_ACCURACY_METERS ?? 5;
const ACCURACY_TIMEOUT = ACCURACY_WAIT_TIMEOUT_MS ?? 15000;

function formatDateTime(date) {
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium',
    hour12: false,
  });
}

function formatAccuracy(meters) {
  if (meters == null || typeof meters !== 'number') return '—';
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${Math.round(meters)} m`;
}

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();
  const [lastPhoto, setLastPhoto] = useState(null);
  const [lastGeo, setLastGeo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const cameraRef = useRef(null);

  const requestAllPermissions = useCallback(async () => {
    if (!permission?.granted) await requestPermission();
    if (!locationPermission?.granted) await requestLocationPermission();
  }, [permission, requestPermission, locationPermission, requestLocationPermission]);

  const getCurrentLocation = useCallback(async () => {
    const hasServices = await Location.hasServicesEnabledAsync();
    if (!hasServices) {
      throw new Error('Location services are disabled. Enable them in device settings.');
    }
    if (Platform.OS === 'android') {
      try {
        await Location.enableNetworkProviderAsync();
      } catch (_) {
        // Ignore if network provider can't be enabled
      }
    }
    const options = {
      accuracy: Location.Accuracy.BestForNavigation,
      mayShowUserSettings: true,
    };
    const deadline = Date.now() + ACCURACY_TIMEOUT;
    let best = await Location.getCurrentPositionAsync(options);
    let attempts = 0;
    const maxAttempts = 10; // Prevent infinite loops
    
    while (
      best?.coords?.accuracy != null &&
      best.coords.accuracy > TARGET_ACCURACY &&
      Date.now() < deadline &&
      attempts < maxAttempts
    ) {
      attempts++;
      await new Promise((r) => setTimeout(r, 800));
      try {
        const next = await Location.getCurrentPositionAsync(options);
        if (next?.coords?.accuracy != null && (best?.coords?.accuracy == null || next.coords.accuracy < best.coords.accuracy)) {
          best = next;
        }
      } catch (err) {
        // If location request fails during retry, use the best we have
        break;
      }
    }
    return best;
  }, []);

  const takePicture = useCallback(async () => {
    setError(null);
    if (!cameraRef.current || !permission?.granted) {
      if (!permission?.granted) {
        await requestPermission();
      }
      return;
    }
    if (!locationPermission?.granted) {
      const { status } = await requestLocationPermission();
      if (status !== 'granted') {
        setError('Location permission is required to geo-tag photos.');
        return;
      }
    }

    setSaving(true);
    try {
      const location = await getCurrentLocation();
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        exif: true,
      });
      if (!photo?.uri) {
        throw new Error('Failed to capture photo');
      }

      const now = new Date();
      const meta = {
        dateTime: now.toISOString(),
        dateTimeDisplay: formatDateTime(now),
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy ?? null,
      };

      await saveGeoPhoto(photo.uri, meta);
      setLastPhoto(photo.uri);
      setLastGeo(meta);
    } catch (e) {
      const msg = e?.message || 'Could not capture photo or location';
      setError(msg);
      if (Platform.OS !== 'web') {
        Alert.alert('Error', msg);
      }
    } finally {
      setSaving(false);
    }
  }, [
    permission,
    locationPermission,
    requestPermission,
    requestLocationPermission,
    getCurrentLocation,
  ]);

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Camera access is needed to take geo-tagged photos.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestAllPermissions}>
          <Text style={styles.primaryButtonText}>Grant camera access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      <View style={styles.controls}>
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.captureButton, saving && styles.captureButtonDisabled]}
          onPress={takePicture}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.captureButtonInner} />
          )}
        </TouchableOpacity>
      </View>

      {lastPhoto && lastGeo && (
        <View style={styles.resultPanel}>
          <Text style={styles.resultTitle}>Last photo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbScroll}>
            <Image source={{ uri: lastPhoto }} style={styles.thumbnail} />
          </ScrollView>
          <View style={styles.geoInfo}>
            <Text style={styles.geoLabel}>Date & time</Text>
            <Text style={styles.geoValue}>{lastGeo.dateTimeDisplay}</Text>
            <Text style={styles.geoLabel}>Latitude</Text>
            <Text style={styles.geoValue}>{lastGeo.latitude?.toFixed(6) ?? '—'}</Text>
            <Text style={styles.geoLabel}>Longitude</Text>
            <Text style={styles.geoValue}>{lastGeo.longitude?.toFixed(6) ?? '—'}</Text>
            <Text style={styles.geoLabel}>Accuracy</Text>
            <Text style={styles.geoValue}>{formatAccuracy(lastGeo.accuracy)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0f0f1a',
  },
  message: {
    color: '#e2e8f0',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#0f0f1a',
    fontWeight: '700',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  errorBanner: {
    backgroundColor: 'rgba(248,113,113,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'stretch',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    textAlign: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  resultPanel: {
    position: 'absolute',
    top: 56,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(26,26,46,0.95)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#16213e',
  },
  resultTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  thumbScroll: {
    marginBottom: 8,
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  geoInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  geoLabel: {
    width: '100%',
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
  },
  geoValue: {
    width: '100%',
    color: '#e2e8f0',
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
});
