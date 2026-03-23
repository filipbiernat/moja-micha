# TASK-019 Complete — JSON Data Export / Import

## Summary

Added backup and restore functionality to the Settings screen:

- **Export**: collects all meals, favorites, daily summaries, and settings (excluding the OpenAI API key) into a versioned JSON file, writes it to the device cache, and opens the OS share sheet.
- **Import**: opens the file picker (JSON), reads and validates the file, shows a destructive-action confirmation dialog (`cancelable: false`), then restores all data inside a single SQLite transaction (rolls back on any failure); the API key setting is never touched.

## Handoff Checklist

- [x] Code changes staged
- [x] TypeScript passes (`npx tsc --noEmit` exit 0)
- [x] Review APPROVED: `docs/reviews/TASK-019-review.md`
- [x] Test report written: `docs/testing/TASK-019-test.md`
- [x] Manual Testing Required: **yes** (device/emulator verification needed)
- [x] No unstaged task-related leftovers
- [x] GamePlan.md not updated (export/import was not a tracked GamePlan item)

## Files Changed

| File                              | Change                                                                                                   |
| --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `services/dataExport.ts`          | New service: `exportData`, `pickAndParseBackup`, `validateBackup`, `restoreFromBackup`, `CancelledError` |
| `app/screens/SettingsScreen.tsx`  | Alert + ActivityIndicator imports; new state + handlers; DATA section UI                                 |
| `i18n/pl.json`                    | 12 new `settings.*` i18n keys                                                                            |
| `i18n/en.json`                    | 12 new `settings.*` i18n keys                                                                            |
| `package.json`                    | `expo-file-system`, `expo-sharing`, `expo-document-picker` added                                         |
| `docs/tasks/TASK-019-plan.md`     | Task plan                                                                                                |
| `docs/reviews/TASK-019-review.md` | Review report                                                                                            |
| `docs/testing/TASK-019-test.md`   | Test report                                                                                              |

## Review Report

`docs/reviews/TASK-019-review.md`

## Test Report

`docs/testing/TASK-019-test.md`

## Commit Message

```
feat(settings): add JSON data export and import

- Add exportData() service: collects meals, favorites, daily summaries
  and settings (excluding openai_api_key), writes timestamped JSON to
  cache dir and opens the OS share sheet
- Add pickAndParseBackup() + validateBackup(): picks a JSON file,
  validates version/structure including settings field type guard
- Add restoreFromBackup(): clears and restores all data inside a single
  SQLite transaction; API key setting is never touched
- Use CancelledError sentinel to distinguish picker cancel from errors
- Add DATA section in SettingsScreen with Export/Import rows,
  ActivityIndicator loading states, and cancelable:false confirm dialog
- Add expo-file-system (v2 API), expo-sharing, expo-document-picker
- Add 12 i18n keys in PL and EN for all new UI strings
```
