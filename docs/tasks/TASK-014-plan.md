# TASK-014 Plan — Quality and Best Practices (Stage 14)

## Objective
Implement Stage 14: Quality and Best Practices from GamePlan.md. This covers six areas:
- TypeScript typing of all data and props
- Database error handling throughout UI
- Loading states (spinner / skeleton)
- Responsiveness (different Android screen sizes)
- Accessibility (accessibilityLabel on all interactive elements)
- No hard-coded strings (everything via i18n)

## Scope

### A. i18n — new keys (en.json + pl.json)
- `common.kcal_unit` — reusable "kcal" label (replaces 4 hard-coded occurrences)
- `common.loading` — generic "Loading…" text
- `db.loading_text` — database init loading string (fixes hard-coded Polish in DatabaseProvider)
- `db.error_title` — database error title
- `dayView.btn_prev_day` / `dayView.btn_next_day` — accessibility labels for nav arrows
- `journal.picker_close` — accessibility for year/month picker close button
- `journal.picker_back_year` — accessibility for "back to year" button
- `journal.picker_select_year` — accessibility for year cells (`{{year}}`)
- `journal.picker_select_month` — accessibility for month cells (`{{month}}`)

### B. DatabaseProvider
- Import default i18n instance
- Replace hard-coded "Przygotowywanie bazy danych..." → `i18n.t("db.loading_text")`
- Replace hard-coded "⚠️ Database Error" → `i18n.t("db.error_title")`

### C. DayView
- Add `isLoading` state; show `ActivityIndicator` until first load completes
- Add `accessibilityLabel={t("dayView.btn_prev_day")}` to prev-day button
- Add `accessibilityLabel={t("dayView.btn_next_day")}` to next-day button
- Replace hard-coded `{item.calories} kcal` → `{item.calories} {t("common.kcal_unit")}`

### D. FavoritesScreen
- Add `isLoading` state; show `ActivityIndicator` until first load
- Wrap `loadData` in try/catch (currently missing error handling)
- Replace 2× hard-coded `{item.calories} kcal` → `{item.calories} {t("common.kcal_unit")}`

### E. StatsScreen
- Add `isLoading` state; show `ActivityIndicator` until first load
- Wrap `loadData` in try/catch
- Add `accessibilityLabel` to period toggle buttons (already has `accessibilityRole`)

### F. JournalScreen
- Add `accessibilityLabel` to picker year cells
- Add `accessibilityLabel` to picker month cells
- Add `accessibilityLabel` to picker close (×) button
- Add `accessibilityLabel` to picker back-to-year button

### G. MealFormSheet
- Replace hard-coded `{item.calories} kcal` in favorites picker → `{item.calories} {t("common.kcal_unit")}`

### H. TypeScript check
- Run `npx tsc --noEmit` and fix any new or pre-existing issues

## Files Changed
- `i18n/en.json`
- `i18n/pl.json`
- `db/DatabaseProvider.tsx`
- `components/DayView.tsx`
- `app/screens/FavoritesScreen.tsx`
- `app/screens/StatsScreen.tsx`
- `app/screens/JournalScreen.tsx`
- `components/MealFormSheet.tsx`

## Acceptance Criteria
- Zero hard-coded user-visible strings outside i18n files
- Every `TouchableOpacity` that is not purely decorative has `accessibilityLabel`
- Every major data screen shows a loading indicator on first mount
- Every data-loading path has try/catch with user-visible error or silent fallback
- `npx tsc --noEmit` exits 0
- GamePlan.md Stage 14 checkboxes all marked `[x]`
