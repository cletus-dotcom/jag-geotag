# View Logs from Physical Phone (APK)
# Make sure your phone is connected via USB with USB debugging enabled

Write-Host "Checking for connected devices..." -ForegroundColor Green
$devices = adb devices
Write-Host $devices

if ($devices -match "device$") {
    Write-Host ""
    Write-Host "Device found! Viewing logs..." -ForegroundColor Green
    Write-Host "Take a photo in the app to see logo resize logs" -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    
    # Show React Native JS logs (includes console.log, console.warn)
    adb logcat -s ReactNativeJS:* *:S
} else {
    Write-Host ""
    Write-Host "No device found!" -ForegroundColor Red
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "  1. Phone is connected via USB" -ForegroundColor Yellow
    Write-Host "  2. USB Debugging is enabled (Settings → Developer Options)" -ForegroundColor Yellow
    Write-Host "  3. You've authorized the computer on your phone" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run 'adb devices' to check connection" -ForegroundColor Cyan
}
