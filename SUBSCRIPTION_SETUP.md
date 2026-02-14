# Subscription System Setup - Gateway & QR Code

The app includes a subscription/licensing system that requires renewal every 30 days. When expired, the app shows renewal instructions and a **Subscription Renewal** button that opens your gateway portal (e.g. payment app or web page). After payment in the gateway, users can scan a QR code to reactivate the app.

## Overview

- **30-day cycle**: Subscription must be renewed every 30 days.
- **Expired startup**: When the app starts and subscription is expired, it does not function; it shows:
  1. **Instructions**: (1) Click the Subscription Renewal button below. (2) Follow the instructions in the renewal gateway.
  2. **Subscription Renewal button**: Opens the gateway portal (URL or app link you configure).
- **Gateway**: You build a separate gateway app/portal for payment; link it in config (see below).
- **QR code**: After completing renewal in the gateway, user can return to the app and tap **Scan QR Code** to activate.

## Key Features

- **30-day approval cycle**: Subscription must be renewed every 30 days
- **Renewal gateway**: Subscription Renewal button opens your gateway portal (configurable URL)
- **App blocking**: App does not function when subscription is expired; startup shows instructions and renewal button
- **QR code activation**: After payment in gateway, user scans QR code in the app to activate
- **Automatic resumption**: After successful QR code validation, the app resumes full functionality

## Setup Instructions

### 1. Configure Renewal Gateway URL

Set the base URL that the **Subscription Renewal** button opens (your gateway portal or app deep link):

**File:** `src/config/subscriptionGateway.js`

```javascript
export const SUBSCRIPTION_RENEWAL_GATEWAY_URL = 'https://your-gateway.com/renewal';
```

- Use an **https** URL for a web gateway, or a **custom URL scheme** (e.g. `myapp://renewal`) if your gateway is a separate app.
- When the user taps **Subscription Renewal**, the app **calculates the due amount** and **sends data via URL query parameters** (see below). Your gateway should read these params to show the amount and process payment.

#### Due amount calculation

- **Formula:** 800 pesos per month + days elapsed amount `(800/30 × days passed after expiration)`.
- **Example:** Expired 5 days ago → due = 800 + (800/30 × 5) = 800 + 133.33 = **933.33 PHP**.

Pricing constants (editable in `src/config/subscriptionGateway.js`):

- `PRICE_PER_MONTH_PESOS` = 800  
- `SUBSCRIPTION_PERIOD_DAYS` = 30  

#### Data sent to the gateway (query parameters)

When opening the renewal URL, the app appends:

| Parameter       | Example    | Description                          |
|----------------|------------|--------------------------------------|
| `amount`       | 933.33     | Total due amount (PHP)               |
| `currency`     | PHP        | Currency code                        |
| `days_passed`  | 5          | Days since subscription expired      |
| `expiry_date`  | ISO date   | Subscription expiry date             |
| `base_amount`  | 800        | Base 800 PHP for the month           |
| `elapsed_amount` | 133.33   | (800/30) × days_passed               |

**Example full URL:**

`https://your-gateway.com/renewal?amount=933.33&currency=PHP&days_passed=5&expiry_date=2026-02-01T00%3A00%3A00.000Z&base_amount=800&elapsed_amount=133.33`

Your gateway portal should read these query parameters and display/charge the `amount` (in `currency`).

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
2. **App Blocking**: When expired, the app does not function. On startup it shows:
   - A notification with **Subscription renewal instructions**: (1) Click the Subscription Renewal button below. (2) Follow the instructions in the renewal gateway.
   - **Subscription Renewal** button: Opens the gateway portal (payment/renewal flow)
   - **Scan QR Code** button: For use after completing renewal in the gateway
   - **Check Status** button: Re-checks subscription (e.g. after scanning QR)
3. **User Action**: User taps **Subscription Renewal** → follows instructions in gateway → after payment, returns to app and taps **Scan QR Code** to activate (or gateway may deep-link back with activation)

### Approval Workflow

#### Step 1: User Opens Renewal Gateway

When subscription is expired:
- User sees instructions and taps **Subscription Renewal**
- App opens the gateway URL (your separate gateway app or web portal)
- User follows instructions in the gateway (e.g. payment, login)

#### Step 2: Admin / Gateway Provides QR Code

After payment in the gateway, the user needs a QR code to activate the app:
- If your gateway app generates QR codes, show the QR to the user
- Or use the admin scripts to generate a QR code and deliver it via your gateway
- Admin script (if needed):

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

This creates a PNG file in `qr_codes/` folder.

**Option C: Custom Date**
```bash
node scripts/generateQRCode.js 2026-02-12
```

#### Step 3: User Receives QR Code

Gateway or admin sends or shows the QR code to the user (e.g. in gateway app, in person, or other channel).

#### Step 4: User Scans QR Code in App

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
  "approvedViaQR": true,
  "qrCodeUsed": "JAG-1736726400000-A1B2C3D4"
}
```

**Fields:**
- `isApproved`: Boolean indicating if subscription is approved
- `lastApprovedDate`: ISO date string of last approval
- `nextCheckDate`: ISO date string when subscription expires (30 days from approval)
- `approvedViaQR`: Boolean indicating if approved via QR code
- `qrCodeUsed`: The QR code that was used for approval

**Used QR Codes Storage:**
```
{FileSystem.documentDirectory}/qr_codes.json
```

Stores list of used QR codes to prevent reuse (keeps last 100 codes).

## Payment Calculation Guide

Admins can calculate renewal fees based on days since last subscription (e.g. from user contact or records):

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

1. **User contacts admin**: User requests renewal when subscription expires
2. **Calculate Fee**: Based on your pricing structure and days since last subscription
3. **Process Payment**: Collect payment from user
4. **Generate QR Code**: After payment confirmation
5. **Send QR Code**: Provide QR code to user (in person, messaging, etc.)

## Testing the System

### Test Subscription Expiry

1. **Simulate Expiration**: Manually edit `subscription.json`:
   ```json
   {
     "nextCheckDate": "2026-01-01T00:00:00.000Z"
   }
   ```

2. **Open App**: App should show subscription expired screen

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

## Files Created

- `src/config/subscriptionGateway.js` - Renewal gateway URL (link for Subscription Renewal button)
- `src/services/subscriptionService.js` - Subscription management service
- `src/utils/qrCodeGenerator.js` - QR code generation and validation
- `src/screens/QRScannerScreen.js` - QR code scanner screen component
- `scripts/generateQRCode.js` - Admin tool to generate QR codes (text output)
- `scripts/generateQRCodeWithImage.js` - Admin tool to generate QR code images (PNG)
- `QR_CODE_GUIDE.md` - Quick reference guide for QR codes

## Files Modified

- `src/screens/CameraScreen.js` - Subscription expired screen: instructions, Subscription Renewal button (opens gateway), QR scanner, Check Status
- `package.json` - Added `expo-crypto` dependency (for QR code validation)

## Important Notes

- **Subscription Check**: Happens on app launch and every minute while app is active
- **First-Time Users**: Get 30 days free (initialized as approved)
- **Graceful Degradation**: System allows app to function if subscription check fails (for development)
- **QR Code Security**: Change secret keys for production use
- **Payment**: Payment and renewal flow is manual (user contacts admin; admin generates QR after payment)

## Production Recommendations

1. **Backend API**: Create a backend service to:
   - Automatically generate QR codes
   - Track subscription status
   - Process payments
   - Deliver QR codes to users (e.g. in-app, messaging, or other channel)

2. **Enhanced Security**:
   - Use stronger secret keys
   - Implement QR code expiration times
   - Add device fingerprinting
   - Use backend validation instead of local validation

3. **Automation**:
   - Automated payment processing
   - Automated QR code generation
   - Admin dashboard for subscription management

4. **Payment Integration**:
   - Integrate payment gateway (Stripe, PayPal, etc.)
   - Automatic fee calculation based on days passed
   - Receipt generation
