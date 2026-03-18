# TASK-013 — Star toggling on meal cards

## Goal
Add a ⭐ button to each meal card in DayView. Tapping it toggles the starred
state: creates or removes a 'starred' entry in the `favorites` table AND syncs
the `isStarred` field on the meal row.

## Acceptance Criteria
- Each meal card has a star icon button on the right side
- Filled star (⭐) when `meal.isStarred === 1`; outline star when `0`
- Tapping toggles: if unstarred → create favorites entry + setMealStarred(true);
  if starred → delete favorites entry + setMealStarred(false)
- Uses `toggleStarredMeal(db, ...)` from `db/favorites.ts` (handles favorites sync)
  + `setMealStarred(db, ...` from `db/meals.ts` (syncs the isStarred field on meal)
- The DayView reloads meal list after each toggle so the UI updates
- Star action is immediate (no confirmation dialog)
- `testID` on the star button: `meal-star-btn-{meal.id}`
- `accessibilityLabel` changes based on starred state (i18n)
- No change to DayViewProps interface beyond what's needed (self-contained)

## Changed Files
- `i18n/en.json` — add `dayView.btn_star`, `dayView.btn_unstar`
- `i18n/pl.json` — same
- `components/DayView.tsx` — star button in renderMeal, handler, imports

## Implementation Notes
- `toggleStarredMeal` in `db/favorites.ts` already handles full favorites sync
  (create/delete starred favorite entry). Returns `true` if now starred.
- Also call `setMealStarred(db, id, newStarred)` to keep `meals.isStarred` in sync
- Star button goes to the right of the meal body (mealCard is already flexDirection row)
- Name to use for the favorite: `meal.mealText` (truncation if needed is handled by DB)
- Do NOT trigger the onMealPress callback on the star tap (stopPropagation implicitly via separate button)
