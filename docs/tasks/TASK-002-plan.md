# TASK-002 Plan

## Goal

Fix the Today screen layout so the custom date/navigation header no longer overlaps the Android system status bar.

## Scope

1. Keep the fix limited to the Today screen if possible.
2. Preserve DayView swipe behavior and existing header interactions.
3. Use the existing safe-area infrastructure from `react-native-safe-area-context`.
4. Avoid navigator-level changes.

## Recommended Approach

1. Apply top safe-area handling in `app/screens/TodayScreen.tsx`.
2. Keep `components/DayView.tsx` unchanged unless screen-level padding proves insufficient.
3. Use `SafeAreaView` or `useSafeAreaInsets()` from `react-native-safe-area-context` to reserve top inset space.

## Likely Files

1. `app/screens/TodayScreen.tsx`
2. `components/DayView.tsx` only if a fallback adjustment is needed

## Risks

1. Adding inset handling in the wrong layer could create double top spacing later if DayView is reused elsewhere.
2. Changing DayView directly would broaden the fix to shared layout behavior.

## Validation

1. Confirm the Today header is fully below the Android status bar.
2. Confirm left/right swipe still works.
3. Confirm the FAB and bottom sheet still render correctly.
