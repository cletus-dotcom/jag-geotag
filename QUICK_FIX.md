# Quick Fix for "Failed to download remote update"

## The Problem

Your Expo server is trying to use **tunnel mode** but needs you to log in first. That's why Expo Go can't connect.

---

## Solution: Use LAN Mode (No Login Required) ✅

**Easiest fix** - No Expo account needed:

1. **Stop the current server** (press `Ctrl+C` in the terminal where Expo is running)

2. **Start with LAN mode:**
   ```bash
   npx expo start --lan
   ```

3. **Make sure phone and computer are on the SAME Wi-Fi network**

4. **In Expo Go:**
   - Tap **"Enter URL manually"** 
   - Type: `exp://YOUR_COMPUTER_IP:8081`
   - To find your IP: Run `ipconfig` in PowerShell, look for IPv4 Address (e.g., `192.168.1.100`)
   - Example: `exp://192.168.1.100:8081`

---

## Alternative: Use Tunnel Mode (Requires Login)

If you want tunnel mode (works on different Wi-Fi networks):

1. **Login to Expo first:**
   ```bash
   npx expo login
   ```
   (Create a free account if you don't have one)

2. **Then start with tunnel:**
   ```bash
   npx expo start --tunnel
   ```

3. **Scan the QR code** that appears

---

## Recommended: Use LAN Mode

**For now, use LAN mode** (`npx expo start --lan`) - it's faster and doesn't require login. Just make sure your phone and computer are on the same Wi-Fi network.
