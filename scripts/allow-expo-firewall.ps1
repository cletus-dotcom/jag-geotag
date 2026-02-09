# Allow Node.js / Expo Metro through Windows Firewall (run as Administrator if it fails)
# Run: powershell -ExecutionPolicy Bypass -File scripts/allow-expo-firewall.ps1

$ruleName = "Expo Metro (Port 8081)"
$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Rule '$ruleName' already exists." -ForegroundColor Yellow
    exit 0
}

New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Protocol TCP -LocalPort 8081 -Action Allow -Profile Private, Domain | Out-Null
Write-Host "Added firewall rule: $ruleName (TCP 8081 allowed)." -ForegroundColor Green
Write-Host "Restart Expo with: npm run start:lan" -ForegroundColor Cyan
