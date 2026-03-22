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

### 2026-03-16 — Use BottomSheetModal (not sibling BottomSheet) for overlay picker on another sheet

Task: TASK-005
Context: Multiple @gorhom/bottom-sheet instances (v5) on the same screen
Problem: A second `BottomSheet` rendered as a sibling with `index={-1}` never opens on device. Root cause: `handleSnapToIndex` in v5 has a guard — `if (!isLayoutCalculated) return` — and a sheet starting permanently closed (`index={-1}`) may never have its layout measured, so both imperative `snapToIndex(0)` AND state-controlled `index` changes are silently ignored.
Solution: Use `BottomSheetModal` (from `@gorhom/bottom-sheet`) instead. It renders via a Portal above all views. Requires adding `BottomSheetModalProvider` in `App.tsx` inside `GestureHandlerRootView`. Open via `ref.current?.present()`, close via `ref.current?.dismiss()`. Cleanup on close via the `onDismiss` prop.
Discovered By: autonomous-orchestrator

### 2026-03-16 — React Native Modal conflicts with @gorhom/bottom-sheet on Android [SUPERSEDED]

Task: TASK-005
Context: Favorites picker overlay inside MealFormSheet
Problem: Using `React Native Modal` (transparent + animationType="slide") as a picker overlay while a BottomSheet is open causes gesture conflicts on Android — two overlapping native gesture responders, potential flicker, and section header i18n keys remained dead.
Solution: Use a second `BottomSheet` instance rendered as a sibling (inside the same `<>` fragment), controlled by state index. Use `BottomSheetSectionList` for grouped content and `BottomSheetBackdrop` for the backdrop. No `BottomSheetModalProvider` or App.tsx changes needed.
Discovered By: autonomous-orchestrator
NOTE: This entry was based on untested assumptions. See the 2026-03-17 entry below for the verified truth.

### 2026-03-17 — React Native Modal is the correct picker overlay; BottomSheetModal silently fails

Task: TASK-005 (definitive fix)
Context: Favorites picker overlay inside MealFormSheet — verified on physical Android device
Problem: BottomSheetModal.present() (v5) does nothing silently if any `BottomSheetModalInternalContext` hook fails. A second sibling BottomSheet with `index={-1}` also never opens because `handleSnapToIndex` guards on `isLayoutCalculated`, which is never set for a permanently-closed sheet. The previous attempt to use either of these resulted in a picker that silently never appeared.
Solution: Use React Native `Modal` (transparent, animationType="slide", statusBarTranslucent) as a picker overlay with a state boolean `showFavoritesPicker`. This approach was already proven working in TASK-004 and continues to work correctly alongside @gorhom/bottom-sheet. Use `SectionList` (not `BottomSheetSectionList`) inside the Modal for grouped content. Keep two sibling absolute-positioned elements inside the Modal: a backdrop `TouchableOpacity` (full-screen, dismisses on tap) and a sheet `View` (position: absolute, bottom: 0, maxHeight: 60%).
Discovered By: autonomous-orchestrator

Task: TASK-003
Context: Today tab date state in React Navigation bottom tabs
Problem: A tab screen that stores a browsed date in local state keeps that value across tab switches because the screen stays mounted.
Solution: Keep the date state in the screen, but reset it with a focus-driven effect when the tab becomes active again.
Discovered By: autonomous-orchestrator

### 2026-03-17 — Maestro E2E setup on Windows for Expo dev builds

Task: TASK-005 (Maestro setup)
Context: Automated E2E testing on Windows with Android emulator
Problem: Setting up Maestro test automation required several non-obvious steps: Java 17+ (Maestro 2.x requires Java 17+, not 8), correct ANDROID_HOME, Metro bundler on port 8081 for the dev build (not Expo Go on 8082), and using `npx expo run:android` to create the dev build APK.
Solution:

1. Install Java 21 LTS: `winget install EclipseAdoptium.Temurin.21.JDK`
2. Install Maestro: `curl -Ls "https://get.maestro.mobile.dev" | bash`
3. Add to PATH: JAVA_HOME, ANDROID_HOME/platform-tools, ANDROID_HOME/emulator, ~/.maestro/bin
4. Build dev APK: `JAVA_HOME="..." npx expo run:android` (installs `com.anonymous.mojamicha` on emulator)
5. Start Metro for dev build: `npx expo start --dev-client --port 8081` (NOT `--android` which picks Expo Go)
6. Launch app via ADB: `adb -s emulator-5554 shell am start -n com.anonymous.mojamicha/.MainActivity`
7. Run tests: `maestro test .maestro/smoke-*.yaml`
   Key pitfall: Dev build connects to host's localhost:8081 via 10.0.2.2:8081. If Metro runs on 8082 (Expo Go), the dev build gets a blank loading screen.
   Key pitfall: Maestro text input does NOT support Unicode — use ASCII only in `inputText` steps.
   Key pitfall: Quick-entry form testIDs differ from full form: use `meal-form-quick-input`/`meal-form-quick-save-btn` (NOT `meal-form-meal-text-input`/`meal-form-save-btn`).
   Discovered By: Ninja agent

### 2025-05-xx — BottomSheetTextInput is incompatible with ADB `input text` and `keyevent`

Task: TASK-008
Context: ADB-automated emulator smoke testing of TemplateFormSheet
Problem: `BottomSheetTextInput` from `@gorhom/bottom-sheet` v5 does not accept text from `adb shell input text "..."` or individual `adb shell input keyevent <code>` commands, even when the field has confirmed focus (`focused="true"` in UI dump). The field stays unchanged. This affects all smoke test scenarios that require form fill (template create/edit, meal quick-entry with BottomSheet components).
Solution: For ADB-only testing, limit automated checks to: navigation, empty state verification, sheet opening, field presence + testID verification, focus state, and Metro log inspection (zero errors). Full form-fill flows require either: (a) manual device testing, or (b) Maestro E2E with a dev build (`npx expo run:android`) using `inputText` YAML steps — Maestro routes text through the accessibility layer and correctly reaches BottomSheetTextInput.
Discovered By: Ninja agent

### 2026-03-18 — When removing i18n keys, remove only the exact target

Task: TASK-009
Context: Removing unused i18n keys (`chart_today`, `per_day`) from locale files
Problem: The `kcal_unit` key was accidentally deleted together with `per_day` because both were on adjacent lines and the replacement pattern inadvertently covered them.
Solution: Always scope each replacement to a single key change; verify remaining keys with grep after any i18n edit.
Discovered By: Ninja agent

### 2026-03-18 — BottomSheet above bottom tabs needs footer safe-area padding

Task: TASK-008
Context: TemplateFormSheet / MealFormSheet on screens with bottom tab navigation
Problem: A `BottomSheet` can render its last CTA partially behind the bottom tab bar when the sheet content relies only on static bottom padding. Adding `bottomInset` directly on the sheet can overcorrect and create a visible external gap above the tab bar.
Solution: Keep the sheet attached to the bottom edge and mirror `MealFormSheet`: add `useSafeAreaInsets()` only to the fixed footer padding. This keeps the CTA above the tab bar without creating a detached bottom gap.
Discovered By: Ninja agent

### 2026-03-18 — Keep Maestro selectors aligned with renamed navigation testIDs

Task: TASK-014
Context: Emulator smoke tests after the Today screen was merged into Journal
Problem: Existing Maestro flows still targeted the old `today-quick-entry-fab` testID, so automated emulator validation failed even though the UI worked correctly.
Solution: Whenever a screen or navigation concept is renamed, update `.maestro/*.yaml` selectors in the same task. Smoke tests should reference current testIDs such as `journal-quick-entry-fab`.
Discovered By: Ninja agent

### 2026-03-22 — Abort in-flight async state updates with a generation ref

Task: TASK-015
Context: DayView daily AI insight — navigating to a new date while getDailyInsight is in-flight
Problem: When the user changes dates, `loadData` resets `aiInsight` to null, but the old promise resolves after the reset and overwrites it with stale data. Standard cleanup via useEffect return value doesn't apply to ad-hoc async callbacks.
Solution: Use a `useRef` generation counter (`insightAbortRef`). `loadData` increments it (and synchronously resets the loading spinner). The async callback captures the counter _before_ the await, then compares after — skipping state updates if the counter changed. This is safe, simple, and doesn't require AbortController on the React side.
Discovered By: Ninja agent

### 2026-03-22 — module-scope constants for static option lists in Settings

Task: TASK-015
Context: SettingsScreen model selector
Problem: Declaring a `const MODEL_OPTIONS = [...] as const` inside the component body causes it to be recreated on every render, and prevents use of `DEFAULT_OPENAI_MODEL` (imported constant) in the initializer without additional imports.
Solution: Move static arrays to module scope (before the `export default function` line). They become stable references and can reference module imports freely.
Discovered By: Ninja agent (code-review-subagent raised this)
