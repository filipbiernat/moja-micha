# TASK-007 Plan — Unified Journal Screen

## Goal

Replace the separate "Today" and "History" tabs with a single "Dziennik" tab.
The new screen has a collapsible calendar (hidden by default), Material-style year/month picker,
and retains all functionality of both old screens.

## User Decisions

- Tab name: **Dziennik** (EN: Journal)
- Calendar toggle: **Option D** — tap on date text OR calendar icon (chevron in date row); tap outside DayView area also closes
- Year navigation: **Option I** — tap month/year title → year grid → month grid → back to day view

## Acceptance Criteria

1. "Dziś" and "Historia" tabs replaced by single "Dziennik" tab (`journal` icon).
2. JournalScreen opens on today's date. Calendar is collapsed by default.
3. Tap on the date row in DayView header (or the chevron) → calendar expands with animation (~250 ms).
4. Tap the same date row again → calendar collapses.
5. Tap a day in the expanded calendar → DayView shows that day; calendar collapses.
6. Tap anywhere on the DayView area while calendar is open → calendar closes.
7. Tap the month/year title in the calendar → year grid overlay appears (centered modal).
8. Select a year → month grid overlay; select a month → calendar navigates, overlay closes.
9. Days with meals show a dot mark (primary color).
10. Swipe left/right in DayView navigates days; calendar month follows.
11. DayView and FAB work as before: tap meal → edit form; FAB → add form.
12. `useFocusEffect` resets to today and collapses calendar on tab re-focus.
13. All strings through i18n; all colors through theme.
14. TypeScript strict, no implicit `any`.

## Files Changed

| File | Change |
|------|--------|
| `components/DayView.tsx` | Add `onCalendarToggle` + `calendarExpanded` optional props |
| `app/screens/JournalScreen.tsx` | New screen |
| `App.tsx` | Replace Today+History with Journal |
| `i18n/pl.json` | Add `tabs.journal`, `dayView.toggle_calendar` |
| `i18n/en.json` | Same |
| `app/screens/TodayScreen.tsx` | Deleted |
| `app/screens/HistoryScreen.tsx` | Deleted |
| `GamePlan.md` | Update task descriptions for stages 6 & 8 |

## Architecture

### DayView changes
- `onCalendarToggle?: () => void` — if provided, date area becomes TouchableOpacity
- `calendarExpanded?: boolean` — drives chevron direction indicator

### JournalScreen structure
```
SafeAreaView
  Animated.View [calendarContainer, height-animated 0↔380]
    Calendar [customHeaderTitle = tappable month/year title]
  View [dayViewWrapper, flex:1]
    DayView [onCalendarToggle, calendarExpanded]
    {calendarExpanded && TWF > absoluteFill overlay → closeCalendar}
  FAB
  MealFormSheet
  Modal [year/month picker]
    backdrop TWF
      pickerCard
        pickerHeader [back btn + close btn]
        year grid OR month grid (flex-wrap View + cells)
```

### Calendar height
Constant `CALENDAR_HEIGHT = 380`. `overflow: hidden` clips any overflow.

### Year picker
`pickerYear ± YEAR_RANGE (6)` = 13 years in a 4-column grid.
Tap year → show month grid for that year.
Tap month → `setVisibleMonthKey` → picker closes.

## Relevant Lessons Applied

- 2026-03-16: `DateTimePicker` must be sibling of BottomSheet (unchanged, already in MealFormSheet)
- 2026-03-17: React Native `Modal` is correct for picker overlays
- 2026-03-16: `useFocusEffect` to reset date on tab focus
