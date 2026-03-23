# Code Review: TASK-019 — JSON Data Export / Import

**Status:** APPROVED

**Summary:** All four issues from the previous NEEDS_REVISION review have been correctly addressed. The implementation is commit-ready.

---

## Previous Issues — Verification

All four issues from the NEEDS_REVISION round have been confirmed fixed in the staged candidate:

1. **[RESOLVED] `restoreFromBackup` transaction** — `db.transaction((tx) => { ... })` wraps all deletes and inserts at lines 205–276 of [services/dataExport.ts](../../services/dataExport.ts). All operations use `tx.*`. Atomicity is guaranteed.

2. **[RESOLVED] `settings` object guard** — `validateBackup` now checks `typeof d['settings'] !== 'object' || Array.isArray(d['settings']) || d['settings'] === null` at lines 185–188, throwing before any DB operation is reached.

3. **[RESOLVED] `isImporting` stuck state** — `Alert.alert` in `handleImport` passes `{ cancelable: false }` as the fourth argument. The Android hardware back button can no longer dismiss the dialog without invoking a callback.

4. **[RESOLVED] DocumentPicker MIME filter** — `type: 'application/json'` replaces the previous `'*/*'`.

## Remaining Open Items

- **[MINOR — accepted]** Shallow field-level validation inside `BackupMeal` / `BackupFavorite` arrays. With the transaction now in place the database cannot be corrupted by a malformed import; the error surfaces as the generic `import_error` alert. Acceptable for V1.

---

## Correct and Noteworthy

- **API key exclusion**: `EXCLUDED_SETTING_KEYS` is applied consistently in both `exportData` (server-side filter) and `restoreFromBackup` (defense-in-depth import filter). Correct.
- **FK delete ordering**: `favorites` deleted before `meals` matches the `sourceMealId → meals.id` FK with `onDelete: 'set null'`. Correct.
- **Insert ordering**: meals inserted before favorites during restore. Correct.
- **`CancelledError` sentinel**: Clean separation between user cancel and actual error in `handleImport`. Works correctly.
- **i18n coverage**: All 13 new keys present and consistent in both `pl.json` and `en.json`.
- **Loading state mutual exclusion**: `disabled={isExporting || isImporting}` prevents concurrent operations. Correct.
- **TypeScript**: No implicit `any`. The `backup!` non-null assertion in `handleImport` is redundant (TypeScript control flow covers it) but not a defect.
- **Export error for cancelled share sheet**: `Sharing.shareAsync` resolves normally on user cancel — no false error alert. Correct.
- **File written to cache dir**: `Paths.cache` is app-private. Correct choice.

---

## Recommendations

None blocking. The V1 shallow field-level validation limitation is documented above and acceptable.

---

**Review Report Path:** docs/reviews/TASK-019-review.md

**Commit Readiness:** ready

**Candidate Scope Match:** matched

**Rejection Type:** none

**Next Steps:** Approve — stage `docs/reviews/TASK-019-review.md` update and commit.
