# TASK-008 Complete — Favorites Screen (Stage 9)

## Summary

Implemented the full Favorites screen (GamePlan stage 9), including two follow-up bugfixes
found during the user's review session.

Completed an additional follow-up pass after emulator testing feedback:

- unified sorting UX between Journal and Favorites with a shared control,
- fixed TemplateFormSheet bottom inset so the save CTA is fully visible,
- moved meal deletion from the Journal card into the Edit Meal flow.

Completed another UX pass after further feedback:

- removed the separate `Use` button from Favorites cards and moved the action to card tap,
- changed TemplateFormSheet to open immediately at the larger snap point so most of the form is visible.

## What was delivered

### Phase A — DB + i18n

- `db/meals.ts`: added `setMealStarred(db, id, starred)` — explicit starred setter used when unstarring from Favorites
- `i18n/pl.json` + `i18n/en.json`: added `favorites.*` namespace (34 keys) and `dayView.delete_confirm_*` + `favorites.sort_by_*` keys

### Phase B — TemplateFormSheet

- `components/TemplateFormSheet.tsx`: new BottomSheet component (`forwardRef` / `useImperativeHandle`) for create/edit templates; consistent with MealFormSheet pattern

### Phase C — FavoritesScreen

- `app/screens/FavoritesScreen.tsx`: replaced placeholder with full implementation:
    - Segmented control (Templates / Starred)
    - Templates tab: FlatList, sort toggle (A–Z / Newest), FAB, card tap to use + Edit + Delete
    - Starred tab: FlatList, card tap to use + Unstar; empty states for both tabs
    - "Use" → `createMeal` with today's date/time/meal-type → success Alert

### Bugfixes (follow-up)

- **FavoritesScreen**: added `templateSort` state and `sortedTemplates` useMemo (A–Z / Newest-first toggle)
- **JournalScreen**: added `setRefreshKey((prev) => prev + 1)` in `useFocusEffect` → Journal now refreshes immediately when switching tabs after "Use"
- **DayView**: added delete button (trash icon with Alert confirmation) to every meal card; using `deleteMeal` + `loadData` internally

### Bugfixes (post-emulator feedback)

- **Sort UX**: extracted shared `SortCycleButton` and reused it in Journal + Favorites with the same three options: newest, oldest, A-Z
- **TemplateFormSheet**: aligned with `MealFormSheet` layout pattern: fixed footer with safe-area padding, no external bottom gap above the tab bar
- **MealFormSheet / DayView**: removed inline delete from Journal cards and added `meal-form-delete-btn` in edit mode with confirmation dialog

### Bugfixes (UX follow-up)

- **FavoritesScreen**: removed standalone `Use` buttons from cards and bound `handleUse` to the tappable card content
- **TemplateFormSheet**: changed default open behavior from the smaller snap point to the larger one so the form opens high enough to be useful immediately

## Files changed

| File                               | Change                                       |
| ---------------------------------- | -------------------------------------------- |
| `db/meals.ts`                      | Added `setMealStarred`                       |
| `i18n/pl.json`                     | Added favorites + dayView delete + sort keys |
| `i18n/en.json`                     | Added favorites + dayView delete + sort keys |
| `components/TemplateFormSheet.tsx` | New component                                |
| `components/index.ts`              | Export TemplateFormSheet                     |
| `app/screens/FavoritesScreen.tsx`  | Full implementation + sort bugfix            |
| `app/screens/JournalScreen.tsx`    | refreshKey on focus bugfix                   |
| `components/DayView.tsx`           | Shared sort control + remove inline delete   |
| `components/MealFormSheet.tsx`     | Delete from edit flow                        |
| `components/SortCycleButton.tsx`   | Shared sort UI                               |
| `GamePlan.md`                      | Stage 9 items checked                        |

## Review

- Review 1: NEEDS_REVISION → fixes applied
- Review 2: APPROVED
- Review 3 (bugfixes): APPROVED

See: `docs/reviews/TASK-008-review.md`

## Testing

Manual testing required. See: `docs/testing/TASK-008-test.md`

## Handoff checklist

- [x] Code staged and committed
- [x] TypeScript: zero errors
- [x] All i18n keys present in PL + EN
- [x] testID on all interactive elements
- [x] GamePlan.md stage 9 checked
- [x] Review report: `docs/reviews/TASK-008-review.md`
- [x] Test plan: `docs/testing/TASK-008-test.md`
- [x] Manual Testing Required: **yes** (see test plan)
