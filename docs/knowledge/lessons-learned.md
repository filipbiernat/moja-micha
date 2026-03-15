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

### 2026-03-15 — Reset tab-local date on focus
Task: TASK-003
Context: Today tab date state in React Navigation bottom tabs
Problem: A tab screen that stores a browsed date in local state keeps that value across tab switches because the screen stays mounted.
Solution: Keep the date state in the screen, but reset it with a focus-driven effect when the tab becomes active again.
Discovered By: autonomous-orchestrator
