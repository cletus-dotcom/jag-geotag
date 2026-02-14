# Serial Key System Setup Guide

## Overview

The Serial Key System ensures that the app can only be installed once per device. Each device requires a unique serial key, and once a serial key is registered on a device, it cannot be used on another device. This prevents unauthorized distribution and ensures one installation per serial key.

## Key Features

- **One Serial Key Per Device**: Each device requires a unique serial key
- **Device Locking**: Once registered, a serial key is permanently locked to that specific device
- **Format Validation**: Serial keys follow a specific format (JAG-XXXX-XXXX-XXXX-XXXX)
- **Secure Storage**: Serial keys are stored locally with device ID validation
- **App Blocking**: App functionality is blocked until a valid serial key is entered

## How It Works

1. **First Launch**: When the app is first launched, it checks for a valid serial key
2. **No Serial Key**: If no serial key is found, the app displays the Serial Key input screen
3. **User Enters Key**: User enters the serial key provided by the administrator
4. **Device Registration**: The app validates the format, registers the key, and locks it to the device's unique ID
5. **App Activation**: Once registered, the app becomes fully functional
6. **Subsequent Launches**: On future launches, the app verifies the serial key matches the device ID

## Serial Key Format

- **Format**: `JAG-XXXX-XXXX-XXXX-XXXX`
- **Total Length**: 24 characters (including hyphens)
- **Example**: `JAG-A1B2-C3D4-E5F6-G7H8`
- **Characters**: Uppercase letters (A-Z) and numbers (2-9), excluding confusing characters (0, O, I, 1)

## Generating Serial Keys

### Using the Generator Script

1. **Navigate to project directory**:
   ```bash
   cd c:\python\jag_GeoTag
   ```

2. **Generate a single serial key**:
   ```bash
   node scripts/generateSerialKey.js
   ```

3. **Generate multiple serial keys**:
   ```bash
   node scripts/generateSerialKey.js 10
   ```
   This generates 10 serial keys at once.

### Example Output

```
═══════════════════════════════════════════════════════
  SERIAL KEY GENERATOR - Jag GeoTag
═══════════════════════════════════════════════════════

Generating 5 serial key(s)...

1. JAG-A1B2-C3D4-E5F6-G7H8
2. JAG-B2C3-D4E5-F6G7-H8I9
3. JAG-C3D4-E5F6-G7H8-I9J0
4. JAG-D4E5-F6G7-H8I9-J0K1
5. JAG-E5F6-G7H8-I9J0-K1L2

═══════════════════════════════════════════════════════
  IMPORTANT NOTES
═══════════════════════════════════════════════════════

• Each serial key can only be used ONCE per device
• Once registered on a device, the serial key is locked to that device
• Users need a NEW serial key for each additional device
• Serial key format: JAG-XXXX-XXXX-XXXX-XXXX
• Store these keys securely and distribute to users
═══════════════════════════════════════════════════════
```

## User Workflow

### First Installation

1. User installs the app on their device.
2. App launches and shows **Serial Number Required**: a short notice to get the serial number and a **Get Serial Number** button that opens the subscription gateway URL (payment portal).
3. User taps **Get Serial Number** → app opens the gateway (same URL as subscription renewal; first-install param `first_install=1` and amount 800 PHP).
4. User pays at the gateway and receives a serial key and/or QR code.
5. User returns to the app and either:
   - Taps **Enter key / Scan or upload QR** to open the activation screen, then:
     - **Enter** the serial key and tap **Activate with serial key**, or
     - **Scan QR Code** (camera) to scan the QR received after payment, or
     - **Upload QR Code** (pick image from gallery) if the gateway sent a QR image.
6. App validates the serial key or QR (serial-key format or subscription QR format) and activates.
7. App becomes fully functional.

### Installing on Another Device

1. User installs the app on a second device
2. App detects no serial key on this device
3. User needs to contact administrator for a **NEW** serial key
4. The previous serial key cannot be reused
5. User enters the new serial key
6. App registers the new key for this device

## Technical Details

### Device Identification

- **Android**: Uses `Application.getAndroidId()` - a unique ID that persists across app reinstalls
- **iOS**: Uses `Application.getInstallationIdAsync()` - a unique installation ID

### Storage

- **File**: `serial_key.json` in app's document directory
- **Contents**:
  ```json
  {
    "serialKey": "JAG-A1B2-C3D4-E5F6-G7H8",
    "deviceId": "abc123def456...",
    "hash": "A1B2C3D4E5F6...",
    "registeredAt": "2026-02-09T10:30:00.000Z"
  }
  ```

### Validation Process

1. **Format Check**: Validates `JAG-XXXX-XXXX-XXXX-XXXX` format
2. **Device ID Check**: Verifies the stored device ID matches current device
3. **Hash Validation**: Validates the cryptographic hash to prevent tampering

### Security Features

- **Device Locking**: Serial key is cryptographically bound to device ID
- **Hash Validation**: Prevents serial key tampering
- **One-Time Use**: Each serial key can only be registered once per device
- **Format Validation**: Strict format checking prevents invalid keys

## Admin Responsibilities

### Generating Serial Keys

1. Use the generator script to create serial keys
2. Store generated keys securely (database, spreadsheet, etc.)
3. Track which keys have been distributed
4. Keep a record of which device each key is assigned to

### Distributing Serial Keys

1. Provide serial key to user via secure channel (email, SMS, etc.)
2. Include instructions on how to enter the serial key
3. Inform user that each device needs a unique key

### Managing Keys

- **Track Distribution**: Keep records of which keys are assigned
- **Prevent Duplication**: Ensure each key is only given to one user/device
- **Monitor Usage**: Check if users report issues with key registration

## Troubleshooting

### "Invalid serial key format"

**Problem**: User entered serial key in wrong format

**Solution**: 
- Ensure format is exactly: `JAG-XXXX-XXXX-XXXX-XXXX`
- All letters must be uppercase
- Use only letters A-Z and numbers 2-9 (no 0, O, I, 1)

### "This device already has a serial key registered"

**Problem**: User trying to register a second serial key on the same device

**Solution**: 
- This is expected behavior - each device can only have one serial key
- If user needs to change the key, they must clear app data or reinstall

### "Serial key validation failed"

**Problem**: Device ID mismatch or hash validation failed

**Solution**:
- This usually means the device ID changed (rare)
- User may need to clear app data and re-register
- Contact administrator for a new serial key if needed

### Serial Key Not Working After App Reinstall

**Problem**: User reinstalled app and serial key no longer works

**Solution**:
- On Android: Android ID persists across reinstalls, so serial key should still work
- On iOS: Installation ID may change, requiring a new serial key
- User should contact administrator for a new serial key if needed

## Files Created/Modified

### New Files

- `src/services/serialKeyService.js` - Serial key validation and storage service
- `src/screens/SerialKeyScreen.js` - Serial key input UI screen
- `scripts/generateSerialKey.js` - Admin tool for generating serial keys
- `SERIAL_KEY_SETUP.md` - This documentation file

### Modified Files

- `src/screens/CameraScreen.js` - Added serial key checking before app functionality
- `package.json` - Added `expo-application` dependency

## Integration with Subscription System

The Serial Key System works in conjunction with the Subscription System:

1. **Serial Key Check** (First): App checks for valid serial key
2. **Subscription Check** (Second): If serial key is valid, app checks subscription status
3. **App Functionality**: Both must be valid for app to function

This ensures:
- Only authorized devices can use the app (Serial Key)
- Only active subscriptions can use the app (Subscription System)

## Production Recommendations

1. **Change Secret Key**: Update `SECRET_KEY` in `src/services/serialKeyService.js` to a secure, random value
2. **Secure Key Storage**: Store generated serial keys in a secure database
3. **Key Management**: Implement a system to track which keys are assigned and used
4. **User Support**: Provide clear instructions for users on how to obtain and enter serial keys
5. **Backup Strategy**: Keep backups of serial key assignments in case of data loss

## Testing

### Test Serial Key Registration

1. Clear app data or use a fresh emulator/device
2. Launch app - should show Serial Key screen
3. Generate a test key: `node scripts/generateSerialKey.js`
4. Enter the key in the app
5. Verify app activates and becomes functional

### Test Device Locking

1. Register a serial key on Device A
2. Try to use the same serial key on Device B
3. Should fail with "device already has a serial key" or similar error
4. Generate a new key for Device B
5. Verify Device B can register the new key

### Test Format Validation

1. Try entering invalid formats:
   - `jag-1234-5678-9012-3456` (lowercase)
   - `JAG-1234-5678` (too short)
   - `ABC-1234-5678-9012-3456` (wrong prefix)
2. Verify all are rejected with format error

## Important Notes

- ⚠️ **Secret Key**: Change `SECRET_KEY` in `serialKeyService.js` before production
- ⚠️ **Device ID Persistence**: Android IDs persist, but iOS installation IDs may change
- ⚠️ **One Key Per Device**: Each device can only have one serial key registered
- ⚠️ **Key Reuse**: Serial keys cannot be reused on different devices
- ⚠️ **Clear Data**: Users clearing app data will need to re-enter their serial key (if device ID persists)
