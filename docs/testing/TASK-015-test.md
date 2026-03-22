# TASK-015 Test Plan & Results

## Automated checks
- TypeScript: **PASS** (0 errors in all 6 modified/created files)
- No `any`, no implicit types, no dead imports
- i18n: all new keys present in both `pl.json` and `en.json`

---

## Manual Testing Required: yes

### Preconditions
1. Android emulator running (API 34+)
2. App built with `npx expo start --android`
3. Have a valid OpenAI API key ready (or the one provided during session)
4. Daily calorie goal set to any value (e.g. 2000 kcal) in Settings

---

## Run Commands
```bash
npx expo start --android
```

---

## Test Scenarios — Settings Screen

### T1: API Key input
1. Open Settings → scroll to section "ASYSTENT AI"
2. Tap the key input — type `sk-test-invalid`
3. Tap Done / blur — key should persist (no crash, no toast required)
4. Tap 👁 Pokaż → key becomes visible; tap Ukryj → masked again
5. Clear the field and blur → key deleted from DB (next app open shows empty)

### T2: Model selector
1. In Settings, below the key hint, verify the model list appears
2. Default selected: `gpt-4o-mini` (highlighted in primary color, checkmark)
3. Tap `gpt-5.2` → it becomes highlighted, previous deselected
4. Close + reopen Settings → selection persists (`gpt-5.2` still active)

---

## Test Scenarios — Meal analysis (MealFormSheet)

### T3: AI enrichment on save (quick entry)
1. Set a real OpenAI API key in Settings, model = `gpt-4o-mini`
2. Open journal → tap ➕ (quick entry)
3. Type: `Owsianka z bananem i miodem, szklanka mleka`
4. Leave calories empty, tap **Zapisz**
5. Button should show "Analizuję z AI…" while in-flight
6. Sheet closes after ~5–15s; meal card appears
7. Verify card shows approx. calories (e.g. 350–450) and a Polish nutrition note

### T4: AI skip when calories already filled
1. Type a meal, enter `500` in calories field
2. Save → no AI delay (sheet closes immediately); calories = 500 in card

### T5: AI only in add-mode
1. Open an existing meal for edit
2. Clear its calories
3. Save → should close immediately without AI call (add-mode guard)

### T6: Invalid API key error
1. Set key to `sk-invalid-key` in Settings
2. Save a new meal without calories
3. "Analizuję z AI…" appears → after timeout/error: Alert "Błąd AI" shown
4. Meal should still be saved (without calories/analysis)

### T7: Sheet swipe-dismiss during analysis
1. Start saving a meal that triggers AI
2. While "Analizuję z AI…" shown, swipe the sheet down
3. Sheet closes; no crash; no stuck isAnalyzing state on reopening

---

## Test Scenarios — Daily AI insight (DayView)

### T8: Ask AI button appears today only
1. Navigate to today's date → if API key set and meals > 0, "Zapytaj AI" button visible inside summary card
2. Navigate to yesterday → button should NOT appear

### T9: Fetch insight
1. On today's view with meals, tap "Zapytaj AI"
2. Button changes to "Pobieranie komentarza…" with spinner
3. After ~5–15s: insight text appears in highlighted card below progress bar

### T10: Date change while loading
1. Tap "Zapytaj AI" on today
2. Quickly navigate to another date (swipe or arrow)
3. Spinner should disappear on new date; insight from old date must NOT appear
4. Navigate back to today → "Zapytaj AI" button shows again (insight reset)

### T11: AI insight — no calorie goal set
1. Disable calorie goal in Settings
2. Open today's journal with meals, tap "Zapytaj AI"
3. Insight should still appear (goal-less prompt path)

---

## Edge cases
- No network: meal saves fine, AI errors gracefully (Alert shown, meal persists)
- Empty meal list with API key: "Zapytaj AI" button hidden (meals.length === 0 guard)
- `gpt-5.2` model selected: same UX, different model passed in request body
