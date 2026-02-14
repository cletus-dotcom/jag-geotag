/**
 * Serial Key Service
 * Manages device-specific serial keys for app installation
 * One serial key per device - prevents multiple installations
 */
import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

const SERIAL_KEY_FILE = `${FileSystem.documentDirectory}serial_key.json`;
const SECRET_KEY = 'JAG_GEOTAG_SERIAL_SECRET_2026'; // TODO: Change this to a secure secret key

/**
 * Get device unique ID
 */
async function getDeviceId() {
  try {
    // Try to get Android ID or iOS identifierForVendor
    if (Platform.OS === 'android') {
      const androidId = await Application.getAndroidId();
      return androidId || 'unknown-android';
    } else if (Platform.OS === 'ios') {
      // iOS uses identifierForVendor (IDFV)
      const idfv = await Application.getIosIdForVendorAsync();
      return idfv || 'unknown-ios';
    }
    return 'unknown-device';
  } catch (error) {
    console.error('Error getting device ID:', error);
    return 'unknown-device';
  }
}

/**
 * Get serial key data from storage
 */
async function getSerialKeyData() {
  try {
    const info = await FileSystem.getInfoAsync(SERIAL_KEY_FILE);
    if (!info.exists) {
      return null;
    }
    const content = await FileSystem.readAsStringAsync(SERIAL_KEY_FILE);
    return content ? JSON.parse(content) : null;
  } catch (error) {
    console.error('Error reading serial key data:', error);
    return null;
  }
}

/**
 * Save serial key data to storage
 */
async function saveSerialKeyData(data) {
  try {
    await FileSystem.writeAsStringAsync(
      SERIAL_KEY_FILE,
      JSON.stringify(data, null, 2)
    );
  } catch (error) {
    console.error('Error saving serial key data:', error);
  }
}

/**
 * Generate hash for serial key validation
 */
async function generateSerialHash(serialKey, deviceId) {
  const data = `${serialKey}-${deviceId}-${SECRET_KEY}`;
  try {
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data);
    return hash.substring(0, 16).toUpperCase();
  } catch (error) {
    // Fallback hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).toUpperCase().substring(0, 16);
  }
}

/**
 * Validate serial key format
 * Format: JAG-XXXX-XXXX-XXXX-XXXX (20 characters total)
 */
function isValidSerialFormat(serialKey) {
  if (!serialKey || typeof serialKey !== 'string') return false;
  const parts = serialKey.split('-');
  if (parts.length !== 5 || parts[0] !== 'JAG') return false;
  return parts.every(part => part.length === 4 && /^[A-Z0-9]+$/.test(part));
}

/**
 * Check if serial key is registered for this device
 */
export async function isSerialKeyValid() {
  const data = await getSerialKeyData();
  if (!data || !data.serialKey || !data.deviceId) {
    return false;
  }

  // Get current device ID
  const currentDeviceId = await getDeviceId();
  
  // Check if device ID matches
  if (data.deviceId !== currentDeviceId) {
    console.warn('Device ID mismatch - serial key not valid for this device');
    return false;
  }

  // Validate serial key hash
  const expectedHash = await generateSerialHash(data.serialKey, data.deviceId);
  if (data.hash !== expectedHash) {
    console.warn('Serial key hash mismatch - invalid serial key');
    return false;
  }

  return true;
}

/**
 * Register a serial key for this device
 */
export async function registerSerialKey(serialKey) {
  // Validate format
  if (!isValidSerialFormat(serialKey)) {
    return { 
      success: false, 
      error: 'Invalid serial key format. Format: JAG-XXXX-XXXX-XXXX-XXXX' 
    };
  }

  // Get device ID
  const deviceId = await getDeviceId();
  
  // Check if device already has a serial key
  const existingData = await getSerialKeyData();
  if (existingData && existingData.serialKey && existingData.deviceId === deviceId) {
    return { 
      success: false, 
      error: 'This device already has a serial key registered. Each device can only have one serial key.' 
    };
  }

  // Generate hash
  const hash = await generateSerialHash(serialKey, deviceId);

  // Save serial key data
  await saveSerialKeyData({
    serialKey: serialKey.toUpperCase(),
    deviceId: deviceId,
    hash: hash,
    registeredAt: new Date().toISOString(),
  });

  return { success: true };
}

/**
 * Get serial key info (without exposing the key)
 */
export async function getSerialKeyInfo() {
  const data = await getSerialKeyData();
  if (!data) {
    return {
      registered: false,
      deviceId: null,
      registeredAt: null,
    };
  }

  const currentDeviceId = await getDeviceId();
  const isValid = data.deviceId === currentDeviceId;

  return {
    registered: isValid,
    deviceId: currentDeviceId,
    registeredAt: data.registeredAt,
    maskedSerialKey: data.serialKey ? `${data.serialKey.substring(0, 7)}****-****` : null,
  };
}

/**
 * Clear serial key (for testing/reset)
 */
export async function clearSerialKey() {
  try {
    const info = await FileSystem.getInfoAsync(SERIAL_KEY_FILE);
    if (info.exists) {
      await FileSystem.deleteAsync(SERIAL_KEY_FILE, { idempotent: true });
    }
    return true;
  } catch (error) {
    console.error('Error clearing serial key:', error);
    return false;
  }
}
