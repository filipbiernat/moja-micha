# Code Review: TASK-015 — OpenAI v2 Integration + Model Selection (Cycle 2)

## Cycle 1 Review (archived)

See full cycle-1 findings above this line in git history.

---

# Code Review: TASK-015 — Cycle 2 re-review

**Status:** NEEDS_REVISION (archived — see Cycle 3 below)

**Summary:** All 7 cycle-1 issues are addressed and 6 of 7 are fully resolved. However, the abort-guard fix for MAJOR #1 introduced a new regression: `loadData` invalidates the in-flight insight request via the ref but never resets `isLoadingInsight`, so the loading spinner gets permanently stuck whenever a date change or meal save interrupts an active `handleAskAI` call. Two dead imports (one per file) are also present.

---

## Cycle-1 Issue Resolution

| ID       | Description                                         | Status                                                      |
| -------- | --------------------------------------------------- | ----------------------------------------------------------- |
| MAJOR #1 | DayView stale closure                               | **Partially fixed — new regression introduced (see below)** |
| MAJOR #2 | DEFAULT_OPENAI_MODEL not imported in SettingsScreen | ✅ Resolved                                                 |
| MINOR #1 | JSON.parse no try-catch                             | ✅ Resolved                                                 |
| MINOR #2 | MODEL_OPTIONS recreated on every render             | ✅ Resolved                                                 |
| MINOR #3 | Orphaned i18n keys                                  | ✅ Resolved                                                 |
| MINOR #4 | AI enrichment in edit mode                          | ✅ Resolved                                                 |
| MINOR #5 | isAnalyzing not reset on swipe-close                | ✅ Resolved                                                 |

---

## Cycle-2 Issues Found (all resolved in Cycle 3)

- **[MAJOR]** `components/DayView.tsx` — `loadData` bumped `insightAbortRef` but never called `setIsLoadingInsight(false)`, causing permanently stuck spinner.
- **[MINOR]** `components/DayView.tsx` — `getLocalDateString` was imported but unreferenced.
- **[MINOR]** `app/screens/SettingsScreen.tsx` — `Alert` was imported but never invoked.
- **[MINOR]** `components/DayView.tsx` — AI insight section lacked a today-only date guard.

---

# Code Review: TASK-015 — Cycle 3 final re-review

**Status:** APPROVED

**Summary:** All 4 cycle-2 issues are confirmed resolved. Abort-guard logic is correct, all imports are live, the today-only guard is in place, and no new issues were introduced.

---

## Cycle-2 Issue Resolution

| ID    | Description                           | Status                                                                                          |
| ----- | ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| MAJOR | `isLoadingInsight` stuck when aborted | ✅ Resolved — `loadData` calls `setIsLoadingInsight(false)` synchronously after bumping the ref |
| MINOR | `getLocalDateString` dead import      | ✅ Resolved — now used at line 572 guard `date === getLocalDateString()`                        |
| MINOR | `Alert` dead import in SettingsScreen | ✅ Resolved — removed from import list                                                          |
| MINOR | AI insight visible for past dates     | ✅ Resolved — `date === getLocalDateString()` guard added                                       |

---

## Abort-Guard Logic Verification

The abort flow is correct end-to-end:

1. `loadData` increments `insightAbortRef.current` and immediately calls `setIsLoadingInsight(false)` — spinner resets synchronously regardless of any in-flight promise.
2. `handleAskAI` captures `abortId = ++insightAbortRef.current` before the async call.
3. In `then`, `catch`, and `finally`, every state mutation is guarded by `insightAbortRef.current === abortId` — stale resolutions are fully discarded.
4. No double-increment risk: `loadData` uses `+= 1`, `handleAskAI` uses `++` (pre-increment) on the next tick after `loadData` has already set the spinner to false.

## Today-Guard Determinism

`getLocalDateString()` in `utils/index.ts` uses `new Date()` with local-time methods (`getFullYear`, `getMonth`, `getDate`). This is consistent with how `date` props are generated throughout the app (same function used for initial date in JournalScreen). The comparison is apples-to-apples. ✓

## Security Notes

- API key is not logged on success paths. `console.warn` on error paths logs the error object only. ✓
- Model string from user selection is passed as a JSON body value — no eval, no shell exposure. ✓
- API key stored in SQLite with `secureTextEntry` default on; user toggle only affects display. ✓

---

**Review Report Path:** docs/reviews/TASK-015-review.md

**Commit Readiness:** ready

**Candidate Scope Match:** matched

**Rejection Type:** none

**Next Steps:** Approve and commit.
