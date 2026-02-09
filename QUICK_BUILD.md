# Quick Guide: Build Standalone APK

Build an APK you can install directly on your phone. **No laptop connection needed after installation.**

---

## Easiest Method: EAS Cloud Build (Recommended)

### Step 1: Install EAS CLI
```powershell
npm install -g eas-cli
```

### Step 2: Login to Expo
```powershell
eas login
```
(Create free account at https://expo.dev/signup if needed)

### Step 3: Initialize EAS (if needed)
```powershell
cd c:\python\jag_GeoTag
eas init
```
(Choose "Create a new project" if prompted)

### Step 4: Build APK
```powershell
eas build --platform android --profile preview
```

### Step 5: Wait & Download
- Build takes **5-15 minutes**
- Check: https://expo.dev/accounts/[your-username]/builds
- Download the `.apk` file when ready

### Step 6: Install on Phone
1. Transfer APK to phone (USB, email, cloud, etc.)
2. On phone: **Settings → Security → Enable "Install from Unknown Sources"**
3. Open the APK file → **Install**

---

## Done! 🎉

Once installed:
- ✅ App works **completely offline**
- ✅ No laptop needed
- ✅ No Expo Go needed
- ✅ GPS and camera work normally
- ✅ Photos saved to phone storage

---

## Alternative: Build Locally (No Internet After Setup)

If you want to build without internet:

```powershell
# Install Android Studio first: https://developer.android.com/studio
# Then:
eas build --platform android --profile preview --local
```

APK will be in: `android\app\build\outputs\apk\release\app-release.apk`

---

**Full guide:** See `BUILD_STANDALONE_APP.md` for detailed instructions.
