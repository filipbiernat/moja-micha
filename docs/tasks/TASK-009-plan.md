# TASK-009 Plan — Statistics Screen (Stage 10)

## Goal

Implement the full Statistics screen (Etap 10 from GamePlan):

- Period toggle: 7 days / 30 days
- Bar chart: calories per day using SVG
- Trend line: moving average (3-day for 7d view, 7-day for 30d view)
- Summary row: avg / max / min daily calories
- Streak cards: current and record streak
- Empty state when no calorie data

## Acceptance Criteria

- [ ] Period toggle (7d/30d) switches chart data
- [ ] Bar chart shows one bar per day, height proportional to calories
- [ ] Moving average polyline drawn over bars (trend line)
- [ ] Grid lines with kcal labels on Y axis
- [ ] Day labels on X axis
- [ ] Summary row shows avg/max/min (only days with calorie data)
- [ ] Streak section shows current streak and all-time record
- [ ] Empty state shown when no calorie data in range
- [ ] All text through i18n keys
- [ ] Theme colors only (no hardcoded colors)
- [ ] TypeScript strict - no implicit any
- [ ] GamePlan checkboxes updated

## Files Changed

1. `db/meals.ts` — fix `getCalorieSummary` (use `isNotNull`), add `getRecordStreak()`
2. `db/index.ts` — export `getRecordStreak`
3. `i18n/pl.json` — add `stats` section
4. `i18n/en.json` — add `stats` section
5. `app/screens/StatsScreen.tsx` — full implementation
6. `GamePlan.md` — mark Stage 10 checkboxes as done

## Technical Decisions

- **Chart library**: `react-native-svg` (Expo SDK 54 bundled) — no custom native build needed
- **Chart rendering**: Custom SVG using `Rect`, `Polyline`, `Line`, `Text` primitives
- **30d chart**: Horizontal ScrollView wrapping SVG
- **7d chart**: Fits screen width, no scroll
- **Y-axis**: Embedded in SVG left margin (Y_AXIS_WIDTH=40)
- **Moving average window**: 3-day for 7d view, 7-day for 30d view
- **getCalorieSummary bug**: Replace `ne(meals.calories, sql\`NULL\`)`with`isNotNull(meals.calories)`(the original`!=NULL` comparison is always NULL in SQL)

## Bug Fix

`getCalorieSummary` had `ne(meals.calories, sql\`NULL\`)`which generates`calories != NULL`in SQL — always`NULL`(falsy), filtering out ALL rows. Fixed to`isNotNull(meals.calories)`.
