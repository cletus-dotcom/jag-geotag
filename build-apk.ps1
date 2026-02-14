# Build APK Script for Windows
# Sets JAVA_HOME and builds the release APK

Write-Host "Setting JAVA_HOME..." -ForegroundColor Green
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

Write-Host "JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Green
Write-Host ""

# Navigate to android directory
Set-Location -Path "$PSScriptRoot\android"

Write-Host "Starting Gradle build (this may take 10-30 minutes)..." -ForegroundColor Yellow
Write-Host ""

# Run Gradle build
.\gradlew assembleRelease

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Build successful! APK location:" -ForegroundColor Green
    Write-Host "$PSScriptRoot\android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Build failed. Check the error messages above." -ForegroundColor Red
}
