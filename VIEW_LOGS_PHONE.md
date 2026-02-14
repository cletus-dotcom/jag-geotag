# View Logs from Phone (APK Installed)

When your app is installed on a physical phone via APK, you can view console logs using Android Debug Bridge (ADB).

---

## Prerequisites

1. **USB Debugging enabled on your phone:**
   - Go to: Settings → About Phone
   - Tap "Build Number" 7 times (enables Developer Options)
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"
   - Enable "Stay Awake" (optional, helpful)

2. **ADB installed on your computer:**
   - Usually comes with Android Studio
   - Or download Android Platform Tools: https://developer.android.com/tools/releases/platform-tools

---

## Steps to View Logs

### Step 1: Connect Phone to Computer

1. Connect your phone to your computer via USB cable
2. On your phone, when prompted, tap "Allow USB Debugging" and check "Always allow from this computer"

### Step 2: Verify Connection

Open PowerShell and run:

```powershell
adb devices
```

You should see your device listed, like:
```
List of devices attached
ABC123XYZ    device
```

If you see "unauthorized", check your phone and allow USB debugging.

### Step 3: View Logs

**Option A: View all React Native/JavaScript logs:**

```powershell
adb logcat | Select-String -Pattern "ReactNativeJS|console|ExpoModules"
```

**Option B: View only your app's logs:**

```powershell
adb logcat | Select-String -Pattern "com.jag.geotag"
```

**Option C: View logs in real-time (filtered):**

```powershell
adb logcat -s ReactNativeJS:* *:S
```

This shows only React Native JavaScript logs.

---

## What You'll See

When you take a photo, you should see messages like:

```
ReactNativeJS: Logo resized to 10x10px
ReactNativeJS: Logo resize failed, logo may appear larger: [error message]
```

---

## Alternative: Add In-App Log Viewer (For Future)

If you want to see logs directly in the app without USB, you could add a debug screen that displays recent logs. This requires modifying the app code to store log messages.

---

## Troubleshooting

**"adb: command not found"**
- Add Android SDK Platform Tools to your PATH
- Or use full path: `C:\Users\YourName\AppData\Local\Android\Sdk\platform-tools\adb.exe`

**"device offline"**
- Disconnect and reconnect USB cable
- Revoke USB debugging authorization on phone, then reconnect
- Try a different USB cable/port

**No logs appearing**
- Make sure the app is running on your phone
- Try: `adb logcat -c` (clear logs), then take a photo
- Check if logs are being filtered out - try: `adb logcat` (no filters)

---

## Quick Script

I've created `view-logs-phone.ps1` - run it while your phone is connected:

```powershell
cd c:\python\jag_GeoTag
.\view-logs-phone.ps1
```
