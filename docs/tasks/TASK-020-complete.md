# TASK-020 Complete: Suggestion Chips — Mode-Specific Limits and Space-Efficient Sorting

## Summary

Improved the suggestion chip UX in `MealFormSheet` by applying mode-specific display limits and shortest-first sorting for better space utilization in the flexWrap row layout.

## Changes

- `components/MealFormSheet.tsx`:
  - Replaced `MAX_SUGGESTIONS = 6` with `MAX_SUGGESTIONS_QUICK = 3` and `MAX_SUGGESTIONS_FULL = 7`
  - Added module-scope helper `sortChipsByLength(chips: string[]): string[]`
  - Quick entry: renders `sortChipsByLength(filteredSuggestions.slice(0, MAX_SUGGESTIONS_QUICK))`
  - Full form: renders `sortChipsByLength(filteredSuggestions.slice(0, MAX_SUGGESTIONS_FULL))`
- `docs/tasks/TASK-020-plan.md`: task plan

## Handoff Checklist

- [x] Code changes staged in `components/MealFormSheet.tsx`
- [x] Task plan at `docs/tasks/TASK-020-plan.md`
- [x] Review report: `docs/reviews/TASK-020-review.md` — APPROVED
- [x] Test report: `docs/testing/TASK-020-test.md`
- [ ] **Manual testing required** — pending human verification on emulator
- [ ] Commit pending manual testing sign-off

## Proposed Commit Message

```
feat(meal-form): limit and sort suggestion chips per form mode

- Quick entry: show at most 3 recent suggestion chips (was 6)
- Full form: show at most 7 recent suggestion chips (was 6)
- Sort displayed chips shortest-first so flexWrap rows fill efficiently,
  avoiding gaps caused by long chips between shorter ones
- Slice before sort to preserve recency ordering for the selection pool
```
