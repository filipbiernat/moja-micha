# Lessons Learned — Moja Micha

All agents must check this file before starting work in a known problem area.
All agents must append new findings after solving non-trivial, novel, or recurring issues.

## Format

```md
### YYYY-MM-DD — Short Title

Task: TASK-###
Context: Component, feature area, or workflow
Problem: What went wrong or was tricky
Solution: What worked
Discovered By: Agent name
```

## Entries

### 2026-03-16 — Always check off completed GamePlan tasks
Task: TASK-004
Context: GamePlan.md task tracking
Problem: After implementing stage 7, the corresponding checkboxes in GamePlan.md were left unchecked. The orchestrator committed without updating task status.
Solution: After every implementation phase, update GamePlan.md checkboxes for all completed items before the commit. Leave unchecked only items explicitly deferred to a later task.
Discovered By: autonomous-orchestrator



Task: TASK-004
Context: Native date/time picker inside @gorhom/bottom-sheet
Problem: Rendering @react-native-community/datetimepicker inside a BottomSheet causes Android layout conflicts (picker dialog can be clipped or positioned incorrectly relative to the sheet).
Solution: Render the DateTimePicker conditionally using a boolean flag (showDatePicker / showTimePicker) as a sibling of the BottomSheet (outside the sheet tree, but inside the same parent View). Both components must co-exist in the same JSX fragment: `<>...</BottomSheet>{showDatePicker && <DateTimePicker ... />}</>`.
Discovered By: autonomous-orchestrator

Task: TASK-003
Context: Today tab date state in React Navigation bottom tabs
Problem: A tab screen that stores a browsed date in local state keeps that value across tab switches because the screen stays mounted.
Solution: Keep the date state in the screen, but reset it with a focus-driven effect when the tab becomes active again.
Discovered By: autonomous-orchestrator
