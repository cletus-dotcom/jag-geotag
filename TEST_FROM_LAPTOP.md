# How to Test the App From Your Laptop

You have **3 ways** to run and test Jag GeoTag from your laptop.

---

## Option 1: Run in the browser (quickest, limited)

Good for checking that the app loads and the UI works. **Camera and GPS are limited** in the browser.

### Steps

1. **Start the web dev server:**
   ```powershell
   cd c:\python\jag_GeoTag
   npm run web
   ```

2. A browser tab opens (e.g. **http://localhost:8081** or **http://localhost:19006**).

3. **What you can test:**
   - Tabs (Camera, Gallery)
   - Navigation and layout
   - **Camera:** May use your laptop webcam if the browser allows
   - **Location:** May ask for browser location (approximate)
   - **Taking a photo:** Might work with webcam; logo overlay may not match the phone

**Limitation:** This is not the full phone experience. For real camera + GPS + logo on photo, use a phone or Android emulator.

---

## Option 2: Android emulator (full test on laptop)

Use an **Android emulator** so you can take photos and use location **on your laptop** without a physical phone.

### Prerequisites

- **Android Studio** installed: https://developer.android.com/studio  
- An **Android Virtual Device (AVD)** created in Android Studio (e.g. Pixel 6, API 34).

### Steps

1. **Open Android Studio** → **Device Manager** → start an emulator (e.g. Pixel 6).

2. **In a terminal:**
   ```powershell
   cd c:\python\jag_GeoTag
   npx expo run:android
   ```

3. The app builds and opens **inside the emulator**.

4. **In the emulator:**
   - **Camera:** Uses a virtual camera (or your webcam if configured). You can take test photos.
   - **Location:** Set a fake location in the emulator: **Extended controls** (⋯) → **Location** → enter latitude/longitude or load a GPX file.

5. **Take a photo:** Open the Camera tab, allow camera/location if asked, and tap the capture button. You should see the logo overlay and the “Last photo” preview.

**First run:** The build can take 5–15 minutes. Later runs are faster.

---

## Option 3: Phone (real camera + GPS)

Best for real-world testing. The app runs on your **phone**; the laptop only runs the dev server (or you use a built APK).

### A) With Expo Go (phone + laptop on same Wi‑Fi)

1. **On laptop:** Start the server with your LAN IP:
   ```powershell
   cd c:\python\jag_GeoTag
   npm run start:lan
   ```

2. **On phone:** Install **Expo Go**, then connect using the **exp://...** URL from the terminal (e.g. **Enter URL manually** → `exp://192.168.1.100:8081`).

3. **On phone:** Open the app → Camera tab → allow Camera and Location → take a photo.

If you see “Failed to download remote update”, follow **FIX_CONNECTION_ERROR.md** or **CONNECT_PHONE_NOW.md** (firewall, same Wi‑Fi, correct URL).

### B) With standalone APK (no laptop needed after install)

1. **On laptop:** Build an APK (one time):
   ```powershell
   eas login
   eas build --platform android --profile preview
   ```

2. **Download the APK** from the Expo dashboard and install it on your Android phone.

3. **On phone:** Open “Jag GeoTag” like a normal app. No Expo Go, no laptop. Take photos with camera and GPS as usual.

---

## Summary

| Method              | Where it runs | Camera        | Location      | Best for              |
|---------------------|---------------|---------------|---------------|------------------------|
| **Browser**         | Laptop        | Webcam (maybe)| Browser GPS   | Quick UI check         |
| **Android emulator**| Laptop        | Virtual/webcam| Set in emulator | Full test on laptop  |
| **Phone (Expo Go)** | Phone         | Real          | Real GPS      | Real device, dev mode  |
| **Phone (APK)**     | Phone         | Real          | Real GPS      | Real device, no laptop |

---

## Quick commands (from laptop)

```powershell
cd c:\python\jag_GeoTag

# 1) Test in browser (quick)
npm run web

# 2) Test in Android emulator (start emulator first)
npx expo run:android

# 3) Start server for phone (then connect from Expo Go)
npm run start:lan
```

**To actually take a photo and see the logo:** use **Option 2 (emulator)** or **Option 3 (phone)**. **Option 1 (browser)** is mainly for UI and flow.
