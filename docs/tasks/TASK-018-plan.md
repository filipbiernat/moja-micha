# TASK-018 Plan — Android Widget (v3)

## Goal

Implement a 1×1 Android home-screen widget that, when tapped, launches the app with the MealFormSheet (quick-entry bottom sheet) already open.

## Acceptance Criteria

- Widget appears in the Android widget picker labelled "Moja Micha"
- Widget displays a "+" icon and a small label on a branded background
- Tapping the widget launches the app and opens the quick-entry bottom sheet for today
- If the app is already in the background, tapping the widget navigates to Journal and opens the sheet
- App URL scheme `mojamicha://` is registered (deep link)
- Code passes TypeScript strict check

## Scope

Files to create:
- `widgets/QuickEntryWidget.tsx` — widget visual component
- `widgetTaskHandler.ts` — headless task handler

Files to modify:
- `index.js` — register widget task handler
- `app.json` — add `scheme` + `react-native-android-widget` plugin
- `App.tsx` — add React Navigation `linking` config
- `app/screens/JournalScreen.tsx` — detect deep link URL and open form sheet

## Architecture

### Widget → App Launch Flow

1. User taps widget on home screen
2. Widget `FlexWidget` has `clickAction="OPEN_URI"` with `clickActionData={{ uri: "mojamicha://quick-entry" }}`
3. Android opens the deep link URI
4. React Navigation's `linking` config routes `mojamicha://quick-entry` to the `Journal` tab
5. `JournalScreen` uses `Linking.getInitialURL()` + `Linking.addEventListener` to detect the URL
6. A `pendingQuickEntry` state flag triggers `formSheetRef.current?.openAdd(currentDate)` after mount

### Widget Visual

Two variants (dark/light) matching app themes:
- **Dark (Fitness Neon):** background `#0F0F1A`, "+" in `#00E5FF`, label in `#B0B0C0`
- **Light (Fresh & Vibrant):** background `#F8F9FA`, "+" in `#FF6B6B`, label in `#555555`

## Phases

1. Create widget files + update index.js — `widgets/QuickEntryWidget.tsx`, `widgetTaskHandler.ts`, `index.js`
2. Configure app.json + App.tsx
3. Update JournalScreen for deep link handling
4. TypeScript check + code review
5. Rebuild dev APK and verify on emulator
