# Lessons Learned — Moja Micha

All agents must check this file before starting work in a known problem area.
All agents must append new findings after solving non-trivial, novel, or recurring issues.

## Format

```md
### YYYY-MM-DD — Short Title

Task: TASK-###
Context: Component, feature area, or workflow
Problem: What went wrong or was tricky
Solution: What worked
Discovered By: Agent name
```

## Entries

### 2026-03-16 — Always check off completed GamePlan tasks

Task: TASK-004
Context: GamePlan.md task tracking
Problem: After implementing stage 7, the corresponding checkboxes in GamePlan.md were left unchecked. The orchestrator committed without updating task status.
Solution: After every implementation phase, update GamePlan.md checkboxes for all completed items before the commit. Leave unchecked only items explicitly deferred to a later task.
Discovered By: autonomous-orchestrator

Task: TASK-004
Context: Native date/time picker inside @gorhom/bottom-sheet
Problem: Rendering @react-native-community/datetimepicker inside a BottomSheet causes Android layout conflicts (picker dialog can be clipped or positioned incorrectly relative to the sheet).
Solution: Render the DateTimePicker conditionally using a boolean flag (showDatePicker / showTimePicker) as a sibling of the BottomSheet (outside the sheet tree, but inside the same parent View). Both components must co-exist in the same JSX fragment: `<>...</BottomSheet>{showDatePicker && <DateTimePicker ... />}</>`.
Discovered By: autonomous-orchestrator

### 2026-03-16 — Use Expo Go for manual device testing (not --android flag)

Task: TASK-005
Context: Manual testing workflow on Windows
Problem: `npx expo start --android` fails on Windows when `ANDROID_HOME` is not set and `adb` is not in PATH (SDK installed to a non-default location or emulator not configured).
Solution: Use `npx expo start` (without `--android`) and scan the QR code with the Expo Go app on a physical Android device. Both device and computer must be on the same Wi-Fi network. This is the standard dev workflow for this project.
Discovered By: autonomous-orchestrator

### 2026-03-16 — Use BottomSheetModal (not sibling BottomSheet) for overlay picker on another sheet

Task: TASK-005
Context: Multiple @gorhom/bottom-sheet instances (v5) on the same screen
Problem: A second `BottomSheet` rendered as a sibling with `index={-1}` never opens on device. Root cause: `handleSnapToIndex` in v5 has a guard — `if (!isLayoutCalculated) return` — and a sheet starting permanently closed (`index={-1}`) may never have its layout measured, so both imperative `snapToIndex(0)` AND state-controlled `index` changes are silently ignored.
Solution: Use `BottomSheetModal` (from `@gorhom/bottom-sheet`) instead. It renders via a Portal above all views. Requires adding `BottomSheetModalProvider` in `App.tsx` inside `GestureHandlerRootView`. Open via `ref.current?.present()`, close via `ref.current?.dismiss()`. Cleanup on close via the `onDismiss` prop.
Discovered By: autonomous-orchestrator

### 2026-03-16 — React Native Modal conflicts with @gorhom/bottom-sheet on Android

Task: TASK-005
Context: Favorites picker overlay inside MealFormSheet
Problem: Using `React Native Modal` (transparent + animationType="slide") as a picker overlay while a BottomSheet is open causes gesture conflicts on Android — two overlapping native gesture responders, potential flicker, and section header i18n keys remained dead.
Solution: Use a second `BottomSheet` instance rendered as a sibling (inside the same `<>` fragment), controlled by state index. Use `BottomSheetSectionList` for grouped content and `BottomSheetBackdrop` for the backdrop. No `BottomSheetModalProvider` or App.tsx changes needed.
Discovered By: autonomous-orchestrator

Task: TASK-003
Context: Today tab date state in React Navigation bottom tabs
Problem: A tab screen that stores a browsed date in local state keeps that value across tab switches because the screen stays mounted.
Solution: Keep the date state in the screen, but reset it with a focus-driven effect when the tab becomes active again.
Discovered By: autonomous-orchestrator
