# TASK-003 Plan

## Goal

Fix the Today tab so it resets to the actual current local day when the user returns to the tab after browsing other dates.

## Scope

1. Keep visible date ownership in `TodayScreen`.
2. Preserve `DayView` as a controlled child.
3. Reset the Today screen date when the screen regains focus.
4. Avoid navigator-level changes unless screen-level focus handling proves insufficient.

## Recommended Approach

1. Add a screen-level navigation focus handler in `app/screens/TodayScreen.tsx`.
2. Reuse the existing `getLocalDateString()` helper as the reset target.
3. Keep the change local so swipe navigation and quick-entry behavior remain otherwise unchanged.

## Likely Files

1. `app/screens/TodayScreen.tsx`
2. `App.tsx` only if a fallback navigator-level listener is required

## Risks

1. Returning to Today will intentionally discard the last browsed date.
2. A broad remount-based fix would reset unrelated screen state and should be avoided.

## Validation

1. Confirm Today resets to the current local day after switching away and back.
2. Confirm left/right day navigation still works while staying on Today.
3. Confirm FAB and bottom sheet behavior remain intact.
