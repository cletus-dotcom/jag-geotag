# Upgraded to Expo SDK 54

Your Jag GeoTag app is now on **Expo SDK 54**.

## What changed

| Package | Before (SDK 52) | After (SDK 54) |
|---------|------------------|----------------|
| expo | ~52.0.0 | ^54.0.33 |
| react | 18.3.1 | 19.1.0 |
| react-native | 0.76.5 | 0.81.5 |
| expo-camera | ~16.0.18 | ~17.0.10 |
| expo-location | ~18.0.10 | ~19.0.8 |
| expo-file-system | ~18.0.0 | ~19.0.21 |
| expo-asset | ~11.0.5 | ~12.0.12 |
| expo-status-bar | ~2.0.0 | ~3.0.9 |
| react-native-safe-area-context | 4.12.0 | ~5.6.0 |
| react-native-screens | ~4.4.0 | ~4.16.0 |

## Code changes made

1. **expo-file-system**  
   In SDK 54 the default export is the new API. This project still uses the previous API, so the import was updated to:
   - `import * as FileSystem from 'expo-file-system/legacy'`
   in `src/storage/geoStorage.js`.

2. **Dependencies**  
   All Expo-related dependencies were updated to SDK 54–compatible versions via `package.json` and a clean `npm install` (after removing `node_modules` and `package-lock.json`).

## Run the app

```bash
npm start
# or
npx expo start --lan
```

Then open the project in **Expo Go** (ensure the Expo Go app is updated for SDK 54) or use a development build.

## SDK 54 notes

- **React Native 0.81** and **React 19.1** are used.
- **Android**: Targets Android 16 / API 36; edge-to-edge is always on.
- **iOS**: Supports iOS 26 and Xcode 26 when you use those versions.
- **Expo Go**: Use a version of Expo Go that supports SDK 54 (update from the store if needed).

## Optional: use new file system API later

The current code uses `expo-file-system/legacy`. When you want to migrate to the new API, see [expo-file-system docs](https://docs.expo.dev/versions/v54.0.0/sdk/filesystem/) and replace usage in `src/storage/geoStorage.js` accordingly.

## Troubleshooting

- **Expo Go “SDK version” error:** Update Expo Go from the App Store / Play Store.
- **Build errors:** If you have local `android` or `ios` folders, delete them and run `npx expo prebuild` again (or use EAS Build).
- **Metro / cache issues:** Run `npx expo start --clear`.
