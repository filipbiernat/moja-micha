# Code Review: TASK-011 — Daily Calorie Goal Setting (Re-submission)

**Status:** APPROVED

**Summary:** Both blocking and minor fixes from the first review were applied. All eight acceptance criteria are met. Remaining non-blocking items are noted below but do not prevent commit.

---

## Fixes Verified

- **[MAJOR → RESOLVED]** `<Text style={styles.goalUnit}>{t('settings.calorie_goal_unit')}</Text>` confirmed in JSX. Both `en.json` (`"kcal"`) and `pl.json` (`"kcal"`) carry the `calorie_goal_unit` key.
- **[MINOR → RESOLVED]** `onEndEditing` removed. The TextInput now uses `onBlur` (covers focus loss in all cases) and `onSubmitEditing` (calls commit + `Keyboard.dismiss()`). Standard React Native pattern; double-commit via blur-after-submit is idempotent and acceptable.

---

## Remaining Non-Blocking Issues

- **[MINOR]** `app/screens/SettingsScreen.tsx` — Comment on line 18 reads `// load once from DB (single read)` but two separate lazy `useState` initializers each call `getSetting`. The comment is misleading. Low impact but causes confusion during future maintenance.
- **[MINOR]** `i18n/en.json`, `i18n/pl.json` — `settings.more_settings_info` key is present in both files but its corresponding JSX was removed. Dead key; low risk unless i18n audits are automated.
- **[MINOR]** `app/screens/SettingsScreen.tsx` `handleToggleGoal` — the toggle-on branch writes `goalText` to DB (`setSetting`) without numeric validation. In normal UX this is safe because `handleGoalCommit` always normalises `goalText` before the user can interact with the toggle. A tight race (type invalid text → toggle off before blur) could momentarily persist an invalid string; however, the next commit event would clean it up. Worth fixing in a follow-up if robustness is important.

---

## Acceptance Criteria Check

1. ✅ Toggle disables goal and deletes DB row.
2. ✅ `keyboardType="numeric"`, `maxLength={5}`.
3. ✅ `onBlur` + `onSubmitEditing` persist to SQLite.
4. ✅ `handleGoalCommit` deletes for empty / NaN / ≤0.
5. ✅ Synchronous lazy initializers; `DatabaseProvider` guarantees `db` is ready.
6. ✅ All visible text through i18n keys, including unit label.
7. ✅ No hardcoded colors; all tokens confirmed (`primary`, `primaryMuted`, `border`, `textMuted`, `textPrimary`, `divider`).
8. ✅ TypeScript strict; no implicit `any`.

---

**Review Report Path:** `docs/reviews/TASK-011-review.md`

**Commit Readiness:** ready

**Candidate Scope Match:** matched

**Rejection Type:** none

**Next Steps:** Approve — stage the three changed files and commit.
