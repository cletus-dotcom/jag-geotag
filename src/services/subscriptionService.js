/**
 * Subscription Service
 * Manages app subscription/licensing with 30-day approval cycle
 * QR code-based activation (no email notifications)
 */
import * as FileSystem from 'expo-file-system/legacy';
import { validateApprovalCode, isQRCodeUsed, markQRCodeAsUsed } from '../utils/qrCodeGenerator';

const SUBSCRIPTION_FILE = `${FileSystem.documentDirectory}subscription.json`;
const SUBSCRIPTION_PERIOD_DAYS = 30;

/**
 * Get subscription data from storage
 */
async function getSubscriptionData() {
  try {
    const info = await FileSystem.getInfoAsync(SUBSCRIPTION_FILE);
    if (!info.exists) {
      // First time - initialize with approved status
      const initialData = {
        isApproved: true,
        lastApprovedDate: new Date().toISOString(),
        nextCheckDate: new Date(Date.now() + SUBSCRIPTION_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString(),
      };
      await FileSystem.writeAsStringAsync(
        SUBSCRIPTION_FILE,
        JSON.stringify(initialData, null, 2)
      );
      return initialData;
    }
    const content = await FileSystem.readAsStringAsync(SUBSCRIPTION_FILE);
    return content ? JSON.parse(content) : null;
  } catch (error) {
    console.error('Error reading subscription data:', error);
    return null;
  }
}

/**
 * Save subscription data to storage
 */
async function saveSubscriptionData(data) {
  try {
    await FileSystem.writeAsStringAsync(
      SUBSCRIPTION_FILE,
      JSON.stringify(data, null, 2)
    );
  } catch (error) {
    console.error('Error saving subscription data:', error);
  }
}

/**
 * Check if subscription is currently approved
 */
export async function isSubscriptionApproved() {
  const data = await getSubscriptionData();
  if (!data) return false;

  const now = new Date();
  const nextCheckDate = new Date(data.nextCheckDate);

  // If we're past the check date, subscription needs renewal
  if (now > nextCheckDate) {
    return false;
  }

  return data.isApproved === true;
}

/**
 * Check subscription status and send notification if needed
 */
export async function checkSubscriptionStatus() {
  const data = await getSubscriptionData();
  if (!data) {
    return { approved: false, needsNotification: true };
  }

  const now = new Date();
  const nextCheckDate = new Date(data.nextCheckDate);
  const daysUntilExpiry = Math.ceil((nextCheckDate - now) / (1000 * 60 * 60 * 24));

  // If subscription expired or expires within 7 days
  if (now > nextCheckDate || daysUntilExpiry <= 7) {
    return { approved: now <= nextCheckDate && data.isApproved, needsNotification: false };
  }

  return { approved: data.isApproved, needsNotification: false };
}

/**
 * Approve subscription using QR code
 */
export async function approveSubscriptionWithQRCode(qrCode) {
  const data = await getSubscriptionData();
  if (!data) {
    return { success: false, error: 'No subscription data found' };
  }

  // Check if QR code has been used before
  const alreadyUsed = await isQRCodeUsed(qrCode);
  if (alreadyUsed) {
    return { success: false, error: 'This QR code has already been used' };
  }

  // Validate QR code
  const isValid = await validateApprovalCode(qrCode, data.nextCheckDate || new Date().toISOString());
  if (!isValid) {
    return { success: false, error: 'Invalid QR code. Please scan a valid approval QR code.' };
  }

  // Mark QR code as used
  await markQRCodeAsUsed(qrCode);

  // Approve subscription
  const now = new Date();
  const nextCheckDate = new Date(now.getTime() + SUBSCRIPTION_PERIOD_DAYS * 24 * 60 * 60 * 1000);

  await saveSubscriptionData({
    isApproved: true,
    lastApprovedDate: now.toISOString(),
    nextCheckDate: nextCheckDate.toISOString(),
    approvedViaQR: true,
    qrCodeUsed: qrCode,
  });

  return { success: true };
}

/**
 * Approve subscription (manual approval - for backward compatibility)
 */
export async function approveSubscription() {
  const data = await getSubscriptionData();
  const now = new Date();
  const nextCheckDate = new Date(now.getTime() + SUBSCRIPTION_PERIOD_DAYS * 24 * 60 * 60 * 1000);

  await saveSubscriptionData({
    isApproved: true,
    lastApprovedDate: now.toISOString(),
    nextCheckDate: nextCheckDate.toISOString(),
  });

  return true;
}

/**
 * Get subscription status info
 */
export async function getSubscriptionInfo() {
  const data = await getSubscriptionData();
  if (!data) {
    return {
      isApproved: false,
      lastApprovedDate: null,
      nextCheckDate: null,
      daysRemaining: 0,
    };
  }

  const now = new Date();
  const nextCheckDate = new Date(data.nextCheckDate);
  const daysRemaining = Math.max(0, Math.ceil((nextCheckDate - now) / (1000 * 60 * 60 * 24)));

  return {
    isApproved: data.isApproved && now <= nextCheckDate,
    lastApprovedDate: data.lastApprovedDate,
    nextCheckDate: data.nextCheckDate,
    daysRemaining,
  };
}
