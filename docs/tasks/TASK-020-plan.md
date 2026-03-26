# TASK-020 Plan: Suggestion Chips — Mode-Specific Limits and Space-Efficient Sorting

## Goal

Improve the suggestion chip UX in `MealFormSheet`:

- Quick entry (50% snap): maximum **3** chips
- Full form (92% snap): maximum **7** chips
- Chips sorted **shortest-first** after slicing so `flexWrap` fills rows more efficiently

## Scope

Single file: `components/MealFormSheet.tsx`

## Changes

1. Replace `MAX_SUGGESTIONS = 6` with `MAX_SUGGESTIONS_QUICK = 3` and `MAX_SUGGESTIONS_FULL = 7`.
2. Add module-scope helper `sortChipsByLength(chips: string[]): string[]` (sort by `.length` ascending).
3. In the full-form suggestion render: `sortChipsByLength(filteredSuggestions.slice(0, MAX_SUGGESTIONS_FULL)).map(...)`.
4. In the quick-entry suggestion render: `sortChipsByLength(filteredSuggestions.slice(0, MAX_SUGGESTIONS_QUICK)).map(...)`.

**Slice before sort** — preserves "most recent first" priority for selection; sort is display-only.

## Acceptance Criteria

- Quick entry shows ≤ 3 chips; full form shows ≤ 7 chips.
- Chips within each group are sorted shortest text first.
- No TypeScript errors; lint clean.
- No regression in chip tap behavior, i18n, or theming.
