# Publish Jag GeoTag to Google Play Store

This guide walks you through publishing your app to Google Play (Android).

---

## Prerequisites

1. **Google Play Developer account** – one-time **$25 USD** registration  
   - Sign up: https://play.google.com/console/signup  
   - Use the same Google account you’ll use for Play Console.

2. **Expo / EAS** – you already have `eas.json` and a linked project.

3. **App ready for release** – version and package name set in `app.json` (e.g. `version`, `android.package`).

---

## Step 1: Build a production Android App Bundle (AAB)

Google Play requires an **Android App Bundle** (`.aab`), not an APK, for new apps.

In your project folder:

```bash
# Install EAS CLI if needed
npm install -g eas-cli

# Log in to Expo (if not already)
eas login

# Build production AAB for Google Play
eas build --platform android --profile production
```

- Build runs on Expo’s servers.  
- When it finishes, you get a **download link** for the `.aab` file.  
- Download and keep the `.aab`; you’ll upload it in Play Console.

**Optional:** To also build an APK for direct install (e.g. testing), you can add a separate profile in `eas.json` (e.g. `production-apk`) with `"buildType": "apk"` and run `eas build --platform android --profile production-apk`.

---

## Step 2: Create the app in Google Play Console

1. Go to **Google Play Console**: https://play.google.com/console  
2. Click **“Create app”**.  
3. Fill in:
   - **App name:** Jag GeoTag  
   - **Default language**  
   - **App or game:** App  
   - **Free or paid:** Free (or Paid, if you choose)  
4. Accept declarations (e.g. policies, export laws) and create the app.

---

## Step 3: Complete “Set up your app” in Play Console

In the left menu, open **“Set up your app”** (or **“Release” → “Setup”**) and complete:

- **App access:** e.g. “All functionality is available without restrictions” (or add login details if you have any).  
- **Ads:** Say “No” if the app has no ads.  
- **Content rating:** Complete the questionnaire (e.g. camera, location, no sensitive content) and submit to get a rating.  
- **Target audience:** Choose age groups (e.g. 13+ or 18+).  
- **News app:** Select “No” if it’s not a news app.  
- **COVID-19 contact tracing:** “No” for this app.  
- **Data safety:** Declare what data you collect (e.g. location, photos) and how you use it.  
- **Government apps:** “No” unless it’s a government app.

---

## Step 4: Store listing

Under **“Grow” → “Store presence” → “Main store listing”** (or “Store listing” in older UI):

- **Short description** (max 80 characters): e.g.  
  `Take photos with GPS: date, time, latitude, longitude, and accuracy.`
- **Full description** (max 4000 characters): explain features (geo-tagging, offline, save to phone, KMZ export, etc.).
- **App icon:** 512 x 512 px PNG (you can use `src/jagna_logo.png` resized to 512x512).
- **Feature graphic:** 1024 x 500 px (optional but recommended).
- **Screenshots:** At least 2 phone screenshots (e.g. camera screen, gallery screen). Use an emulator or device to capture.

Save the store listing.

---

## Step 5: Upload the AAB and create a release

1. In Play Console go to **“Release” → “Production”** (or “Testing” → “Internal testing” to test first).  
2. Click **“Create new release”**.  
3. **Upload** the `.aab` you downloaded from EAS.  
4. **Release name:** e.g. `1.0.0 (1)`.  
5. **Release notes:** Short description of what’s in this version (e.g. “Initial release – geo-tagged photos with date, time, coordinates, accuracy”).  
6. Click **“Save”** then **“Review release”**.  
7. Fix any errors (e.g. signing, permissions).  
8. Click **“Start rollout to Production”** (or “Start rollout to Internal testing” if you chose testing).

---

## Step 6: After submission

- **Review:** Google usually reviews within a few days. You’ll get an email when the app is approved or if changes are requested.  
- **Updates:** For future versions, bump `version` (and optionally `versionCode`/`android.versionCode` in `app.json` if you use it), run `eas build --platform android --profile production` again, then create a new release in Play Console and upload the new AAB.

---

## Quick reference

| Item              | Where / What |
|-------------------|--------------|
| Build AAB         | `eas build --platform android --profile production` |
| Play Console      | https://play.google.com/console |
| Developer fee     | $25 one-time |
| Production format | Android App Bundle (`.aab`) – already set in `eas.json` |

---

## Troubleshooting

- **“You need to use a different package name”**  
  Your `android.package` in `app.json` is already `com.jag.geotag`. If that’s taken, change it (e.g. `com.yourname.jaggeotag`) and rebuild.

- **Signing errors**  
  EAS Build signs the AAB for you. Don’t re-sign the downloaded AAB; upload it as-is.

- **Permissions / Data safety**  
  Declare camera, location, and storage (photos) in the Data safety form and in the store listing so users see what the app uses.

Once your first production release is rolled out, the app will appear on Google Play for users to install.
