# TASK-013 Complete — Star Toggle on Meal Cards

## Summary
Added a ⭐ star toggle button to each meal card in DayView. Pressing the button toggles the meal's starred state in the meals table and synchronises the favorites table, so the meal appears/disappears in the Favorites → Oznaczone gwiazdką tab immediately.

## Scope
- `components/DayView.tsx` — `handleStarToggle` callback; star `TouchableOpacity` in `renderMeal`; `starBtn` style
- `i18n/en.json` / `i18n/pl.json` — `dayView.btn_star`, `dayView.btn_unstar`
- `docs/tasks/TASK-013-plan.md` — planning artifact
- `GamePlan.md` — stages 12 and 13 marked `[x]`

## Handoff Checklist
- [x] Implementation complete and staged
- [x] TypeScript clean (`npx tsc --noEmit`)
- [x] Code review: APPROVED (cycle 2)
- [x] Emulator test: PASSED — ADB tap simulation confirmed star toggle + Favorites sync
- [x] Review report: `docs/reviews/TASK-013-review.md`
- [x] Test report: `docs/testing/TASK-013-test.md`
- [x] GamePlan.md updated (stages 12 + 13 checked)
- [x] No unstaged task-related leftovers
- [x] `./tmp/` artifacts cleaned

## Review Report
`docs/reviews/TASK-013-review.md`

## Test Report
`docs/testing/TASK-013-test.md`

## Commit Message
```
feat(journal): add star toggle button to meal cards

- Add handleStarToggle callback in DayView; calls toggleStarredMeal to
  sync favorites table and setMealStarred to update the meal row
- Render Ionicons star/star-outline button after each meal body with
  testID and accessibilityLabel i18n keys
- Add dayView.btn_star / dayView.btn_unstar to en.json and pl.json
```
