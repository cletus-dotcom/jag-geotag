/**
 * Decode QR code from an image URI (e.g. from expo-image-picker).
 * Returns the decoded string or null if decoding fails or is unsupported.
 */
import * as FileSystem from 'expo-file-system/legacy';

let QRDecoder = null;

function getDecoder() {
  if (QRDecoder !== undefined) return QRDecoder;
  try {
    // Optional: use a native decoder if available (e.g. in dev build)
    // eslint-disable-next-line global-require
    const mod = require('react-native-qrcode-local-image');
    QRDecoder = mod && (mod.default || mod);
  } catch (e) {
    QRDecoder = null;
  }
  return QRDecoder;
}

/**
 * Decode QR code content from an image file URI.
 * @param {string} imageUri - File URI (file:// or content://) from image picker
 * @returns {Promise<string|null>} Decoded QR text or null
 */
export async function decodeQRFromImageUri(imageUri) {
  if (!imageUri || typeof imageUri !== 'string') return null;
  const decoder = getDecoder();
  if (!decoder || typeof decoder.decode !== 'function') {
    return null;
  }
  try {
    const result = await decoder.decode(imageUri);
    return typeof result === 'string' ? result : (result && result.data) || null;
  } catch (e) {
    return null;
  }
}

/**
 * Check if QR decoding from image is available in this build.
 */
export function isQRImageDecodeAvailable() {
  return getDecoder() != null;
}
