# TASK-006 Plan — History Screen (Stage 8)

## Goal

Implement the History screen with a full calendar view, marked days, and day-level navigation/editing.

## Scope

GamePlan stage 8 — all 5 checklist items:

- Calendar view (`react-native-calendars`)
- Days with entries marked (dot/color)
- After selecting a date: DayView shown with calendar above as context strip
- Swipe between days in history view (via DayView PanResponder)
- Edit meals from previous days (via MealFormSheet)

## Acceptance Criteria

1. HistoryScreen shows a themed `Calendar` from `react-native-calendars` at the top.
2. Every date that has at least one meal is marked with a dot.
3. Selecting a date on the calendar moves DayView to that date.
4. Swiping DayView left/right navigates days; calendar updates to reflect the active date (and month).
5. Tapping a meal card in DayView opens `MealFormSheet` for editing.
6. Saving a meal refreshes the DayView and re-loads marked dates.
7. All text through i18n; all colors through theme system.
8. TypeScript strict, no implicit `any`.

## Files Changed

| File                            | Change                                                    |
| ------------------------------- | --------------------------------------------------------- |
| `db/meals.ts`                   | Add `getDatesWithMeals(db, startDate, endDate): string[]` |
| `db/index.ts`                   | Export `getDatesWithMeals`                                |
| `app/screens/HistoryScreen.tsx` | Full implementation (replace placeholder)                 |
| `GamePlan.md`                   | Check off all 5 stage-8 items                             |

## Architecture Notes

- **State**: `selectedDate` (YYYY-MM-DD) + `visibleMonth` (YYYY-MM-DD of 1st) + `markedDates` + `refreshKey`.
- `Calendar` uses `key={selectedDate.substring(0,7)}` so it re-renders cleanly when the month changes due to DayView swipe.
- `onMonthChange` on Calendar updates `visibleMonth`, triggering a fresh `getDatesWithMeals` load.
- `getDatesWithMeals` uses `selectDistinct` on date column, no extra aggregation.
- DayView + MealFormSheet: same pattern as TodayScreen.
- No new i18n keys required (DayView + calendar renders own UI).

## Relevant Lessons Applied

- Lesson 2026-03-16: DateTimePicker must be sibling of BottomSheet (already in MealFormSheet, not changed here).
- Lesson 2026-03-17: Use React Native Modal for any overlay pickers (already handled in MealFormSheet).
- Lesson 2026-03-16: Reset date state on focus (useFocusEffect).
