/**
 * QR Code Generator and Validator
 * Generates and validates unique QR codes for subscription approval
 */

import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system/legacy';

const SECRET_KEY = 'JAG_GEOTAG_SUBSCRIPTION_SECRET_2026'; // TODO: Change this to a secure secret key
const QR_CODE_FILE = `${FileSystem.documentDirectory}qr_codes.json`;

/**
 * Simple hash function (fallback if expo-crypto not available)
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).toUpperCase().substring(0, 8);
}

/**
 * Generate a unique approval code for a subscription period
 * Format: JAG-{timestamp}-{hash}
 */
export async function generateApprovalCode(subscriptionPeriod) {
  const timestamp = new Date(subscriptionPeriod).getTime();
  const data = `${timestamp}-${SECRET_KEY}`;
  
  let hash;
  try {
    hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data);
    hash = hash.substring(0, 8).toUpperCase();
  } catch (error) {
    // Fallback to simple hash
    hash = simpleHash(data);
  }
  
  return `JAG-${timestamp}-${hash}`;
}

/**
 * Validate an approval code
 */
export async function validateApprovalCode(code, subscriptionPeriod) {
  if (!code || typeof code !== 'string') return false;
  
  // Check format: JAG-timestamp-hash
  const parts = code.split('-');
  if (parts.length !== 3 || parts[0] !== 'JAG') return false;
  
  const timestamp = parseInt(parts[1], 10);
  if (isNaN(timestamp)) return false;
  
  // Generate expected hash
  const data = `${timestamp}-${SECRET_KEY}`;
  let expectedHash;
  try {
    expectedHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data);
    expectedHash = expectedHash.substring(0, 8).toUpperCase();
  } catch (error) {
    // Fallback to simple hash
    expectedHash = simpleHash(data);
  }
  
  // Compare hashes
  if (parts[2] !== expectedHash) return false;
  
  // Check if code is for the current subscription period (within 30 days window)
  const codeDate = new Date(timestamp);
  const periodDate = new Date(subscriptionPeriod);
  const daysDiff = Math.abs((codeDate - periodDate) / (1000 * 60 * 60 * 24));
  
  // Allow codes within 35 days window (5 days grace period)
  return daysDiff <= 35;
}

/**
 * Store a used QR code to prevent reuse
 */
export async function markQRCodeAsUsed(code) {
  try {
    let usedCodes = [];
    const info = await FileSystem.getInfoAsync(QR_CODE_FILE);
    if (info.exists) {
      const content = await FileSystem.readAsStringAsync(QR_CODE_FILE);
      usedCodes = content ? JSON.parse(content) : [];
    }
    
    // Add code with timestamp
    usedCodes.push({
      code,
      usedAt: new Date().toISOString(),
    });
    
    // Keep only last 100 codes to prevent file from growing too large
    if (usedCodes.length > 100) {
      usedCodes = usedCodes.slice(-100);
    }
    
    await FileSystem.writeAsStringAsync(
      QR_CODE_FILE,
      JSON.stringify(usedCodes, null, 2)
    );
  } catch (error) {
    console.error('Error marking QR code as used:', error);
  }
}

/**
 * Check if QR code has been used before
 */
export async function isQRCodeUsed(code) {
  try {
    const info = await FileSystem.getInfoAsync(QR_CODE_FILE);
    if (!info.exists) return false;
    
    const content = await FileSystem.readAsStringAsync(QR_CODE_FILE);
    const usedCodes = content ? JSON.parse(content) : [];
    
    return usedCodes.some(item => item.code === code);
  } catch (error) {
    console.error('Error checking QR code usage:', error);
    return false;
  }
}
