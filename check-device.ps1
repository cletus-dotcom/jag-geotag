# Check if Android device is connected via USB
# This script checks for connected devices using ADB

Write-Host "Checking for connected Android devices..." -ForegroundColor Green
Write-Host ""

# Try to find ADB in common locations
$adbPaths = @(
    "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe",
    "$env:ProgramFiles\Android\Android Studio\platform-tools\adb.exe",
    "$env:ProgramFiles(x86)\Android\android-sdk\platform-tools\adb.exe",
    "adb.exe"  # If it's in PATH
)

$adbFound = $null
foreach ($path in $adbPaths) {
    if (Test-Path $path) {
        $adbFound = $path
        Write-Host "Found ADB at: $path" -ForegroundColor Cyan
        break
    }
}

if (-not $adbFound) {
    # Try if adb is in PATH
    try {
        $null = Get-Command adb -ErrorAction Stop
        $adbFound = "adb"
        Write-Host "ADB found in PATH" -ForegroundColor Cyan
    } catch {
        Write-Host "ADB not found!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install Android Platform Tools:" -ForegroundColor Yellow
        Write-Host "1. Download from: https://developer.android.com/tools/releases/platform-tools" -ForegroundColor Yellow
        Write-Host "2. Extract and add to PATH, OR" -ForegroundColor Yellow
        Write-Host "3. Install Android Studio (includes ADB)" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "Running: adb devices" -ForegroundColor Yellow
Write-Host ""

if ($adbFound -eq "adb") {
    adb devices
} else {
    & $adbFound devices
}

Write-Host ""
Write-Host "What to look for:" -ForegroundColor Green
Write-Host "  - 'device' = Connected and authorized" -ForegroundColor Green
Write-Host "  - 'unauthorized' = Need to allow USB debugging on phone" -ForegroundColor Yellow
Write-Host "  - 'offline' = Connection issue, try reconnecting" -ForegroundColor Yellow
Write-Host "  - Empty list = No device connected" -ForegroundColor Red
