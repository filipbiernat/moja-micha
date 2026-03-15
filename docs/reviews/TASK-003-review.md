## Code Review: Today Tab Focus Reset

**Status:** APPROVED

**Summary:** The staged candidate is correctly scoped to TASK-003 and keeps the fix where it belongs: TodayScreen owns the visible date and resets it on screen focus by reusing the existing local-date helper. DayView remains controlled, day browsing on the screen still works through `onDateChange`, and there are no navigator-level changes in the staged diff.

**Issues Found:**

- None.

**Recommendations:**

- Manually verify the return-to-tab flow on device or emulator, including a browse-away-and-back cycle after changing the visible day.

**Review Report Path:** docs/reviews/TASK-003-review.md

**Commit Readiness:** ready

**Candidate Scope Match:** matched

**Rejection Type:** none

**Next Steps:** Approve
