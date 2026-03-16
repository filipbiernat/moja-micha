# Maestro E2E Tests — Moja Micha

Automated UI tests for Android using [Maestro](https://maestro.mobile.dev/).

## Setup (one-time, Windows PowerShell)

### 1. Install Android SDK (if not already)
Install Android Studio: https://developer.android.com/studio
After installation, set environment variables in PowerShell (adjust path if needed):

```powershell
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk", "User")
$adb = "$env:ANDROID_HOME\platform-tools"
$tools = "$env:ANDROID_HOME\emulator"
[System.Environment]::SetEnvironmentVariable("PATH", "$env:PATH;$adb;$tools", "User")
```
Restart terminal after setting variables.

### 2. Install Maestro (PowerShell)
```powershell
iwr https://get.maestro.mobile.dev -OutFile maestro-install.ps1
powershell -ExecutionPolicy ByPass -File maestro-install.ps1
```

### 3. Start Expo dev server
```bash
npx expo start
```

### 4. Connect device / start emulator
- Physical device: enable USB debugging, connect via USB, verify with `adb devices`
- Emulator: start from Android Studio AVD Manager or `emulator -avd <name>`

### 5. Run tests
```bash
# Run all tests
maestro test .maestro/

# Run one test
maestro test .maestro/smoke-favorites-picker.yaml
```

## Notes
- App bundle id: `com.anonymous.mojamicha` (from app.json)
- Tests use `testID` props already present on interactive elements
- Expo Go can also be used instead of a standalone build (same QR workflow)
