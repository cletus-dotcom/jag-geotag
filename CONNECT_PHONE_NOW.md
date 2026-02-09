# Fix "Failed to download remote update" – do this

Follow these steps **in order**.

---

## Step 1: Stop Expo

In the terminal where Expo is running, press **Ctrl+C**.

---

## Step 2: Allow port 8081 (Windows Firewall)

**Run PowerShell as Administrator** (right‑click PowerShell → Run as administrator), then:

```powershell
cd c:\python\jag_GeoTag
.\scripts\allow-expo-firewall.ps1
```

If you can’t run scripts, add the rule manually:

1. Press **Win + R**, type **wf.msc**, Enter.
2. Click **Inbound Rules** → **New Rule**.
3. **Port** → **TCP** → **8081** → **Allow** → **Private, Domain** → Name: **Expo Metro**.

---

## Step 3: Start Expo with LAN IP

In a **new** terminal (normal, no admin):

```powershell
cd c:\python\jag_GeoTag
npm run start:lan
```

**Or** (if that still fails) use PowerShell so the IP is set in the same process:

```powershell
cd c:\python\jag_GeoTag
.\scripts\start-lan.ps1
```

Wait until you see **Metro waiting on exp://192.168.x.x:8081** (or similar) and a **QR code**. Note the **exp://...** URL.

---

## Step 4: Connect from the phone

1. **Same Wi‑Fi:** Phone and PC must be on the **same** Wi‑Fi network.
2. **Expo Go:**  
   - Do **not** open an old “Jag GeoTag” project.  
   - Tap **“Enter URL manually”**.  
   - Type the URL from the terminal, e.g. **exp://192.168.1.100:8081** (use **your** PC’s IP from the terminal).
3. Or **scan the new QR code** from the terminal.

---

## Step 5: If it still fails – use tunnel (needs Expo account)

1. Log in (one time):  
   `npx expo login`  
   (Create a free account if needed.)

2. Start with tunnel:  
   `npx expo start --tunnel`

3. Wait for **“Tunnel ready”**, then scan the **new** QR code in Expo Go.

---

## Quick checklist

- [ ] Firewall allows **TCP 8081** (or Node.js).
- [ ] Expo started with **npm run start:lan** or **.\scripts\start-lan.ps1**.
- [ ] Phone and PC on **same Wi‑Fi**.
- [ ] In Expo Go you used **“Enter URL manually”** with the **exp://...** URL from the terminal (not an old project).
- [ ] The URL uses your **PC’s IP** (e.g. 192.168.1.x), **not** 127.0.0.1.
