# TASK-004 Plan — Meal Add/Edit Form (Stage 7)

## Objective
Implement the full meal add/edit form (GamePlan stage 7) with a quick-entry bottom sheet
and a full expanded form. All layout and keyboard interactions must keep buttons visible.

## Acceptance Criteria
- [ ] FAB opens quick entry bottom sheet (50% height)
- [ ] Quick entry: multiline meal text input + Expand + Save buttons
- [ ] Expand button transitions to full form (92% height)
- [ ] Full form: meal type chips, date picker, time picker, meal text, calories, notes
- [ ] Date and time use native `@react-native-community/datetimepicker` dialogs
- [ ] Keyboard appears → buttons always remain visible (sheet moves up, scroll shrinks)
- [ ] Validation: meal text required
- [ ] Save new meal → updates list on current day
- [ ] Tapping a meal card opens edit mode (full form, pre-filled)
- [ ] Edit saves updated record
- [ ] Cancel / close resets form state
- [ ] All text via i18n keys (PL + EN)
- [ ] All colors from theme tokens

## Packages Installed
- `@react-native-community/datetimepicker` (added by this task)

## Files to Create / Modify

| Action | File | Reason |
|--------|------|--------|
| Modify | `utils/index.ts` | Add `getMealTypeForCurrentTime`, `getLocalDateString`, `getLocalTimeString` |
| Modify | `i18n/en.json` | Add `mealForm.*` namespace |
| Modify | `i18n/pl.json` | Add `mealForm.*` namespace |
| Create | `components/MealFormSheet.tsx` | Full add/edit bottom sheet form |
| Modify | `components/DayView.tsx` | Add `onMealPress?: (meal: Meal) => void` prop |
| Modify | `components/index.ts` | Export `MealFormSheet` |
| Modify | `app/screens/TodayScreen.tsx` | Replace inline sheet with `MealFormSheet`, wire edit handler |

## Layout Architecture

```
BottomSheet (snapPoints=["50%", "92%"], keyboardBehavior="interactive")
│
├── Quick Entry (index 0)
│    └── BottomSheetView
│         ├── Header: title + close
│         ├── BottomSheetTextInput (multiline, flex: 1 natural)
│         ├── Validation error
│         └── Row: [Expand button] [Save button]
│
└── Full Form (index 1)
     └── View (flex: 1)
          ├── Header: back arrow + title + close
          ├── BottomSheetScrollView (flex: 1)  ← shrinks when keyboard opens
          │    ├── Meal type chips (flex-wrap row)
          │    ├── Date button + Time button (side by side)
          │    ├── Meal text input (multiline, minHeight 80)
          │    ├── Calories input (numeric)
          │    └── Notes input (multiline, minHeight 60)
          └── Footer (fixed): [Cancel] [Save]  ← always visible above keyboard
```

## Phase
Single phase — all files in one implementation pass.
