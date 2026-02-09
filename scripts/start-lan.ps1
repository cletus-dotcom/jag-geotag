# Fix "Failed to download remote update" - use your PC's LAN IP so the phone can connect.
# Run: .\scripts\start-lan.ps1   OR   npm run start:lan

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

# Get first non-loopback IPv4 (Wi-Fi or Ethernet)
$ip = Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object { $_.IPAddress -notmatch '^127\.' -and $_.PrefixOrigin -ne 'WellKnown' } | 
    Sort-Object -Property InterfaceIndex | 
    Select-Object -First 1 -ExpandProperty IPAddress

if (-not $ip) {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notmatch '^127\.' } | Select-Object -First 1).IPAddress
}

if ($ip) {
    $env:REACT_NATIVE_PACKAGER_HOSTNAME = $ip
    Write-Host ""
    Write-Host "Using LAN IP: $ip" -ForegroundColor Green
    Write-Host "In Expo Go: Enter URL manually -> exp://${ip}:8081" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "Could not detect LAN IP. Trying anyway..." -ForegroundColor Yellow
}

& npx expo start --lan --clear
