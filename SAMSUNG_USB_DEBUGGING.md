# Enable USB Debugging on Samsung Galaxy A42

Follow these steps to enable USB debugging on your Samsung Galaxy A42:

---

## Step 1: Enable Developer Options

1. **Open Settings** on your phone
2. Scroll down and tap **"About phone"** (or "About device")
3. Find **"Software information"** and tap it
4. Find **"Build number"** (usually at the bottom)
5. **Tap "Build number" 7 times** in quick succession
   - You'll see a message like "You are now a developer!" after 4-5 taps
   - Keep tapping until you see "Developer mode has been turned on"

---

## Step 2: Enable USB Debugging

1. **Go back to Settings** (press back button)
2. Scroll down and you'll now see **"Developer options"** (it wasn't there before!)
3. Tap **"Developer options"**
4. Toggle **"Developer options"** ON at the top (if it's not already on)
5. Scroll down and find **"USB debugging"**
6. Toggle **"USB debugging"** ON
7. A warning popup will appear - tap **"OK"** or **"Allow"**

---

## Step 3: Additional Settings (Recommended)

While in Developer Options, also enable:

- **"Stay awake"** - Keeps screen on while charging (helpful for debugging)
- **"USB debugging (Security settings)"** - Allows debugging even when screen is locked (optional)

---

## Step 4: Connect to Computer

1. Connect your Galaxy A42 to your computer via USB cable
2. On your phone, you'll see a popup: **"Allow USB debugging?"**
3. Check the box: **"Always allow from this computer"**
4. Tap **"Allow"** or **"OK"**

---

## Step 5: Verify Connection

On your computer, open PowerShell and run:

```powershell
adb devices
```

You should see:
```
List of devices attached
ABC123XYZ    device
```

(ABC123XYZ will be your phone's serial number)

---

## Troubleshooting

**"Developer options" not appearing:**
- Make sure you tapped "Build number" 7 times completely
- Try restarting your phone
- Some Samsung phones: Settings → About phone → Software information → Build number

**"USB debugging" option is grayed out:**
- Make sure "Developer options" toggle is ON at the top
- Some Samsung phones require you to unlock the phone first

**Computer not detecting phone:**
- Try a different USB cable (use a data cable, not just charging cable)
- Try a different USB port on your computer
- On phone: Settings → Developer options → "Revoke USB debugging authorizations" → try again
- Install Samsung USB drivers: https://developer.samsung.com/mobile/android-usb-driver.html

**"Unauthorized" in adb devices:**
- Check your phone screen - you should see "Allow USB debugging?" popup
- Tap "Allow" and check "Always allow from this computer"
- If popup doesn't appear: Settings → Developer options → "Revoke USB debugging authorizations" → reconnect

**Samsung-specific:**
- Some Samsung phones have "USB configuration" - set it to "File Transfer" or "MTP"
- Settings → Developer options → "Default USB configuration" → Select "File Transfer (MTP)"

---

## Once Connected

After USB debugging is enabled and phone is connected:

```powershell
cd c:\python\jag_GeoTag
.\view-logs-phone.ps1
```

Or manually:
```powershell
adb logcat -s ReactNativeJS:* *:S
```

Then take a photo in your app to see the console logs!

---

## Quick Reference

**Path to Developer Options:**
Settings → Developer options → USB debugging

**Path if Developer Options hidden:**
Settings → About phone → Software information → Build number (tap 7 times)
