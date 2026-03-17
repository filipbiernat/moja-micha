# Code Review: TASK-006 — History Screen (Stage 8)

**Status:** APPROVED (all 4 minor issues fixed before commit)

**Summary:** All 8 acceptance criteria are met. The implementation is correct, well-structured, and consistent with project conventions. Four minor issues were identified and resolved inline before the commit.

---

## Candidate Scope

| File                            | Staged |
| ------------------------------- | ------ |
| `app/screens/HistoryScreen.tsx` | ✅     |
| `db/meals.ts`                   | ✅     |
| `db/index.ts`                   | ✅     |
| `GamePlan.md`                   | ✅     |
| `docs/tasks/TASK-006-plan.md`   | ✅     |

**Candidate Scope Match:** matched

---

## Issues Found

### [MINOR] `todayBackgroundColor: 'transparent'` is a hardcoded color literal

**File:** [app/screens/HistoryScreen.tsx](../../../app/screens/HistoryScreen.tsx) — `calendarTheme` block

The `calendarTheme` object sets `todayBackgroundColor: 'transparent'` as a raw string. Every other entry correctly reads from `colors.*`. The string `'transparent'` is structurally safe (it is a valid React Native color value and never changes between themes), but it is a project-convention violation: all colors should come from the theme system.

**Suggested fix:** Add `todayBackground: 'transparent' as const` to `ColorTokens` and both theme objects, or accept this as a deliberate one-off if both themes genuinely intend transparent.

---

### [MINOR] `calendarTheme` and `computedMarkedDates` are re-created on every render

**File:** [app/screens/HistoryScreen.tsx](../../../app/screens/HistoryScreen.tsx)

Both objects are constructed inline without `useMemo`. Since the Calendar is already re-keyed on month changes (`key={visibleMonthKey}`), this triggers an internal full re-mount of the Calendar widget on every state update to the parent — not just on month changes. Memoizing both objects would eliminate unnecessary work.

This has no correctness impact on the current feature set, but it creates avoidable re-render overhead whenever unrelated state (e.g. `selectedDate`) changes while the month stays the same.

---

### [MINOR] `markedDates` state typed as `Record<string, object>` — loose intermediate type

**File:** [app/screens/HistoryScreen.tsx](../../../app/screens/HistoryScreen.tsx)

```ts
const [markedDates, setMarkedDates] = useState<Record<string, object>>({});
```

The held value is actually `Record<string, { marked: boolean; dotColor: string }>`. Using `object` is not `any`, so it does not violate the strict/no-implicit-any rule, but it discards type information unnecessarily. If marks are later extended (e.g. selected streaks), the loose type invites mistakes at merge sites.

---

### [MINOR] `handleSaved` does not sync `visibleMonthKey` when saved date is in a different month

**File:** [app/screens/HistoryScreen.tsx](../../../app/screens/HistoryScreen.tsx)

```ts
const handleSaved = useCallback((savedDate: string) => {
    setSelectedDate(savedDate);
    setRefreshKey((prev) => prev + 1);
}, []);
```

If a user opens a meal from month A, changes its date to month B, and saves — `selectedDate` jumps to month B but `visibleMonthKey` remains at month A. The DayView renders the new date correctly, but the Calendar widget continues showing month A with no selected-date highlight. `loadMarkedDates` also reloads marks for month A, so the dot for the new date in month B is never shown until the user manually navigates there.

This only manifests when editing a meal's date across a month boundary — an edge case. It does not affect the core swipe and press navigation flows assessed by AC 3–6.

---

## Acceptance Criteria Verification

| #   | Criterion                             | Result                                                                                                                  |
| --- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | Themed `Calendar` at top              | ✅ — `react-native-calendars` `Calendar` with full `calendarTheme` from `useTheme()`                                    |
| 2   | Dates with meals marked with a dot    | ✅ — `getDatesWithMeals` + `marked: true, dotColor: colors.primary`                                                     |
| 3   | Calendar date selection → DayView     | ✅ — `handleDayPress` → `setSelectedDate`                                                                               |
| 4   | DayView swipe → Calendar month sync   | ✅ — `handleDateChange` sets both `selectedDate` and `visibleMonthKey`; `key={visibleMonthKey}` forces calendar remount |
| 5   | Meal card tap → MealFormSheet edit    | ✅ — `handleMealPress` → `formSheetRef.current?.openEdit(meal)`                                                         |
| 6   | Save → DayView refresh + marks reload | ✅ — `refreshKey` bump triggers `loadMarkedDates` via `useEffect`                                                       |
| 7   | i18n / theme compliance               | ✅ — no hardcoded user-visible strings; all colors from `colors.*` except one `'transparent'` noted above               |
| 8   | TypeScript strict, no errors          | ✅ — `get_errors` returned no errors; no implicit `any`                                                                 |

---

## Correctness Notes

**`getDatesWithMeals`:** Uses Drizzle `selectDistinct` with `gte`/`lte` range predicates. Correct. The `end` bound of day 31 in `monthRangeForDate` works correctly because SQLite performs lexicographic string comparison on `YYYY-MM-DD`; `'2024-02-31'` sorts after any valid February date, correctly including all days in the month.

**Calendar `key` prop strategy:** Using `key={visibleMonthKey}` to force a full re-mount when the month changes is the correct solution for `react-native-calendars` Calendar (whose internal `current` prop does not reliably trigger month navigation after mount). This is sound.

**`onMonthChange` `dateString` format:** `react-native-calendars` passes the first day of the month (e.g. `"2024-03-01"`) as `dateString` in `onMonthChange`. Thus `month.dateString.substring(0,7) + '-01'` is safely equivalent to `month.dateString` — harmlessly redundant, not incorrect.

**`useFocusEffect` + `useEffect` interaction:** Focus reset updates `visibleMonthKey`, which invalidates `loadMarkedDates` callback, which triggers the `useEffect`. On a same-month re-focus this produces one redundant DB call; on a cross-month re-focus it correctly reloads marks. No double-fire concern.

**No memory leaks:** All `useEffect`/`useCallback` hooks are stateless and synchronous. No subscriptions created. No cleanup needed. ✅

---

## Recommendations

1. Replace `'transparent'` with a theme token (or accept it as an intentional constant — document it with a comment if so).
2. Wrap `calendarTheme` in `useMemo([colors, typography])` and `computedMarkedDates` in `useMemo([markedDates, selectedDate, colors.primary])`.
3. Narrow `markedDates` state type to `Record<string, { marked: boolean; dotColor: string }>`.
4. In `handleSaved`, also call `setVisibleMonthKey(savedDate.substring(0, 7) + '-01')` to keep the calendar in sync when a meal's date is moved across months.

---

**Review Report Path:** docs/reviews/TASK-006-review.md

**Commit Readiness:** ready

**Rejection Type:** none

**Next Steps:** Approve — optionally address the four MINOR items in a follow-up or inline before commit.
