# TASK-001 Plan

## Goal

Complete GamePlan stage 6 for the Today screen with minimal scope creep.

## Scope

1. Keep `TodayScreen` as the owner of the currently viewed date.
2. Reuse `DayView` for the shared day presentation.
3. Add a Today-only FAB for quick meal entry.
4. Add a minimal quick-entry bottom sheet with:
   - required meal text field
   - basic validation
   - save action for a new meal using current date/time defaults
   - post-save refresh of the visible day
5. Add required i18n keys for the new UI.

## Out Of Scope

1. Expanded meal form
2. Editing existing meals
3. Retroactive date changes from the form
4. Favorites picker
5. Calories and notes fields in the quick-entry flow
6. History-specific behavior

## Likely Files

1. `app/screens/TodayScreen.tsx`
2. `components/DayView.tsx`
3. `db/meals.ts`
4. `i18n/pl.json`
5. `i18n/en.json`

## Validation

1. Type check or project lint if available
2. Verify Today screen still shows date header, streak, and swipe navigation
3. Verify FAB opens bottom sheet and saving a valid meal refreshes the list
