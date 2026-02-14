# View Android Logs Script
# Shows console.log and console.warn messages from the app

Write-Host "Viewing Android app logs..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Filter for React Native and Expo logs
adb logcat | Select-String -Pattern "ReactNativeJS|ExpoModules|console"
