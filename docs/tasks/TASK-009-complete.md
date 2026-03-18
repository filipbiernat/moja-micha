# TASK-009 Complete — Statistics Screen

## Status: awaiting manual testing

## Phase Summary

Implemented the complete Statistics screen (Stage 10 of GamePlan).

### What was built

- **Period toggle** (7 days / 30 days) with animated active state
- **Custom SVG bar chart** using `react-native-svg` — bars proportional to daily calorie totals, today's bar highlighted in secondary color
- **Moving average trend line** — 3-day window for 7d view, 7-day for 30d view; rendered as per-run segments (no bridging over data gaps)
- **Horizontal grid lines** with Y-axis kcal labels (auto-scaled to nearest 500 kcal)
- **X-axis labels** — short weekday names (7d) or day numbers every 5 bars (30d)
- **30-day chart is horizontally scrollable**
- **Summary row** — Avg / Max / Min daily calories (only days with actual calorie data)
- **Streak section** — current streak + all-time record, each with emoji
- **Empty state** — shown when no calorie data exists in the selected range
- **Bug fix** in `db/meals.ts`: `getCalorieSummary` used `ne(calories, sql\`NULL\`)`which always evaluated to NULL (filtering all rows); fixed to`isNotNull(calories)`
- **New DB function** `getRecordStreak()` — computes all-time longest streak

### Files Changed

- `app/screens/StatsScreen.tsx` — full implementation
- `db/meals.ts` — bug fix + getRecordStreak
- `db/index.ts` — export getRecordStreak
- `i18n/pl.json` — stats section (16 keys)
- `i18n/en.json` — stats section (16 keys)
- `package.json` / `package-lock.json` — added react-native-svg
- `GamePlan.md` — Stage 10 all checkboxes marked done

## Handoff Checklist

- [x] Code changes staged
- [x] GamePlan.md updated
- [x] docs/tasks/TASK-009-plan.md exists
- [x] docs/reviews/TASK-009-review.md exists — APPROVED
- [x] docs/testing/TASK-009-test.md exists
- [x] TypeScript — zero errors
- [x] Minor review issues fixed (unused i18n keys removed, MA polyline segmented, plural fixed)
- [ ] Manual UI testing on emulator — **PENDING**

## Review Report

`docs/reviews/TASK-009-review.md` — APPROVED with 3 minors (all fixed)

## Test Report

`docs/testing/TASK-009-test.md` — Manual testing required

## Proposed Commit Message

```
feat(stats): implement statistics screen with calorie chart

- Add bar chart (SVG) showing daily calorie totals for 7 or 30-day period
- Add moving average trend line segmented to avoid bridging data gaps
- Add summary row (avg/max/min) across days with calorie data
- Add streak cards (current and all-time record)
- Add empty state for no-calorie-data scenario
- Highlight today bar in secondary color; auto-scale Y axis to nearest 500 kcal
- Fix getCalorieSummary: replace ne(calories, NULL) with isNotNull (was filtering all rows)
- Add getRecordStreak() for all-time longest streak calculation
- Install react-native-svg for SVG chart primitives
- Add stats i18n section (PL + EN, 16 keys each)
```
