# Build Standalone App (No Laptop Connection Needed)

This guide shows how to build a **standalone APK** that you can install directly on your Android phone. Once installed, the app works **completely offline** - no laptop, no internet, no Expo Go needed.

---

## Option 1: Build Locally (Fully Offline) ✅

This builds the APK on your computer. No internet needed after setup.

### Prerequisites

1. **Android Studio** installed (for Android SDK)
   - Download: https://developer.android.com/studio
   - Install Android SDK, Android SDK Platform-Tools, and accept licenses

2. **Java JDK** (usually comes with Android Studio)

3. **EAS CLI** installed:
   ```powershell
   npm install -g eas-cli
   ```

### Steps

1. **Login to Expo** (one-time, free account):
   ```powershell
   eas login
   ```
   (Create account at https://expo.dev/signup if needed)

2. **Configure EAS** (if not already done):
   ```powershell
   cd c:\python\jag_GeoTag
   eas build:configure
   ```
   This creates/updates `eas.json` (already created for you).

3. **Build APK locally**:
   ```powershell
   eas build --platform android --profile preview --local
   ```

   **Note:** First build takes 10-30 minutes. It downloads Android SDK components if needed.

4. **Find your APK:**
   - The APK will be in: `c:\python\jag_GeoTag\android\app\build\outputs\apk\release\app-release.apk`
   - Or check the terminal output for the exact path

5. **Install on phone:**
   - Transfer the APK to your phone (USB, email, cloud, etc.)
   - On phone: Settings → Security → Enable "Install from Unknown Sources"
   - Open the APK file and install

---

## Option 2: Build with EAS Cloud (Easier, Needs Internet)

EAS builds the APK in the cloud. You just download and install.

### Steps

1. **Login:**
   ```powershell
   eas login
   ```

2. **Build APK:**
   ```powershell
   cd c:\python\jag_GeoTag
   eas build --platform android --profile preview
   ```

3. **Wait for build** (5-15 minutes):
   - Check status: https://expo.dev/accounts/[your-username]/builds
   - Or wait for email notification

4. **Download APK:**
   - Click the build link in the dashboard
   - Download the `.apk` file

5. **Install on phone:**
   - Transfer APK to phone
   - Enable "Install from Unknown Sources" in phone settings
   - Open APK and install

---

## Option 3: Build with React Native CLI (Advanced, Fully Offline)

This uses React Native's build tools directly. No EAS needed.

### Prerequisites

- Android Studio with Android SDK installed
- Java JDK
- Environment variables set:
  - `ANDROID_HOME` = path to Android SDK (e.g., `C:\Users\YourName\AppData\Local\Android\Sdk`)
  - Add to PATH: `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\tools`

### Steps

1. **Generate native Android project:**
   ```powershell
   cd c:\python\jag_GeoTag
   npx expo prebuild --platform android
   ```

2. **Build APK:**
   ```powershell
   cd android
   .\gradlew assembleRelease
   ```

3. **Find APK:**
   - `android\app\build\outputs\apk\release\app-release.apk`

4. **Install on phone** (same as above)

---

## Quick Comparison

| Method | Internet Needed? | Speed | Difficulty |
|--------|------------------|-------|------------|
| **EAS Cloud** | Yes (for build) | Fast (5-15 min) | Easy ⭐ |
| **EAS Local** | No (after setup) | Slow (10-30 min) | Medium ⭐⭐ |
| **React Native CLI** | No | Medium (5-10 min) | Hard ⭐⭐⭐ |

---

## Recommended: EAS Cloud Build

**Easiest option:**

```powershell
eas login
eas build --platform android --profile preview
```

Then download the APK from the Expo dashboard and install on your phone.

---

## After Installation

Once the APK is installed:
- ✅ App works **completely offline**
- ✅ No laptop needed
- ✅ No Expo Go needed
- ✅ GPS and camera work normally
- ✅ Photos saved to phone storage

The app is now a **standalone Android app** that runs independently!

---

## Troubleshooting

**"eas: command not found"**
- Run: `npm install -g eas-cli`

**"Android SDK not found"**
- Install Android Studio
- Set `ANDROID_HOME` environment variable

**"Build failed"**
- Check `eas.json` exists
- Run `eas build:configure` again
- Check Expo account is logged in: `eas whoami`

---

## Next Steps

After building and installing:
1. Open the app on your phone
2. Grant camera and location permissions
3. Take a geo-tagged photo!
4. Check Gallery tab to see your photos

The app is now **yours** - no laptop connection needed! 🎉
