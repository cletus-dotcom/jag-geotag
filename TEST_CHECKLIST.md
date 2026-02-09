# Jag GeoTag – Testing Checklist

## Server status

The Expo dev server is running at **http://localhost:8081**.

In your terminal you should see:
- A **QR code**
- Text like: `Metro waiting on exp://192.168.x.x:8081` (your IP may differ)
- "Logs for your project will appear below"

---

## Step 1: Open the app on your phone

### Android
1. Install **Expo Go** from Google Play (if you haven’t).
2. Open **Expo Go**.
3. Tap **“Scan QR code”**.
4. Scan the QR code in the terminal (or in the browser tab that opened).
5. Wait for the app to load (first time can take 30–60 seconds).

### iPhone
1. Install **Expo Go** from the App Store (if you haven’t).
2. Open the **Camera** app.
3. Point it at the QR code in the terminal.
4. Tap the banner that appears to open in Expo Go.
5. Wait for the app to load.

**Same Wi‑Fi:** Phone and computer must be on the same Wi‑Fi network.

---

## Step 2: Grant permissions

When the app opens:

1. **Camera** – tap **Allow** (needed to take photos).
2. **Location** – tap **Allow** or **While Using the App** (needed for latitude, longitude, accuracy).

If you already denied something, open your phone **Settings → Apps → Expo Go** (or **Jag GeoTag**) and enable Camera and Location.

---

## Step 3: Test the Camera tab

- [ ] You see the **camera preview** (not a black screen).
- [ ] Tap the **white circular button** at the bottom to take a photo.
- [ ] A **“Last photo”** panel appears at the top with:
  - [ ] **Date & time**
  - [ ] **Latitude** (e.g. `12.345678`)
  - [ ] **Longitude** (e.g. `98.765432`)
  - [ ] **Accuracy** (e.g. `5 m` or `12 m`)
- [ ] Take 2–3 more photos and confirm the panel updates each time.

**If you see “Location permission is required”:**  
Grant location permission in phone Settings and try again.

---

## Step 4: Test the Gallery tab

- [ ] Tap the **Gallery** tab at the bottom.
- [ ] You see a list of the photos you just took (or “No geo-tagged photos yet” if you haven’t taken any).
- [ ] Each row shows:
  - [ ] Thumbnail
  - [ ] Date/time
  - [ ] Latitude, longitude
  - [ ] Accuracy
- [ ] **Tap a photo** – a detail view opens with full date/time, lat, long, accuracy.
- [ ] Tap **“Delete photo”** on one photo and confirm it disappears from the list (optional).

---

## Step 5: Offline test (optional)

- [ ] Turn **airplane mode ON** (or turn off Wi‑Fi and mobile data).
- [ ] Take a new photo.
- [ ] You should still get **latitude, longitude, accuracy** (GPS works without internet).
- [ ] Turn connectivity back on.

---

## If something fails

| Problem | What to try |
|--------|-------------|
| QR code won’t scan | Same Wi‑Fi for phone and PC; in Expo Go use “Enter URL manually” and type the `exp://...` URL from the terminal. |
| “Unable to connect” | Firewall may be blocking port 8081; allow Node/Metro in Windows Firewall. |
| Black camera screen | Grant camera permission; fully close and reopen the app. |
| No location / “Permission denied” | Grant location permission; enable “Location” (and optionally “Precise”) in app settings. |
| App crashes on open | In terminal, check for red errors; run `npx expo start --clear` and try again. |
| “expo-asset” or similar error | Run: `npx expo install expo-asset` (already done once). |

---

## Quick reference

- **Restart dev server:** In the terminal where Expo is running, press `Ctrl+C`, then run `npx expo start` again.
- **Reload app:** Shake the device (or press `r` in the terminal) to reload.
- **Logs:** Red errors and yellow warnings will show in the terminal and in the Expo Go app.

---

When you’ve gone through the list, you can say which step failed (if any) and we can fix it.
