# Maestro E2E Tests — Moja Micha

Automated UI tests for Android using [Maestro](https://maestro.mobile.dev/).

## Setup (one-time, Windows Git Bash)

### 1. Install Java 21+ (required by Maestro 2.x)

Maestro requires Java 17 or higher. Java 8 (the default on this machine) will NOT work.

```bash
winget install EclipseAdoptium.Temurin.21.JDK
```

Then set JAVA_HOME (add to `~/.bashrc` for persistence):

```bash
export JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-21.0.10.7-hotspot"
export PATH="$JAVA_HOME/bin:$PATH"
```

### 2. Install Android SDK

Install Android Studio: https://developer.android.com/studio
Set ANDROID_HOME (add to `~/.bashrc` for persistence):

```bash
export ANDROID_HOME="/c/Users/$USERNAME/AppData/Local/Android/Sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
```

### 3. Install Maestro

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
export PATH="$PATH:$HOME/.maestro/bin"
```

Verify: `maestro --version` (should show 2.x.x)

### 4. Build and install the dev APK (one-time per machine)

The Maestro tests run against the native dev build (`com.anonymous.mojamicha`), NOT Expo Go.

```bash
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-21.0.10.7-hotspot" \
ANDROID_HOME="/c/Users/$USERNAME/AppData/Local/Android/Sdk" \
PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH" \
npx expo run:android
```

This builds and installs the APK on the connected emulator/device.

### 5. Start the dev Metro bundler on port 8081

The dev build connects to `localhost:8081` (mapped as `10.0.2.2:8081` in the emulator).
Use `--dev-client` flag to serve the dev build bundle (NOT Expo Go):

```bash
npx expo start --dev-client --port 8081
```

**Important:** Do NOT use `npx expo start --android` (that triggers Expo Go + port 8082 conflict).

### 6. Launch the app on the emulator

```bash
adb -s emulator-5554 shell am start -n com.anonymous.mojamicha/.MainActivity
```

Verify the app loads (not blank) before running tests.

### 7. Run tests

```bash
# Run all tests
maestro test .maestro/

# Run one test
maestro test .maestro/smoke-favorites-picker.yaml
```

## Gotchas

1. **Java 8 doesn't work** — always use Java 21+. Set `JAVA_HOME` before running Maestro.
2. **Unicode in `inputText` not supported** — use ASCII-only strings in Maestro YAML `inputText` steps.
3. **Dev build vs Expo Go** — Maestro uses `appId: com.anonymous.mojamicha` (dev build). Expo Go has a different package name and will not work with these tests.
4. **Metro must be on port 8081** — if Metro runs on a different port, the dev build shows a blank screen. Use `--port 8081` explicitly.
5. **Quick entry vs full form testIDs differ**:
   - Quick entry: `meal-form-quick-input`, `meal-form-quick-save-btn`, `meal-form-quick-favorites-btn`
   - Full form: `meal-form-meal-text-input`, `meal-form-save-btn`, `meal-form-full-favorites-btn`

## Notes

- App bundle id: `com.anonymous.mojamicha` (from app.json)
- Tests use `testID` props already present on interactive elements
- Emulator name: `Medium_Phone_API_36.1`
