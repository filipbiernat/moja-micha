# TASK-008 Plan — Favorites Screen (Stage 9)

## Objective

Implement a fully functional Favorites screen with two tabs (Templates | Starred), template CRUD
via bottom sheet, starred-list unstarring, and "use" action that immediately creates a new journal
entry.

## Acceptance Criteria

- Segmented control switches between Templates and Starred tabs
- Templates tab: create / edit / delete templates via bottom sheet; list items with Use + Edit + Delete actions
- Starred tab: list items with Use + Unstar actions; no entries visible when list is empty
- "Use" creates a new meal (today's date, current time, auto meal-type) immediately — no form shown
- Unstar: removes the favorites row AND sets `isStarred = 0` on referenced meal
- Delete template: confirmation Alert → delete
- All text through i18n keys (PL + EN)
- Theme colors only through the theme system
- testID on every interactive element
- TypeScript strict — no implicit `any`

## Decisions

- Tabs: segmented control (two TouchableOpacity buttons styled as pills)
- "Use" → immediate create (no pre-fill form)
- Template form: @gorhom/bottom-sheet (consistent with MealFormSheet)
- Starred section: shows name + mealText + calories; Use and Unstar actions

## Phased Plan

### Phase A — DB + i18n

1. Add `setMealStarred(db, id, isStarred)` to `db/meals.ts`
2. Add `favorites` i18n keys to `pl.json` and `en.json`

### Phase B — TemplateFormSheet component

3. Create `components/TemplateFormSheet.tsx` (bottom sheet, forwardRef pattern)
4. Export from `components/index.ts`

### Phase C — FavoritesScreen

5. Implement `app/screens/FavoritesScreen.tsx` replacing the placeholder

### Phase D — Checks & cleanup

6. Run tsc and fix any TypeScript errors
7. Update GamePlan.md checkboxes

## Files Changed

| File                               | Change                 |
| ---------------------------------- | ---------------------- |
| `db/meals.ts`                      | Add `setMealStarred`   |
| `i18n/pl.json`                     | Add `favorites.*` keys |
| `i18n/en.json`                     | Add `favorites.*` keys |
| `components/TemplateFormSheet.tsx` | New component          |
| `components/index.ts`              | Export new component   |
| `app/screens/FavoritesScreen.tsx`  | Full implementation    |
| `GamePlan.md`                      | Check stage 9 items    |
| `docs/tasks/TASK-008-plan.md`      | This file              |
