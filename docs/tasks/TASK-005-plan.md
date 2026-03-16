# TASK-005 Plan — Re-implement favorites picker in MealFormSheet

## Problem
The favorites picker added in TASK-004 was implemented directly by the orchestrator
(without subagents), using React Native Modal which causes Android gesture conflicts
with @gorhom/bottom-sheet.

## Solution
Replace the Modal-based picker with a second BottomSheet instance rendered as a sibling
of the main BottomSheet, using BottomSheetSectionList for section-grouped favorites rows.
This follows the same pattern already used for DateTimePicker placement, and activates
the previously unused i18n keys favorites_picker_section_templates and favorites_picker_section_starred.

## Files in Scope
- components/MealFormSheet.tsx (primary change)
- No changes to: App.tsx, db/favorites.ts, i18n files, schema, DayView.tsx, TodayScreen.tsx

## Phases
- Phase 1 (single): Remove old Modal implementation; add BottomSheet-based picker
