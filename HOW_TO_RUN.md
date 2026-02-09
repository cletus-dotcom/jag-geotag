# How to Run Jag GeoTag App

## Prerequisites

Before running the app, make sure you have:

1. **Node.js** installed (version 18 or later)
   - Check: Open terminal and run `node --version`
   - Download: https://nodejs.org/

2. **npm** (comes with Node.js)
   - Check: Run `npm --version`

3. **Expo Go app** on your phone (for testing on a real device)
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

**Important:** Camera and GPS require a **real device**. They don't work properly in simulators/emulators.

---

## Step-by-Step Instructions

### Step 1: Install Dependencies

Open a terminal/command prompt in the project folder:

```bash
cd c:\python\jag_GeoTag
npm install
```

This will install all required packages (Expo, React Native, camera, location, etc.).

**Expected output:** You should see packages being installed. Wait until it finishes (may take 2-5 minutes).

---

### Step 2: Start the Development Server

Run:

```bash
npm start
```

**What happens:**
- Expo Metro bundler starts
- A QR code appears in the terminal
- A browser window opens with Expo DevTools (optional)

**Expected output:**
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

---

### Step 3: Run on Your Phone

#### Option A: Android Phone

1. **Install Expo Go** from Google Play Store (if not already installed)

2. **Open Expo Go** app on your phone

3. **Scan the QR code** from the terminal:
   - In Expo Go, tap "Scan QR code"
   - Point your camera at the QR code in the terminal
   - OR use the "Connect via LAN" option and enter the URL shown

4. **Wait for the app to load** (first time may take 30-60 seconds)

5. **Grant permissions** when prompted:
   - ✅ **Camera** - Allow
   - ✅ **Location** (While Using the App) - Allow

#### Option B: iOS Phone (iPhone/iPad)

1. **Install Expo Go** from App Store (if not already installed)

2. **Open the Camera app** on your iPhone

3. **Scan the QR code** from the terminal:
   - Point your iPhone camera at the QR code
   - Tap the notification that appears
   - It will open in Expo Go

4. **Wait for the app to load**

5. **Grant permissions** when prompted:
   - ✅ **Camera** - Allow
   - ✅ **Location** (While Using the App) - Allow

---

### Step 4: Test the App

Once the app loads on your phone:

1. **Camera Tab** (default):
   - You should see the camera preview
   - Tap the white circular button at the bottom to take a photo
   - The app will:
     - Get your current GPS location
     - Capture the photo
     - Display date, time, latitude, longitude, and accuracy

2. **Gallery Tab**:
   - Tap the "Gallery" tab at the bottom
   - See all your geo-tagged photos
   - Tap any photo to see full details
   - Swipe down to refresh

---

## Troubleshooting

### Problem: `npm install` fails

**Solution:**
- Make sure Node.js is installed: `node --version`
- Try clearing npm cache: `npm cache clean --force`
- Delete `node_modules` folder and `package-lock.json`, then run `npm install` again

### Problem: `npm start` shows "command not found" or "expo not found"

**Solution:**
- Make sure you ran `npm install` first
- Try: `npx expo start` instead of `npm start`

### Problem: QR code doesn't scan

**Solution:**
- Make sure your phone and computer are on the **same Wi-Fi network**
- Try typing the URL manually in Expo Go (shown in terminal)
- For Android: Use "Connect via LAN" option in Expo Go
- For iOS: Make sure you're using the Camera app, not Expo Go's scanner

### Problem: Camera doesn't work / shows black screen

**Solution:**
- Make sure you granted **Camera permission**
- Close and reopen the app
- Make sure you're using a **real device** (not emulator/simulator)

### Problem: Location shows "Permission denied" or no coordinates

**Solution:**
- Make sure you granted **Location permission**
- Enable Location Services in your phone settings
- Make sure GPS is enabled (not just Wi-Fi location)
- Try taking a photo again after granting permission

### Problem: App crashes or shows error

**Solution:**
- Check the terminal for error messages
- Try restarting: Stop the server (`Ctrl+C`), then run `npm start` again
- Clear Expo cache: `npx expo start --clear`
- Make sure all dependencies are installed: `npm install`

### Problem: "Unable to resolve module" errors

**Solution:**
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again
- Restart the development server

---

## Alternative: Run on Android Emulator / iOS Simulator

### Android Emulator

1. Install Android Studio and set up an emulator
2. Start the emulator
3. Run: `npm run android` or `npx expo run:android`

**Note:** Camera and GPS may not work properly in emulators. Use a real device for full functionality.

### iOS Simulator (Mac only)

1. Install Xcode
2. Run: `npm run ios` or `npx expo run:ios`

**Note:** Camera and GPS may not work properly in simulators. Use a real device for full functionality.

---

## Development Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run android` | Run on Android emulator |
| `npm run ios` | Run on iOS simulator (Mac only) |
| `npm run web` | Run in web browser (limited functionality) |

---

## Next Steps

- **Take some photos** and see the geo-tagging in action!
- **Check the Gallery** to see all your tagged photos
- **Read the README.md** for more information about the app

---

## Need Help?

- Check the main **README.md** file
- Expo documentation: https://docs.expo.dev/
- Expo troubleshooting: https://docs.expo.dev/troubleshooting/clear-cache/
