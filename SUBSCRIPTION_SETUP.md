# Subscription System Setup - QR Code Based Approval

The app includes a subscription/licensing system that requires QR code-based approval every 30 days. This document explains how to configure and use the complete system.

## Overview

The subscription system works on a **30-day approval cycle** with **QR code-based activation**. When a subscription expires, users request approval via email, and admins send back a unique QR code that users scan to reactivate the app.

## Key Features

- **30-day approval cycle**: Subscription must be approved every 30 days
- **QR code activation**: Secure QR code scanning for subscription approval
- **Days tracking**: Email notifications include days passed since last subscription for payment calculation
- **App blocking**: Camera functionality is completely disabled if subscription is not approved
- **Automatic resumption**: After successful QR code validation, the app automatically resumes full functionality
- **Email notifications**: Automatically sends email when subscription expires or is about to expire (7 days before)

## Setup Instructions

### 1. Configure Your Email Address

Edit `src/services/subscriptionService.js` and replace the `ADMIN_EMAIL` constant with your email address:

```javascript
const ADMIN_EMAIL = 'your-actual-email@example.com';
```

### 2. Configure Secret Key (Optional but Recommended)

For security, change the secret key in both files to match:

**File 1:** `src/utils/qrCodeGenerator.js` (line 9)
```javascript
const SECRET_KEY = 'YOUR_CUSTOM_SECRET_KEY_HERE';
```

**File 2:** `scripts/generateQRCode.js` (line 7)
```javascript
const SECRET_KEY = 'YOUR_CUSTOM_SECRET_KEY_HERE';
```

**Important:** Both files must have the same secret key for QR codes to work.

### 3. Install Dependencies

Install required packages:

```bash
npm install
```

Or install individually:

```bash
npx expo install expo-mail-composer expo-crypto
```

For QR code image generation (optional):
```bash
npm install qrcode
```

## How the System Works

### Initial Setup

1. **First Launch**: App starts with an approved subscription (30 days from first launch)
2. **Subscription Active**: User can use all app features (camera, photo capture, gallery)

### Subscription Expiry Process

1. **30-Day Check**: Every time the app opens, it checks if 30 days have passed since last approval
2. **Email Notification**: 
   - Sent automatically when subscription expires
   - Sent 7 days before expiration as a reminder
   - **Includes days passed** since last subscription for payment calculation
3. **App Blocking**: 
   - Camera preview is disabled
   - Photo capture is disabled
   - User sees subscription expired screen with QR scanner button

### Approval Workflow

#### Step 1: User Requests Approval

When subscription expires or is about to expire:
- App automatically sends email to admin (`ADMIN_EMAIL`)
- Email includes:
  - Subscription status (expired or expiring soon)
  - **Days passed since last subscription** (for payment calculation)
  - Device/platform information
  - Request for QR code approval

**Email Example:**
```
Days Passed Since Last Subscription: 35 days
Subscription period: 30 days
Additional days: 5 days
```

#### Step 2: Admin Generates QR Code

Admin receives email and generates a unique QR code:

**Option A: Text Output (Simple)**
```bash
node scripts/generateQRCode.js
```

Output: `JAG-1736726400000-A1B2C3D4`

Copy this code and use an online QR generator:
- https://www.qr-code-generator.com/
- https://www.the-qrcode-generator.com/

**Option B: PNG Image (Recommended)**
```bash
npm install qrcode
node scripts/generateQRCodeWithImage.js
```

This creates a PNG file in `qr_codes/` folder ready to email.

**Option C: Custom Date**
```bash
node scripts/generateQRCode.js 2026-02-12
```

#### Step 3: Admin Sends QR Code

Admin sends the QR code image to the user via email with payment instructions (if applicable).

#### Step 4: User Scans QR Code

1. User opens the app
2. Sees subscription expired screen
3. Taps **"📷 Scan QR Code"** button
4. Camera opens with QR scanner
5. User positions QR code within the scanning frame
6. App automatically detects and validates the QR code

#### Step 5: App Resumes Functionality

**After successful QR code validation:**
- ✅ Subscription is approved for another 30 days
- ✅ Camera preview is immediately enabled
- ✅ Photo capture functionality is restored
- ✅ All app features are active
- ✅ User can continue using the app normally

**If QR code validation fails:**
- ❌ Error message shown: "Invalid QR code" or "QR code already used"
- ❌ User can try scanning again or contact admin
- ❌ App remains blocked until valid QR code is scanned

## Email Notification Details

### What's Included in the Email

The automatic email notification includes:

1. **Subscription Status**
   - Current status (expired or expiring soon)
   - Days remaining (if not expired)

2. **Payment Calculation Information**
   - **Days passed since last subscription**: Critical for calculating renewal fees
   - Base subscription period: 30 days
   - Additional days (if subscription expired): Days beyond 30
   - Total days to renew

3. **Device Information**
   - Platform (Android/iOS)
   - Request date/time
   - Expiry date (if applicable)

4. **Approval Instructions**
   - Steps to generate QR code
   - How to send QR code to user

### Email Example

```
Jag GeoTag App Subscription Approval Request

⚠️ SUBSCRIPTION HAS EXPIRED ⚠️

App: Jag GeoTag
Status: EXPIRED
Current Date: Feb 12, 2026, 21:05:32
Last Approved: Jan 10, 2026
Days Passed Since Last Subscription: 33 days

═══════════════════════════════════════════════════════
PAYMENT CALCULATION
═══════════════════════════════════════════════════════

Days since last subscription: 33 days
Subscription period: 30 days
Additional days: 3 days
Total days to renew: 33 days
```

## QR Code System

### QR Code Format

Format: `JAG-{timestamp}-{hash}`

Example: `JAG-1736726400000-A1B2C3D4`

- **JAG**: Prefix identifier (always)
- **timestamp**: Unix timestamp in milliseconds
- **hash**: 8-character SHA-256 hash (cryptographic signature)

### Security Features

- **Unique Codes**: Each subscription period gets a unique QR code
- **One-Time Use**: QR codes can only be used once (tracked locally)
- **Time Validation**: Codes are validated against subscription period (35-day window)
- **Hash Verification**: Codes include cryptographic hash for security
- **Secret Key**: Codes are signed with a secret key (changeable)

### QR Code Validation Process

When a QR code is scanned:

1. **Format Check**: Verifies code matches `JAG-timestamp-hash` format
2. **Hash Validation**: Verifies cryptographic hash matches expected value
3. **Time Validation**: Checks if code is valid for current subscription period
4. **Reuse Check**: Verifies code hasn't been used before
5. **Activation**: If all checks pass, subscription is activated for 30 days

## Subscription Data Storage

Subscription data is stored locally in:
```
{FileSystem.documentDirectory}/subscription.json
```

**Data Structure:**
```json
{
  "isApproved": true,
  "lastApprovedDate": "2026-02-12T21:05:32.000Z",
  "nextCheckDate": "2026-03-14T21:05:32.000Z",
  "notificationSent": false,
  "approvedViaQR": true,
  "qrCodeUsed": "JAG-1736726400000-A1B2C3D4"
}
```

**Fields:**
- `isApproved`: Boolean indicating if subscription is approved
- `lastApprovedDate`: ISO date string of last approval
- `nextCheckDate`: ISO date string when subscription expires (30 days from approval)
- `notificationSent`: Boolean indicating if notification email was sent
- `approvedViaQR`: Boolean indicating if approved via QR code
- `qrCodeUsed`: The QR code that was used for approval

**Used QR Codes Storage:**
```
{FileSystem.documentDirectory}/qr_codes.json
```

Stores list of used QR codes to prevent reuse (keeps last 100 codes).

## Payment Calculation Guide

The email notification includes days passed since last subscription to help calculate renewal fees:

### Example Scenarios

**Scenario 1: On-Time Renewal (30 days)**
```
Days Passed: 30 days
Base Fee: $X (for 30 days)
Additional Days: 0
Total: $X
```

**Scenario 2: Late Renewal (35 days)**
```
Days Passed: 35 days
Base Fee: $X (for 30 days)
Additional Days: 5 days
Additional Fee: $Y (for 5 days)
Total: $X + $Y
```

**Scenario 3: Very Late Renewal (60 days)**
```
Days Passed: 60 days
Base Fee: $X (for 30 days)
Additional Days: 30 days
Additional Fee: $Y (for 30 days)
Total: $X + $Y
```

### Payment Processing

1. **Receive Email**: Check "Days Passed Since Last Subscription"
2. **Calculate Fee**: Based on your pricing structure
3. **Process Payment**: Collect payment from user
4. **Generate QR Code**: After payment confirmation
5. **Send QR Code**: Email QR code image to user

## Testing the System

### Test Subscription Expiry

1. **Simulate Expiration**: Manually edit `subscription.json`:
   ```json
   {
     "nextCheckDate": "2026-01-01T00:00:00.000Z"
   }
   ```

2. **Open App**: App should show subscription expired screen

3. **Check Email**: Email should be sent automatically

### Test QR Code Scanning

1. **Generate QR Code**:
   ```bash
   node scripts/generateQRCode.js
   ```

2. **Create QR Image**: Use online QR generator or:
   ```bash
   npm install qrcode
   node scripts/generateQRCodeWithImage.js
   ```

3. **Display QR Code**: Show QR code on another device or print it

4. **Scan in App**: 
   - Open app (with expired subscription)
   - Tap "📷 Scan QR Code"
   - Scan the QR code
   - Verify app resumes functionality

### Test App Resumption

After successful QR scan:
- ✅ Camera preview should appear immediately
- ✅ Photo capture button should work
- ✅ Gallery should be accessible
- ✅ No subscription warnings should appear

## Troubleshooting

### QR Code Not Scanning

**Possible Causes:**
- Poor lighting
- Camera not focused
- QR code image is blurry or distorted
- Code format is incorrect

**Solutions:**
- Ensure good lighting
- Hold phone steady
- Use high-quality QR code image
- Verify code format: `JAG-timestamp-hash`

### "QR Code Already Used" Error

**Cause:** QR code was scanned before

**Solution:** Generate a new QR code for the user

### "Invalid QR Code" Error

**Possible Causes:**
- Code is expired (outside 35-day window)
- Code is for wrong subscription period
- Secret key mismatch between generator and app
- Code format is incorrect

**Solutions:**
- Generate a new QR code
- Verify secret keys match in both files
- Check code format

### App Not Resuming After QR Scan

**Possible Causes:**
- QR validation failed silently
- Subscription data not saved properly

**Solutions:**
- Check console logs for errors
- Verify subscription.json was updated
- Try restarting the app

### Email Not Sending

**Possible Causes:**
- No email account configured on device
- Mail composer not available

**Solutions:**
- Configure email account in device settings
- Check if MailComposer.isAvailableAsync() returns true
- Use alternative notification method if needed

## Files Created

- `src/services/subscriptionService.js` - Subscription management service
- `src/utils/qrCodeGenerator.js` - QR code generation and validation
- `src/screens/QRScannerScreen.js` - QR code scanner screen component
- `scripts/generateQRCode.js` - Admin tool to generate QR codes (text output)
- `scripts/generateQRCodeWithImage.js` - Admin tool to generate QR code images (PNG)
- `QR_CODE_GUIDE.md` - Quick reference guide for QR codes

## Files Modified

- `src/screens/CameraScreen.js` - Integrated subscription checks, QR scanner, and app blocking
- `package.json` - Added `expo-mail-composer` and `expo-crypto` dependencies

## Important Notes

- **Email Composer**: Requires a configured email account on the device
- **Subscription Check**: Happens on app launch and every minute while app is active
- **First-Time Users**: Get 30 days free (initialized as approved)
- **Graceful Degradation**: System allows app to function if subscription check fails (for development)
- **QR Code Security**: Change secret keys for production use
- **Payment Integration**: Email includes days passed, but payment processing is manual (can be automated with backend)

## Production Recommendations

1. **Backend API**: Create a backend service to:
   - Automatically generate QR codes
   - Track subscription status
   - Process payments
   - Send QR codes via automated email

2. **Enhanced Security**:
   - Use stronger secret keys
   - Implement QR code expiration times
   - Add device fingerprinting
   - Use backend validation instead of local validation

3. **Automation**:
   - Automated payment processing
   - Automated QR code generation and email sending
   - Admin dashboard for subscription management

4. **Payment Integration**:
   - Integrate payment gateway (Stripe, PayPal, etc.)
   - Automatic fee calculation based on days passed
   - Receipt generation
