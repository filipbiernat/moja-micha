# TASK-012 — Recent meals autocomplete

## Goal
Show autocomplete suggestions (N most recent unique meal texts) below the "Meal" text input
in MealFormSheet. Available in both quick-entry and full-form modes.

## Acceptance Criteria
- DB: `getRecentUniqueMeals(db, 10)` is called when the form opens
- Suggestions are shown as horizontal chip row below the meal text input
- Suggestions are filtered by the current typed text (case-insensitive substring)
- Tapping a chip fills the meal text field and hides suggestions
- Works in both quick-entry (SNAP_QUICK) and full-form (SNAP_FULL) modes
- No visible suggestions when there are no recent meals or no matches
- All UI text uses i18n keys
- testID added to suggestion chips

## Changed Files
- `i18n/en.json` — no label needed; chips are self-describing
  (Optionally `mealForm.recent_label`)
- `i18n/pl.json` — same
- `components/MealFormSheet.tsx` — state + render logic
- `docs/tasks/TASK-012-plan.md`

## Implementation Notes
- `getRecentUniqueMeals` already exists in `db/meals.ts` (returns `string[]`)
- Limit: 10 suggestions
- Use `useMemo` for `filteredSuggestions` to avoid recompute on every render
- Filter: if `mealText.trim()` is empty → show all; else filter where suggestion
  includes typed text (case-insensitive)
- UI: horizontal `ScrollView` with compact pills
- Should NOT use `BottomSheetScrollView` (it's horizontal, won't conflict)
