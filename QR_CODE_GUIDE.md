# QR Code Approval System - Quick Guide

## Overview

The app uses QR code-based approval for subscription activation. When a subscription expires, users contact the administrator for a QR code; admins generate and provide a unique QR code that users scan to activate their subscription.

## Workflow

1. **User**: Subscription expires → User contacts admin for renewal
2. **Admin**: Generates QR code → Sends or shows QR code to user (in person, messaging, etc.)
3. **User**: Opens app → Taps "📷 Scan QR Code" → Scans code → Subscription activated

## Generating QR Codes

### Quick Method (Text Output)

```bash
node scripts/generateQRCode.js
```

This outputs a code like: `JAG-1736726400000-A1B2C3D4`

Copy this code and paste it into an online QR generator:
- https://www.qr-code-generator.com/
- https://www.the-qrcode-generator.com/

### Advanced Method (PNG Image)

First install:
```bash
npm install qrcode
```

Then generate:
```bash
node scripts/generateQRCodeWithImage.js
```

This creates a PNG file in `qr_codes/` folder that you can send or show to the user.

### Custom Date

To generate a QR code for a specific subscription period:

```bash
node scripts/generateQRCode.js 2026-02-12
```

## QR Code Format

Format: `JAG-{timestamp}-{hash}`

- **JAG**: Prefix (always)
- **timestamp**: Unix timestamp in milliseconds
- **hash**: 8-character SHA-256 hash

Example: `JAG-1736726400000-A1B2C3D4`

## Security

- Each QR code is unique to a subscription period
- QR codes can only be used once
- Codes are cryptographically signed with a secret key
- Codes expire after 35 days (5-day grace period)

## Important Configuration

**Secret Key**: Must match in both files:
- `src/utils/qrCodeGenerator.js` (line 9)
- `scripts/generateQRCode.js` (line 7)

Change both if you want a custom secret key.

## Troubleshooting

**QR code not scanning?**
- Ensure good lighting
- Hold phone steady
- Make sure QR code is clear and not distorted
- Check that code format matches: `JAG-timestamp-hash`

**"QR code already used" error?**
- Each QR code can only be used once
- Generate a new QR code for the user

**"Invalid QR code" error?**
- Code may be expired (check timestamp)
- Code may be for wrong subscription period
- Secret key mismatch between generator and app

## Testing

1. Generate a QR code: `node scripts/generateQRCode.js`
2. Create QR image using online generator
3. Display QR code on another device or print it
4. Open app on phone and scan the QR code
5. Verify subscription is activated
