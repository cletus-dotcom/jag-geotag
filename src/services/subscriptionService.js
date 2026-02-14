/**
 * Subscription Service
 * Manages app subscription/licensing with 30-day approval cycle
 * Sends email notifications for approval
 */
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as MailComposer from 'expo-mail-composer';
import { validateApprovalCode, isQRCodeUsed, markQRCodeAsUsed } from '../utils/qrCodeGenerator';

const SUBSCRIPTION_FILE = `${FileSystem.documentDirectory}subscription.json`;
const SUBSCRIPTION_PERIOD_DAYS = 30;
// TODO: Replace with your email address for receiving approval notifications
const ADMIN_EMAIL = 'cletusacaido@gmail.com';

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
        notificationSent: false,
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

  // If subscription expired or expires within 7 days, send notification
  if (now > nextCheckDate || daysUntilExpiry <= 7) {
    if (!data.notificationSent || daysUntilExpiry <= 0) {
      await sendApprovalNotification(daysUntilExpiry);
      await saveSubscriptionData({
        ...data,
        notificationSent: true,
      });
    }
    return { approved: now <= nextCheckDate && data.isApproved, needsNotification: false };
  }

  return { approved: data.isApproved, needsNotification: false };
}

/**
 * Send email notification for subscription approval
 */
async function sendApprovalNotification(daysUntilExpiry) {
  try {
    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      console.warn('Mail composer not available on this device');
      return false;
    }

    const data = await getSubscriptionData();
    const now = new Date();
    
    // Calculate days passed since last subscription
    let daysPassed = 0;
    if (data?.lastApprovedDate) {
      const lastApproved = new Date(data.lastApprovedDate);
      daysPassed = Math.max(0, Math.ceil((now - lastApproved) / (1000 * 60 * 60 * 24)));
    } else if (data?.nextCheckDate) {
      // If no lastApprovedDate, calculate from nextCheckDate (30 days back)
      const nextCheck = new Date(data.nextCheckDate);
      daysPassed = Math.max(0, Math.ceil((now - new Date(nextCheck.getTime() - SUBSCRIPTION_PERIOD_DAYS * 24 * 60 * 60 * 1000)) / (1000 * 60 * 60 * 24)));
    }

    const subject = daysUntilExpiry <= 0
      ? 'URGENT: Jag GeoTag Subscription Expired - Approval Required'
      : `Jag GeoTag Subscription Expiring Soon - Approval Required (${daysUntilExpiry} days remaining)`;

    const body = `
Jag GeoTag App Subscription Approval Request

${daysUntilExpiry <= 0 ? '⚠️ SUBSCRIPTION HAS EXPIRED ⚠️' : '⚠️ Subscription Expiring Soon'}

App: Jag GeoTag
Status: ${daysUntilExpiry <= 0 ? 'EXPIRED' : `Expires in ${daysUntilExpiry} days`}
Current Date: ${now.toLocaleString()}
${data?.lastApprovedDate ? `Last Approved: ${new Date(data.lastApprovedDate).toLocaleDateString()}` : ''}
Days Passed Since Last Subscription: ${daysPassed} days

═══════════════════════════════════════════════════════
PAYMENT CALCULATION
═══════════════════════════════════════════════════════

Days since last subscription: ${daysPassed} days
Subscription period: 30 days

Please calculate the renewal fee based on:
- Base subscription fee (30 days)
- Additional days (if any): ${Math.max(0, daysPassed - 30)} days
- Total days to renew: ${daysPassed} days

═══════════════════════════════════════════════════════
APPROVAL PROCESS
═══════════════════════════════════════════════════════

To approve this subscription:

1. Calculate payment based on days passed (${daysPassed} days)
2. Generate a QR code for this subscription period:
   - Run: node scripts/generateQRCode.js
   - Or: node scripts/generateQRCodeWithImage.js
3. Send the QR code image to the user via email
4. User will scan the QR code in the app to activate subscription
5. After successful QR code validation, the app will resume full functionality

QR Code Format: JAG-{timestamp}-{hash}

═══════════════════════════════════════════════════════
DEVICE INFORMATION
═══════════════════════════════════════════════════════

Platform: ${Platform.OS}
Request Date: ${now.toISOString()}
${data?.nextCheckDate ? `Expiry Date: ${new Date(data.nextCheckDate).toLocaleDateString()}` : ''}

Thank you!
`;

    const result = await MailComposer.composeAsync({
      recipients: [ADMIN_EMAIL],
      subject: subject,
      body: body,
      isHtml: false,
    });

    return result.status === MailComposer.MailComposerStatus.SENT;
  } catch (error) {
    console.error('Error sending approval notification:', error);
    return false;
  }
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
    notificationSent: false,
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
    notificationSent: false,
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
