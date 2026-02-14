# Android Emulator Setup (Test App on Laptop)

Follow these steps to run Jag GeoTag in an Android emulator on your Windows laptop.

---

## Step 1: Install Android Studio

1. **Download Android Studio**
   - Go to: https://developer.android.com/studio
   - Click **Download Android Studio** (Windows).

2. **Run the installer**
   - Accept the default options.
   - When asked, install:
     - **Android SDK**
     - **Android SDK Platform**
     - **Android Virtual Device**
   - Finish the setup wizard.

3. **First launch**
   - Open **Android Studio**.
   - Complete the setup wizard (Standard install is fine).
   - Wait until it finishes downloading SDK components.

---

## Step 2: Create an Android Virtual Device (AVD)

1. In Android Studio, open **More Actions** (or **Configure**) → **Virtual Device Manager**  
   - Or: menu **Tools** → **Device Manager**.

2. Click **Create Device** (or **Create Virtual Device**).

3. **Choose a phone**
   - Select a phone (e.g. **Pixel 6** or **Pixel 7**).
   - Click **Next**.

4. **Choose a system image**
   - Pick a **Release** with **API 34** (or 33).  
     If it says "Download" next to it, click **Download**, wait, then select it.
   - Click **Next**.

5. **Finish**
   - Leave the default name (e.g. "Pixel 6 API 34") or change it.
   - Click **Finish**.

Your AVD is now in the list.

---

## Step 3: Start the Emulator

1. In **Device Manager**, find your AVD (e.g. Pixel 6 API 34).

2. Click the **Play** (▶) button next to it.

3. Wait for the emulator window to open and Android to finish booting (can take 1–2 minutes the first time).

4. Leave the emulator running. You’ll use it in the next step.

---

## Step 3b: Set JAVA_HOME (required for Android build)

The build needs Java. Android Studio includes a JDK; point `JAVA_HOME` to it.

**Option A – This terminal only (quick test)**

In the same PowerShell window where you'll run `npx expo run:android`:

```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
```

Then run `npx expo run:android`. You must set this again if you open a new terminal.

**Option B – Permanent (recommended)**

1. Press **Win + R**, type `sysdm.cpl`, Enter.
2. **Advanced** tab → **Environment Variables**.
3. Under **User variables** (or **System variables**), click **New**.
   - **Variable name:** `JAVA_HOME`
   - **Variable value:** `C:\Program Files\Android\Android Studio\jbr`
4. Click **OK**.
5. In **System variables**, select **Path** → **Edit** → **New** → add: `%JAVA_HOME%\bin` → **OK**.
6. Close and reopen your terminal (or Cursor), then run `npx expo run:android`.

*(If Android Studio is installed elsewhere, use that path and append `\jbr`.)*

---

## Step 4: Run Jag GeoTag on the Emulator

1. **Open a terminal** (PowerShell or Command Prompt).

2. **Go to the project folder:**
   ```powershell
   cd c:\python\jag_GeoTag
   ```

3. **Run the app on Android:**
   ```powershell
   npx expo run:android
   ```

4. **What happens:**
   - Expo builds the Android app (first time can take 5–15 minutes).
   - The app installs and opens on the emulator.
   - You may be asked to accept licenses; type `y` and Enter if prompted.

5. **In the app:**
   - Open the **Camera** tab.
   - Allow **Camera** and **Location** when asked.
   - **Take a photo:** use the capture button; the emulator can use a virtual camera or your laptop webcam.
   - **Set location:** in the emulator window, click **⋯** (Extended controls) → **Location** → enter latitude/longitude (e.g. 52.2297, 21.0122) and **Send**.

---

## If the app shows "Reloading..." and never loads

The emulator must reach Metro on your laptop at **10.0.2.2** (not localhost). Do this:

1. **Stop** any existing Metro (Ctrl+C in the terminal where it’s running).
2. **Start Metro for the emulator** (in a terminal in the project folder):
   ```powershell
   npm run start:emulator
   ```
   Leave this running.
3. On the **emulator**, open the app again (tap the app icon) or **reload**: press **Ctrl + M** (or **Ctrl + R**) in the emulator window, then choose **Reload**.

The app should load. If it still doesn’t, in the dev menu (Ctrl+M) try **Settings** → **Change Bundle Location** and set it to `http://10.0.2.2:8081`.

---

## Troubleshooting

- **"No connected devices"**  
  Start the emulator first (Step 3), then run `npx expo run:android` again.

- **Build fails or "SDK not found"**  
  In Android Studio: **File** → **Settings** → **Appearance & Behavior** → **System Settings** → **Android SDK**. Note the **Android SDK Location**. Set the `ANDROID_HOME` environment variable to that path (e.g. `C:\Users\YourName\AppData\Local\Android\Sdk`). Then restart the terminal.

- **Emulator is slow**  
  In AVD settings, enable **Hardware - GLES 2.0** or use an x86 image if your PC supports virtualization (Intel HAXM or Windows Hypervisor).

- **Camera not working in emulator**  
  In the emulator **⋯** → **Camera**: set front/back camera to "Webcam" or "Virtual scene" so the app can capture.

---

## Quick reference

| Step | Action |
|------|--------|
| 1 | Install Android Studio from developer.android.com/studio |
| 2 | Device Manager → Create Device → Pick phone → Pick API 34 image → Finish |
| 3 | Device Manager → Play (▶) next to your AVD |
| 4 | Terminal: `cd c:\python\jag_GeoTag` then `npx expo run:android` |

After the first successful build, later runs of `npx expo run:android` are much faster.
