# Fix "Failed to download remote update" Error

This error means **Expo Go on your phone can't connect to your computer's dev server**.

---

## Quick Fix (3 Steps)

### Step 1: Stop Expo Server
Press **Ctrl+C** in the terminal where Expo is running.

---

### Step 2: Allow Firewall (IMPORTANT!)

**Windows Firewall is likely blocking port 8081.**

**Option A - PowerShell Script (Easiest):**
1. Right-click **PowerShell** → **Run as Administrator**
2. Run:
   ```powershell
   cd c:\python\jag_GeoTag
   .\scripts\allow-expo-firewall.ps1
   ```

**Option B - Manual Firewall Rule:**
1. Press **Win + R**, type **wf.msc**, press Enter
2. Click **Inbound Rules** → **New Rule**
3. Select **Port** → **Next**
4. Select **TCP**, enter **8081** → **Next**
5. Select **Allow the connection** → **Next**
6. Check **Private** and **Domain** → **Next**
7. Name it: **Expo Metro** → **Finish**

---

### Step 3: Start Expo and Connect

**In a normal terminal (not admin):**

```powershell
cd c:\python\jag_GeoTag
npm run start:lan
```

**Wait for:**
- `Metro waiting on exp://192.168.x.x:8081`
- A **QR code** appears

**On your phone (Expo Go):**
1. **Close Expo Go completely** (swipe it away from recent apps)
2. **Reopen Expo Go**
3. Tap **"Enter URL manually"**
4. Type the **exp://...** URL from your terminal (e.g., `exp://192.168.1.100:8081`)
5. Press **Connect**

**Important:** 
- Phone and computer must be on the **same Wi-Fi network**
- Use the **exact URL** from the terminal (with your PC's IP, not 127.0.0.1)
- **Don't** open an old saved project in Expo Go

---

## If It Still Fails: Use Tunnel Mode

Tunnel mode works even if firewall/network is blocking:

1. **Log in to Expo** (one-time, free account):
   ```powershell
   npx expo login
   ```
   (Create account at https://expo.dev/signup if needed)

2. **Start with tunnel:**
   ```powershell
   npx expo start --tunnel
   ```

3. **Wait for "Tunnel ready"** (30-60 seconds)

4. **Scan the new QR code** in Expo Go

---

## Why This Happens

- **Windows Firewall** blocks port 8081 by default
- Expo Go tries to connect to `127.0.0.1` (your phone's own address) instead of your PC's IP
- Old cached connections in Expo Go point to the wrong IP

**The fix:** Allow firewall + use LAN mode with the correct IP URL.
