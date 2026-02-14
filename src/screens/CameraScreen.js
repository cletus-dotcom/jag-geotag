import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  Modal,
  Pressable,
  Linking,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as ImageManipulator from 'expo-image-manipulator';
import RNPhotoManipulator, { MimeType } from 'react-native-photo-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import { saveGeoPhoto } from '../storage/geoStorage';
import { createKmzFromPhoto } from '../utils/createKmz';
import { TARGET_ACCURACY_METERS, ACCURACY_WAIT_TIMEOUT_MS } from '../config/locationAccuracy';
import { buildRenewalGatewayUrl, buildFirstInstallGatewayUrl } from '../config/subscriptionGateway';
import { checkSubscriptionStatus, isSubscriptionApproved, getSubscriptionInfo, approveSubscription, approveSubscriptionWithQRCode } from '../services/subscriptionService';
import { isSerialKeyValid, getSerialKeyInfo } from '../services/serialKeyService';
import QRScannerScreen from './QRScannerScreen';
import SerialKeyScreen from './SerialKeyScreen';

const LOGO_SOURCE = require('../jagna_logo.png');
const LOGO_OVERLAY_SIZE = 300; // Size for saved photo overlay
const TEXT_MARGIN = 16;
const LINE_HEIGHT = 76;
const TEXT_SIZE = 60;

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
  const [savingToPhone, setSavingToPhone] = useState(false);
  const [savingKmz, setSavingKmz] = useState(false);
  const [error, setError] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [facing, setFacing] = useState('back');
  const [subscriptionApproved, setSubscriptionApproved] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [serialKeyValid, setSerialKeyValid] = useState(false);
  const [checkingSerialKey, setCheckingSerialKey] = useState(true);
  const [showSerialKeyScreen, setShowSerialKeyScreen] = useState(false);
  const cameraRef = useRef(null);

  const saveLastPhotoToPhone = useCallback(async () => {
    if (!lastPhoto) return;
    setSavingToPhone(true);
    try {
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Permission required', 'Allow Photos/Gallery permission to save the image to your phone.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(lastPhoto);
      Alert.alert('Saved', 'Photo saved to your phone Photos/Gallery.');
    } catch (e) {
      Alert.alert('Save failed', e?.message || 'Could not save photo to your phone.');
    } finally {
      setSavingToPhone(false);
    }
  }, [lastPhoto]);

  const saveLastPhotoAsKmz = useCallback(async () => {
    if (!lastPhoto || !lastGeo) return;
    if (lastGeo.latitude == null || lastGeo.longitude == null) {
      Alert.alert('No coordinates', 'This photo has no location data; cannot create KMZ.');
      return;
    }
    setSavingKmz(true);
    try {
      const kmzUri = await createKmzFromPhoto(lastPhoto, lastGeo);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(kmzUri, {
          mimeType: 'application/vnd.google-earth.kmz',
          dialogTitle: 'Save as KMZ (open in Google Earth)',
        });
      } else {
        Alert.alert('Saved', 'KMZ file created. Sharing is not available on this device.');
      }
    } catch (e) {
      Alert.alert('KMZ failed', e?.message || 'Could not create KMZ file.');
    } finally {
      setSavingKmz(false);
    }
  }, [lastPhoto, lastGeo]);

  // Check serial key status on mount
  useEffect(() => {
    const checkSerialKey = async () => {
      setCheckingSerialKey(true);
      try {
        const isValid = await isSerialKeyValid();
        setSerialKeyValid(isValid);
        
        if (!isValid) {
          // Show serial key screen if not valid
          setShowSerialKeyScreen(true);
        }
      } catch (err) {
        console.error('Error checking serial key:', err);
        // Block app if serial key check fails (security requirement)
        setSerialKeyValid(false);
        setShowSerialKeyScreen(true);
      } finally {
        setCheckingSerialKey(false);
      }
    };
    
    checkSerialKey();
  }, []);

  // Check subscription status on mount and when app comes to foreground
  useEffect(() => {
    const checkSubscription = async () => {
      // Don't check subscription if serial key is not valid
      if (!serialKeyValid) return;
      
      setCheckingSubscription(true);
      try {
        const status = await checkSubscriptionStatus();
        const info = await getSubscriptionInfo();
        setSubscriptionApproved(status.approved);
        setSubscriptionInfo(info);
        
        if (!status.approved) {
          Alert.alert(
            'Subscription Required',
            `Your subscription has ${info.daysRemaining > 0 ? `expired` : 'expired'}. Contact your administrator for a QR code to activate, or use Manual Approval if you have been approved.`,
            [
              { text: 'Check Status', onPress: () => checkSubscription() },
              { text: 'OK' }
            ]
          );
        }
      } catch (err) {
        console.error('Error checking subscription:', err);
        // Allow app to function if subscription check fails (graceful degradation)
        setSubscriptionApproved(true);
      } finally {
        setCheckingSubscription(false);
      }
    };
    
    if (serialKeyValid) {
      checkSubscription();
      
      // Check subscription every time app comes to foreground
      const interval = setInterval(checkSubscription, 60000); // Check every minute
      
      return () => clearInterval(interval);
    }
  }, [serialKeyValid]);

  const handleQRScanSuccess = useCallback(async () => {
    setShowQRScanner(false);
    // Refresh subscription status
    const status = await checkSubscriptionStatus();
    const info = await getSubscriptionInfo();
    setSubscriptionApproved(status.approved);
    setSubscriptionInfo(info);
  }, []);

  const handleManualApproval = useCallback(async () => {
    try {
      await approveSubscription();
      const info = await getSubscriptionInfo();
      setSubscriptionApproved(true);
      setSubscriptionInfo(info);
      Alert.alert('Success', 'Subscription approved! The app is now active.');
    } catch (err) {
      Alert.alert('Error', 'Failed to approve subscription. Please try again.');
    }
  }, []);

  const handleSerialKeySuccess = useCallback(async () => {
    setShowSerialKeyScreen(false);
    // Re-check serial key validity
    const isValid = await isSerialKeyValid();
    setSerialKeyValid(isValid);
    if (!isValid) {
      Alert.alert('Error', 'Serial key validation failed. Please try again.');
    }
  }, []);

  const openRenewalGateway = useCallback(async () => {
    try {
      const info = subscriptionInfo ?? (await getSubscriptionInfo());
      const url = buildRenewalGatewayUrl(info);
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Cannot Open', 'The renewal gateway could not be opened. Please try again later.');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Could not open renewal gateway.');
    }
  }, [subscriptionInfo]);

  const openGetSerialNumberGateway = useCallback(async () => {
    try {
      const url = buildFirstInstallGatewayUrl();
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Cannot Open', 'The gateway could not be opened. Please try again later.');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Could not open gateway.');
    }
  }, []);

  const requestAllPermissions = useCallback(async () => {
    // Check serial key first (required for app to function)
    if (!serialKeyValid) {
      setShowSerialKeyScreen(true);
      Alert.alert(
        'Serial Key Required',
        'Please enter a valid serial key to activate the app on this device.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Check subscription before allowing camera access
    const approved = await isSubscriptionApproved();
    if (!approved) {
      Alert.alert(
        'Subscription Required',
        'Your subscription is not approved. Contact your administrator for a QR code, or use Manual Approval if you have been approved.',
        [
          { text: 'Manual Approval', onPress: handleManualApproval },
          { text: 'OK' }
        ]
      );
      return;
    }
    
    if (!permission?.granted) await requestPermission();
    if (!locationPermission?.granted) await requestLocationPermission();
  }, [serialKeyValid, permission, requestPermission, locationPermission, requestLocationPermission, handleManualApproval]);

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
    
    // Check serial key first (required for app to function)
    if (!serialKeyValid) {
      setShowSerialKeyScreen(true);
      Alert.alert(
        'Serial Key Required',
        'Please enter a valid serial key to activate the app on this device.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Check subscription before taking picture
    const approved = await isSubscriptionApproved();
    if (!approved) {
      Alert.alert(
        'Subscription Required',
        'Your subscription is not approved. Contact your administrator for a QR code, or use Manual Approval if you have been approved.',
        [
          { text: 'Manual Approval', onPress: handleManualApproval },
          { text: 'OK' }
        ]
      );
      return;
    }
    
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
        base64: true,
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
      const lat = meta.latitude?.toFixed(6) ?? '—';
      const lon = meta.longitude?.toFixed(6) ?? '—';
      const accStr = formatAccuracy(meta.accuracy);

      // Match preview: normalize to portrait so saved file = same size/orientation as preview
      const rawW = photo.width || 1080;
      const rawH = photo.height || 1920;
      const isLandscape = rawW > rawH;
      const orientResult = await ImageManipulator.manipulateAsync(
        photo.uri,
        isLandscape ? [{ rotate: 0 }] : [],
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );
      const workingUri = orientResult.uri;
      const w = orientResult.width;
      const h = orientResult.height;
      const orientedBase64 = orientResult.base64 ?? null;

      // Step 2: Add text + logo overlay when native module is available (dev build only)
      let resultUri = workingUri;
      let resultBase64 = orientedBase64;
      try {
        // Logo must be a file URI for overlay
        const logoAsset = Asset.fromModule(LOGO_SOURCE);
        await logoAsset.downloadAsync();
        const logoUri = logoAsset.localUri || logoAsset.uri;
        if (!logoUri || typeof logoUri !== 'string') {
          throw new Error('Logo asset has no local URI');
        }

        const cropRegion = { x: 0, y: 0, width: w, height: h };
        // Logo on top-left, fixed 300x300 size for saved photo
        const logoSize = 300;
        const logoX = TEXT_MARGIN;
        const logoY = TEXT_MARGIN;
        // Geo text next to logo on the right, moved down a little
        const textX = logoX + logoSize + 12;
        const textStartY = TEXT_MARGIN + 30;
        
        // Text operations with black color and white shadow for better visibility
        // No white background - using shadow instead for contrast
        const textOps = [
          { 
            position: { x: textX, y: textStartY }, 
            text: meta.dateTimeDisplay, 
            textSize: TEXT_SIZE, 
            color: '#000000', 
            thickness: 2,
            shadowColor: '#FFFFFF',
            shadowRadius: 4,
            shadowOffset: { x: 2, y: 2 }
          },
          { 
            position: { x: textX, y: textStartY + LINE_HEIGHT }, 
            text: `Lat: ${lat}`, 
            textSize: TEXT_SIZE, 
            color: '#000000', 
            thickness: 2,
            shadowColor: '#FFFFFF',
            shadowRadius: 4,
            shadowOffset: { x: 2, y: 2 }
          },
          { 
            position: { x: textX, y: textStartY + LINE_HEIGHT * 2 }, 
            text: `Lon: ${lon}`, 
            textSize: TEXT_SIZE, 
            color: '#000000', 
            thickness: 2,
            shadowColor: '#FFFFFF',
            shadowRadius: 4,
            shadowOffset: { x: 2, y: 2 }
          },
          { 
            position: { x: textX, y: textStartY + LINE_HEIGHT * 3 }, 
            text: `Accuracy: ${accStr}`, 
            textSize: TEXT_SIZE, 
            color: '#000000', 
            thickness: 2,
            shadowColor: '#FFFFFF',
            shadowRadius: 4,
            shadowOffset: { x: 2, y: 2 }
          },
        ];

        // Resize logo to small size before overlaying
        // Get actual logo dimensions first, then use those for crop
        let overlayLogoUri = logoUri;
        try {
          // Get logo image dimensions
          const getLogoSize = () => {
            return new Promise((resolve, reject) => {
              Image.getSize(
                logoUri,
                (width, height) => resolve({ width, height }),
                reject
              );
            });
          };
          
          const logoDims = await getLogoSize();
          const cropWidth = Math.min(logoDims.width, logoDims.height);
          const cropHeight = cropWidth; // Square crop
          
          // Resize logo and preserve transparency (PNG format)
          overlayLogoUri = await RNPhotoManipulator.crop(
            logoUri,
            { x: 0, y: 0, width: cropWidth, height: cropHeight },
            { width: logoSize, height: logoSize },
            MimeType.PNG // Preserve transparency
          );
          console.log(`Logo resized to ${logoSize}x${logoSize}px (from ${logoDims.width}x${logoDims.height})`);
        } catch (logoResizeErr) {
          console.warn('Logo resize failed, trying fallback method:', logoResizeErr?.message);
          // Fallback: try with small safe crop region
          try {
            overlayLogoUri = await RNPhotoManipulator.crop(
              logoUri,
              { x: 0, y: 0, width: 200, height: 200 },
              { width: logoSize, height: logoSize },
              MimeType.PNG // Preserve transparency
            );
            console.log(`Logo resized to ${logoSize}x${logoSize}px (fallback)`);
          } catch (fallbackErr) {
            console.warn('Logo resize failed completely, using original (logo will be large):', fallbackErr?.message);
            overlayLogoUri = logoUri;
          }
        }

        const operations = [
          // Add black text with white shadow
          ...textOps.map((op) => ({ operation: 'text', options: op })),
          // Finally add logo
          { operation: 'overlay', overlay: overlayLogoUri, position: { x: logoX, y: logoY } },
        ];
        resultUri = await RNPhotoManipulator.batch(workingUri, operations, cropRegion, undefined, 90, 'image/jpeg');
        resultBase64 = null;
      } catch (overlayErr) {
        const errMsg = overlayErr?.message || String(overlayErr);
        console.warn('Overlay failed (logo/text), saving oriented photo only:', errMsg);
        // Ensure photo is still saved even if overlays fail
        resultUri = workingUri;
        resultBase64 = orientedBase64;
        // Don't show alert - photo will still be saved, just without overlays
        // The user can see in the gallery if overlays were applied or not
      }

      const useBase64 = resultBase64 ?? (resultUri === photo.uri ? photo.base64 : null);
      const entry = await saveGeoPhoto(resultUri, meta, useBase64 ?? undefined);
      setLastPhoto(entry.uri);
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
    handleManualApproval,
    handleQRScanSuccess,
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

  // Check serial key before showing camera (required for app to function)
  if (checkingSerialKey) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={[styles.message, { marginTop: 16 }]}>Checking serial key...</Text>
      </View>
    );
  }

  if (!serialKeyValid) {
    return (
      <>
        <View style={styles.centered}>
          <Text style={styles.message}>
            🔐 Serial Number Required 🔐
          </Text>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionTitle}>Get your serial number</Text>
            <Text style={styles.instructionStep}>
              Go to the subscription gateway to pay. After successful payment, return here and scan or upload your QR code to activate the app.
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: '#4ade80' }]} 
            onPress={openGetSerialNumberGateway}
          >
            <Text style={styles.primaryButtonText}>Get Serial Number</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.primaryButton, { marginTop: 12, backgroundColor: '#38bdf8' }]} 
            onPress={() => setShowSerialKeyScreen(true)}
          >
            <Text style={styles.primaryButtonText}>Enter key / Scan or upload QR</Text>
          </TouchableOpacity>
        </View>
        {showSerialKeyScreen && (
          <Modal
            visible={showSerialKeyScreen}
            animationType="slide"
            onRequestClose={() => setShowSerialKeyScreen(false)}
          >
            <SerialKeyScreen
              onSuccess={handleSerialKeySuccess}
              onCancel={() => setShowSerialKeyScreen(false)}
              openGetSerialNumberGateway={openGetSerialNumberGateway}
            />
          </Modal>
        )}
      </>
    );
  }

  // Check subscription before showing camera
  if (checkingSubscription) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={[styles.message, { marginTop: 16 }]}>Checking subscription...</Text>
      </View>
    );
  }

  if (!subscriptionApproved) {
    const daysRemaining = subscriptionInfo?.daysRemaining ?? 0;
    return (
      <>
        <View style={styles.centered}>
          <Text style={styles.subscriptionTitle}>
            {daysRemaining <= 0 
              ? '⚠️ Subscription Expired ⚠️' 
              : `⚠️ Subscription Expiring Soon (${daysRemaining} days remaining)`}
          </Text>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionTitle}>Subscription renewal instructions</Text>
            <Text style={styles.instructionStep}>1. Click the Subscription Renewal button below.</Text>
            <Text style={styles.instructionStep}>2. Follow the instructions in the renewal gateway.</Text>
          </View>
          <TouchableOpacity 
            style={[styles.primaryButton, styles.renewalButton]} 
            onPress={openRenewalGateway}
          >
            <Text style={styles.primaryButtonText}>Subscription Renewal</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.primaryButton, { marginTop: 12, backgroundColor: '#64748b' }]} 
            onPress={() => setShowQRScanner(true)}
          >
            <Text style={styles.primaryButtonText}>📷 Scan QR Code</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.primaryButton, { marginTop: 8, backgroundColor: '#475569' }]} 
            onPress={async () => {
              const status = await checkSubscriptionStatus();
              const info = await getSubscriptionInfo();
              setSubscriptionApproved(status.approved);
              setSubscriptionInfo(info);
            }}
          >
            <Text style={styles.primaryButtonText}>Check Status</Text>
          </TouchableOpacity>
        </View>
        {showQRScanner && (
          <Modal
            visible={showQRScanner}
            animationType="slide"
            onRequestClose={() => setShowQRScanner(false)}
          >
            <QRScannerScreen
              onScanSuccess={handleQRScanSuccess}
              onCancel={() => setShowQRScanner(false)}
            />
          </Modal>
        )}
      </>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.flipButton}
          onPress={() => setFacing((prev) => (prev === 'back' ? 'front' : 'back'))}
          activeOpacity={0.8}
        >
          <Text style={styles.flipButtonText}>⇄ Flip</Text>
        </TouchableOpacity>
      </View>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
      <View style={styles.logoOverlay} pointerEvents="none">
        <Image source={LOGO_SOURCE} style={styles.logoInFrame} resizeMode="contain" />
      </View>

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

      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <Pressable style={styles.previewBackdrop} onPress={() => setPreviewVisible(false)}>
          <Pressable style={styles.previewContent} onPress={() => {}}>
            <Text style={styles.previewLabel}>Last photo</Text>
            <Image source={{ uri: lastPhoto }} style={styles.previewImage} resizeMode="contain" />
            <TouchableOpacity
              style={[styles.saveToPhoneButton, savingToPhone && styles.saveToPhoneButtonDisabled]}
              onPress={saveLastPhotoToPhone}
              disabled={savingToPhone}
              activeOpacity={0.85}
            >
              {savingToPhone ? (
                <ActivityIndicator color="#0f0f1a" />
              ) : (
                <Text style={styles.saveToPhoneButtonText}>Save to phone</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.kmzButton, savingKmz && styles.saveToPhoneButtonDisabled]}
              onPress={saveLastPhotoAsKmz}
              disabled={savingKmz}
              activeOpacity={0.85}
            >
              {savingKmz ? (
                <ActivityIndicator color="#0f0f1a" />
              ) : (
                <Text style={styles.kmzButtonText}>Save as KMZ file</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.previewHint}>Tap anywhere to close</Text>
          </Pressable>
        </Pressable>
      </Modal>
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
  subscriptionTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  instructionBox: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  instructionTitle: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionStep: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
  },
  renewalButton: {
    backgroundColor: '#4ade80',
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? 36 : 12,
    backgroundColor: 'rgba(15,15,26,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74,222,128,0.3)',
  },
  flipButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(74,222,128,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.5)',
  },
  flipButtonText: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  logoOverlay: {
    position: 'absolute',
    top: 88,
    left: 20,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInFrame: {
    width: 100,
    height: 100,
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
    width: 60,
    height: 60,
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
    marginTop: 20,
  },
  geoValue: {
    width: '100%',
    color: '#e2e8f0',
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  previewLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
    backgroundColor: '#1a1a2e',
  },
  previewHint: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 12,
  },
  saveToPhoneButton: {
    marginTop: 12,
    width: '100%',
    backgroundColor: '#4ade80',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveToPhoneButtonDisabled: {
    opacity: 0.7,
  },
  saveToPhoneButtonText: {
    color: '#0f0f1a',
    fontWeight: '800',
    fontSize: 14,
  },
  kmzButton: {
    marginTop: 8,
    width: '100%',
    backgroundColor: '#38bdf8',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  kmzButtonText: {
    color: '#0f0f1a',
    fontWeight: '800',
    fontSize: 14,
  },
});
