# TASK-015 Plan — v2 OpenAI Integration

## Goal

Implement v2 of the app: add OpenAI API key management in Settings, auto-analyze meals after save (fill calories + AI analysis), and display a daily AI insight in the journal.

## Scope

GamePlan v2 checklist items:

- [ ] Settings: OpenAI API key field
- [ ] After saving a meal: auto-send content to LLM
- [ ] Return: calculated calories + analysis (auto-fill empty fields)
- [ ] Daily message: how progress is going vs. calorie goal
- [ ] Handle no-network / API error

## Architecture Decisions

- **No SDK** — use `fetch()` directly to `https://api.openai.com/v1/chat/completions` (Chat Completions API). No new dependency needed.
- **Model** — `gpt-4o-mini` (cheap, fast, sufficient for calorie estimation).
- **API key storage** — user enters their own key in Settings screen; stored in SQLite (local device only). Never logged or shown in plain text by default.
- **AI enrichment UX** — form stays open during AI call, button shows "Analyzing…" state. Meal is always saved first; AI only updates empty fields.
- **Daily insight** — on-demand button in DayView header (today only, when goal + key are set). Plain text response (no JSON).

## Files Changed

### New

- `services/openai.ts` — `analyzeMeal()`, `getDailyInsight()`, shared fetch helper

### Modified

- `db/schema.ts` — add `OPENAI_API_KEY` to `SETTING_KEYS`
- `app/screens/SettingsScreen.tsx` — "AI ASSISTANT" section with masked API key input
- `components/MealFormSheet.tsx` — async AI enrichment after save
- `components/DayView.tsx` — daily AI insight banner + "Ask AI" button
- `i18n/pl.json` / `i18n/en.json` — new keys

## Implementation Phases

### Phase 1: Schema + Settings UI

1. Add `OPENAI_API_KEY` to `SETTING_KEYS` in `db/schema.ts`
2. Add "AI ASSISTANT" section in `SettingsScreen.tsx`:
    - Masked text input (secureTextEntry toggle)
    - Save on blur / submit
    - Brief "stored locally" hint text

### Phase 2: AI Service

1. Create `services/openai.ts`:
    - `analyzeMeal(apiKey, mealText, language)` → `{ calories: number | null, analysis: string | null }`
    - `getDailyInsight(apiKey, mealsText, totalKcal, goalKcal, language)` → `string | null`
    - Both use `AbortController` timeout (30s)
    - Both throw `AiError` with human-readable message on failure

### Phase 3: MealFormSheet AI Enrichment

1. After successful DB save, read API key from settings
2. If key set AND (calories null OR aiAnalysis null): show `isAnalyzing` state on save button
3. Call `analyzeMeal()` and `updateMeal()` with results (only overwrite null fields)
4. Close sheet and call `onSaved` after AI done (or on error)
5. Show Alert on AI error (meal is already saved)

### Phase 4: DayView Daily Insight

1. Add state for `aiInsight: string | null`, `isLoadingInsight: boolean`
2. Only render when: date == today AND calorieGoal != null AND apiKey != null
3. "Ask AI" button → calls `getDailyInsight()` → sets `aiInsight`
4. Display insight in a card below the calorie bar
5. Error: show Alert

## Acceptance Criteria

- [ ] User can enter/clear/update their OpenAI API key in Settings
- [ ] After saving a meal, if key is set, calories and AI analysis are auto-filled (only empty fields)
- [ ] Form shows "Analyzing…" state during AI call
- [ ] On AI error, an alert is shown but the meal is already saved
- [ ] Today's DayView shows "Ask AI" button when key + goal are set
- [ ] Pressing "Ask AI" displays an AI-generated daily insight card
- [ ] No network / API error → Alert with message, no crash
- [ ] All new text through i18n keys, all colors through theme
