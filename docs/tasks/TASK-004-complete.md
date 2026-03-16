# TASK-004 Complete — Meal Add/Edit Form (Stage 7)

## Summary

Implemented the full meal add/edit form (GamePlan stage 7) as a reusable `MealFormSheet` component.

### What was built

- **Quick entry mode** (50% sheet): single multiline meal-text input + Expand + Save. Auto-detects meal type by time of day.
- **Full form mode** (92% sheet): meal type chips (6 options, flex-wrap), date picker, time picker, meal text, calories, notes. Fixed footer with Cancel/Save always visible above keyboard.
- **Edit mode**: tapping any meal card in DayView opens the full form pre-filled.
- Native date/time pickers via `@react-native-community/datetimepicker` (installed).
- Keyboard safe: `keyboardBehavior="interactive"` + footer outside `BottomSheetScrollView`.
- All text through i18n (PL + EN), all colors from theme tokens.

### Files changed

| File                            | Change                                                                  |
| ------------------------------- | ----------------------------------------------------------------------- |
| `components/MealFormSheet.tsx`  | Created — full add/edit bottom sheet form                               |
| `app/screens/TodayScreen.tsx`   | Refactored to use MealFormSheet                                         |
| `components/DayView.tsx`        | Added `onMealPress` prop; meal cards now tappable                       |
| `components/index.ts`           | Added MealFormSheet exports                                             |
| `utils/index.ts`                | Added getMealTypeForCurrentTime, getLocalDateString, getLocalTimeString |
| `i18n/en.json` + `i18n/pl.json` | Added `mealForm.*` namespace (19 keys each)                             |
| `package.json`                  | Added @react-native-community/datetimepicker                            |

## Handoff checklist

- [x] TypeScript: `npx tsc --noEmit` → 0 errors
- [x] Staged: yes (`git add -A`)
- [x] Staged scope hygiene: clean (only TASK-004 files)
- [x] Review: APPROVED (TASK-004-review.md)
- [x] Test report: TASK-004-test.md
- [x] Manual Testing Required: **yes** (device/emulator needed)
- [x] Lessons learned updated

## Manual test preconditions

Run `npx expo start` from `c:\Filip\SW\MojaMicha` and scan the QR code with Expo Go on Android.

Key test cases:

1. FAB → quick entry → type text → Save → meal appears in list
2. FAB → quick entry → Save empty → validation error shown
3. FAB → Expand → all fields visible → Date button opens date picker → Time button opens time picker → selecting meal type chip highlights it → Save saves correctly
4. Tap meal card → edit form pre-filled → change data → Save → list updated
5. Open full form → tap input field → keyboard appears → Save button remains visible above keyboard

## Commit message

`feat(meal-form): add full meal add/edit form with quick entry and expanded form`
