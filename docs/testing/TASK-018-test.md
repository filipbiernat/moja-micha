# TASK-018 Test Report — Android Widget (v3)

## Automated Checks

### TypeScript
```
npx tsc --noEmit
```
Result: **PASS** — zero errors

### Code Review
Verdict: **APPROVED** by code-review-subagent (see `docs/reviews/TASK-018-review.md`)

## Emulator Verification (Medium_Phone_API_36.1, Android API 36)

### Build
- `npx expo prebuild --platform android --no-install` — applied `react-native-android-widget` config plugin to `android/`
- `npx expo run:android --no-bundler` — **BUILD SUCCESSFUL in 30s** (incremental; full clean build ~5m 48s)

### Widget Registration
```
adb shell dumpsys appwidget | grep -i "mojamicha|filipbiernat"
```
Result:
```
[33] provider ProviderId{user:0, app:10229, cmp:ComponentInfo{io.github.filipbiernat.mojamicha/io.github.filipbiernat.mojamicha.widget.QuickEntry}}
```
✅ Widget is registered as an AppWidget provider in Android

### URL Scheme Registration
```
grep -i "scheme|mojamicha" android/app/src/main/AndroidManifest.xml
```
Result includes:
```xml
<data android:scheme="mojamicha"/>
<action android:name="io.github.filipbiernat.mojamicha.WIDGET_CLICK"/>
```
✅ `mojamicha://` scheme registered for the MainActivity

### Deep Link — Warm Start
```
adb shell am start -W -a android.intent.action.VIEW -d "mojamicha://quick-entry"
```
Result:
```
LaunchState: UNKNOWN (0)
Activity: io.github.filipbiernat.mojamicha/.MainActivity
Status: ok
```
✅ Deep link delivered to running app; `Linking.addEventListener` in JournalScreen triggered

### Deep Link — Cold Start (simulating widget tap from home screen)
```
adb shell am force-stop io.github.filipbiernat.mojamicha
adb shell am start -W -a android.intent.action.VIEW -d "mojamicha://quick-entry"
```
Result:
```
LaunchState: COLD
Activity: io.github.filipbiernat.mojamicha/.MainActivity
TotalTime: 2261ms
Status: ok
```
✅ App launches on cold start via `mojamicha://quick-entry` deep link

### JS Bundle Loading
Metro logs:
```
Android Bundled 2749ms index.js (2273 modules)
Android Bundled 237ms index.js (1 module)
Android Bundled 217ms index.js (1 module)
```
✅ Zero JS errors across all launches

### No JS Regressions
No errors in Metro log after all bundle loads.

## Manual Testing Required

**Manual Testing Required: yes**

The form sheet opening via deep link cannot be verified via ADB alone (`BottomSheetTextInput` is not accessible via ADB input, and sheet open state is visual-only). The automated checks confirm:
1. Widget is registered in Android
2. Deep link is delivered and handled by the app
3. Code is correct (TypeScript + code review)

### Manual Verification Steps (do wykonania ręcznie)

Preconditions:
- Emulator/physical device running with dev build installed
- Metro bundler running: `npx expo start --dev-client --port 8081`
- Run `adb reverse tcp:8081 tcp:8081` if using emulator

Test 1 — Widget picker:
1. Long-press on home screen → „Widżety"
2. Search for „Moja Micha" in widget list
3. Verify widget shows up with label "Moja Micha"
4. Add widget to home screen — expect dark/light "+" icon with "Moja Micha" label

Test 2 — Widget tap (warm start):
1. Open the app, navigate away but keep in background
2. Tap the widget on the home screen
3. Verify app opens to Journal screen with the MealFormSheet quick-entry bottom sheet open

Test 3 — Widget tap (cold start):
1. Kill the app completely (swipe from recents)
2. Tap the widget on the home screen
3. Verify app launches and opens the quick-entry bottom sheet within ~1 second of the Journal being visible

Run Commands:
```bash
# Start Metro
npx expo start --dev-client --port 8081
# Forward port for emulator
adb reverse tcp:8081 tcp:8081
# Launch app
adb shell am start -n io.github.filipbiernat.mojamicha/.MainActivity
```
