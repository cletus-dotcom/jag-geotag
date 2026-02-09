# Why localhost:8081 Shows JSON (And How to Run the App)

## What You're Seeing Is Correct

When you open **http://localhost:8081** in your browser, you see a long JSON object. That is **expected**.

- **Port 8081** is the **Metro bundler** + **manifest** server.
- The JSON is the **app manifest** (name, bundle URL, assets, etc.).
- **Expo Go on your phone** uses this manifest to load your app; it is **not** meant to be a webpage.

So the server is working correctly.

---

## How to Actually Run the App

### Option 1: On Your Phone (recommended – full camera & GPS)

1. Keep the server running (`npx expo start`).
2. On your phone, open **Expo Go** and **scan the QR code** from the terminal (or from the browser tab that opened when you ran `expo start`).
3. The app loads on your device with full camera and location.

### Option 2: In the Browser (limited – for UI only)

To see the app in the browser instead of JSON:

1. Stop the current server (`Ctrl+C` in the terminal).
2. Run:
   ```bash
   npx expo start --web
   ```
3. A browser tab will open with the **web version** of the app.

**Note:** In the browser, camera and GPS may not work the same as on a real device. Use the phone for full geo-tagging.

---

## Summary

| URL / Action              | What you get                          |
|---------------------------|----------------------------------------|
| **http://localhost:8081**  | JSON manifest (for Expo Go) – normal  |
| **Phone + Expo Go + QR**  | Full app with camera & GPS            |
| **npx expo start --web**  | App UI in the browser (limited features) |

The JSON at 8081 means the dev server is running; use your phone or the web command to run the app itself.
