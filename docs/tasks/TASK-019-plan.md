# TASK-019 — JSON Data Export / Import

## Goal

Add data backup and restore functionality to the Settings screen:

- Export all app data to a JSON file (shareable via OS share sheet)
- Import data from a previously exported JSON file (full restore)

## Motivation

1. Migration to a new phone
2. Providing data to a dietitian or AI for analysis

## Acceptance Criteria

- Export button in Settings → gathers all meals, favorites (templates + starred), daily summaries, and settings (excluding the OpenAI API key for security) → writes a timestamped JSON file to the cache directory → opens the OS share sheet so the user can save or send it
- Import button in Settings → opens the file picker (JSON only) → shows a confirmation dialog (destructive operation) → clears existing data → restores from the file → shows success/error feedback
- Settings that are sensitive (openai_api_key) are excluded from export; they are silently skipped during import even if present in the file
- Exported file format is versioned (version: 1) for future safe migrations
- All new UI text is provided via i18n keys (PL + EN)
- TypeScript strict; no `any`

## Packages Required

- `expo-file-system` (write JSON to cache dir)
- `expo-sharing` (OS share sheet)
- `expo-document-picker` (pick JSON file for import)

## Data Format

```json
{
  "version": 1,
  "exportedAt": "2026-03-23T12:00:00.000Z",
  "meals": [...],
  "favorites": [...],
  "dailySummaries": [...],
  "settings": { "theme": "dark", ... }
}
```

Settings excluded from export: `openai_api_key`.

## Implementation Plan

### Phase 1: Install packages

- `npx expo install expo-file-system expo-sharing expo-document-picker`

### Phase 2: Service layer

- Create `services/dataExport.ts`
- `exportData(db)` — collects all data, serializes to JSON, writes via FileSystem, opens share sheet
- `importData(db)` — opens file picker, reads, parses, validates, shows confirm, restores

### Phase 3: i18n keys

- Add `settings.data_section`, `settings.export_btn`, `settings.import_btn`, `settings.export_success`, `settings.import_confirm_title`, `settings.import_confirm_message`, `settings.import_confirm_ok`, `settings.import_confirm_cancel`, `settings.import_success`, `settings.import_error`, `settings.export_error` to PL + EN

### Phase 4: SettingsScreen

- Add "DATA" section with two action rows (Export / Import)
- Export button: calls `exportData`, shows toast on error
- Import button: calls `importData`, shows toast on result

## Files Changed

- `services/dataExport.ts` (new)
- `i18n/pl.json`
- `i18n/en.json`
- `app/screens/SettingsScreen.tsx`
- `package.json` (new deps)
