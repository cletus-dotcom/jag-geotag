# Fix: "Failed to download remote update" in Expo Go

## The Problem

The error **"java.io.IOException: Failed to download remote update"** means Expo Go on your phone can't connect to your development server (often because it's using `127.0.0.1` instead of your computer's LAN IP).

---

## Solution 1: Use the LAN start script (recommended) ✅

This sets your computer's LAN IP so the phone can reach the dev server.

1. **Stop any running Expo server** (`Ctrl+C` in the terminal).

2. **Start with the LAN script:**
   ```bash
   npm run start:lan
   ```
   (This runs `node scripts/start-lan.js`, which detects your LAN IP and starts Expo with `--lan --clear`.)

3. **On your phone (Expo Go):**
   - **Do not** open an old “Jag GeoTag” / saved project that might still point to 127.0.0.1.
   - Either **scan the new QR code** from the terminal, or  
   - Tap **“Enter URL manually”** and type the URL shown (e.g. `exp://192.168.1.100:8081`).

4. **Same Wi‑Fi:** Phone and computer must be on the same Wi‑Fi network.

If it still fails, allow **Node.js** or **port 8081** in Windows Firewall (see Solution 4 below).

---

## Solution 2: Use Tunnel Mode

**Tunnel mode** works even if phone and computer are on different networks.

### Steps:

1. **Stop the current Expo server** (press `Ctrl+C` in the terminal)

2. **Start with tunnel mode:**
   ```bash
   npx expo start --tunnel
   ```

3. **Wait for tunnel to connect** (may take 30-60 seconds)
   - You'll see: `Tunnel ready.`
   - A new QR code will appear

4. **Scan the new QR code** with Expo Go

**Note:** Tunnel mode uses Expo's servers, so it works even if your phone and computer are on different Wi-Fi networks.

---

## Solution 3: Use LAN Mode manually

If tunnel mode is slow, use LAN mode (phone and computer must be on the **same Wi-Fi**).

### Steps:

1. **Stop the current Expo server** (`Ctrl+C`)

2. **Start with LAN mode:**
   ```bash
   npx expo start --lan
   ```

3. **Find your computer's IP address:**
   - **Windows PowerShell:** Run `ipconfig`
   - Look for **IPv4 Address** under your Wi-Fi adapter
   - Example: `192.168.1.100`

4. **In Expo Go:**
   - Tap **"Enter URL manually"**
   - Type: `exp://YOUR_IP:8081`
   - Example: `exp://192.168.1.100:8081`

5. **If it still doesn't work:**
   - Check Windows Firewall allows Node.js/Metro on port 8081
   - Make sure phone and computer are on the **same Wi-Fi network**

---

## Solution 4: Check Firewall (If LAN still fails)

Windows Firewall might be blocking the connection.

### Steps:

1. **Open Windows Defender Firewall:**
   - Press `Win + R`, type `wf.msc`, press Enter

2. **Allow Node.js through firewall:**
   - Click "Allow an app or feature through Windows Defender Firewall"
   - Find "Node.js" in the list
   - Check both **Private** and **Public** boxes
   - If Node.js isn't listed, click "Change Settings" → "Allow another app" → Browse to `C:\Program Files\nodejs\node.exe`

3. **Or create a rule for port 8081:**
   - Click "Inbound Rules" → "New Rule"
   - Select "Port" → TCP → Specific local ports: `8081`
   - Allow the connection → Apply to all profiles → Name it "Expo Metro"

4. **Restart Expo server:**
   ```bash
   npx expo start --lan
   ```

---

## Solution 5: Use Expo Dev Client / Development Build

If Expo Go keeps having issues, you can build a development build of your app (more advanced).

---

## Quick Troubleshooting Checklist

- [ ] Phone and computer on **same Wi-Fi**? (for LAN mode)
- [ ] Windows Firewall allows **Node.js** or port **8081**?
- [ ] Expo server shows **"Metro waiting on exp://..."** with your IP (not 127.0.0.1)?
- [ ] Tried **tunnel mode** (`--tunnel`)?
- [ ] Restarted Expo server after firewall changes?

---

## Recommended: Start with `npm run start:lan`

**Easiest fix:** Run `npm run start:lan`, then in Expo Go connect using the new QR code or the `exp://YOUR_IP:8081` URL shown in the terminal. Avoid reusing an old project that might still point to 127.0.0.1.

---

## Still Not Working?

1. **Check terminal output** - Look for error messages
2. **Try restarting Expo:** `Ctrl+C`, then `npx expo start --tunnel` again
3. **Check Expo Go version** - Update Expo Go from Play Store/App Store
4. **Try clearing Expo cache:** `npx expo start --clear --tunnel`
