# TASK-016 Plan — v2.1 Ingredient Breakdown

## Goal

Implement GamePlan v2.1: extend AI meal analysis with estimated ingredient breakdown and display it in the meal card as a collapsible section.

## Scope

GamePlan v2.1 checklist items:

- [x] Extend `MealAnalysis` with `ingredients: Array<{ name: string; calories: number }> | null`
- [x] Update `analyzeMeal` prompt to request `ingredients`, `calories`, and `analysis`
- [x] Update response parsing and validation in `analyzeMeal`
- [x] Show ingredient breakdown in the meal view as a collapsible list under calories
- [x] Add PL/EN i18n keys for the new UI
- [x] Gracefully fall back when the model returns no `ingredients`

## Architecture Decisions

- **No DB migration** — reuse the existing `meals.ai_analysis` text column to preserve scope and avoid schema churn.
- **Backward compatibility** — support both legacy plain-text `aiAnalysis` values and new structured AI payloads.
- **Structured storage only when needed** — store JSON in `ai_analysis` only when the AI result contains ingredients. Otherwise keep plain text analysis.
- **Edit safety** — when opening an existing meal, show only the readable analysis text in the form. If the user does not modify that text, preserve the original structured payload on save.
- **UI behavior** — ingredient breakdown is hidden by default and expands inline per meal card.

## Files Expected To Change

- `services/openai.ts`
- `components/MealFormSheet.tsx`
- `components/DayView.tsx`
- `i18n/pl.json`
- `i18n/en.json`
- `GamePlan.md`

## New Helper

- `utils/mealAnalysis.ts` — parse legacy/plain AI notes and serialize structured ingredient payloads safely.

## Implementation Phases

### Phase 1: Data model + parsing

1. Extend `MealAnalysis` in `services/openai.ts`
2. Add strict validation for `ingredients`
3. Create utility helpers to:
   - parse legacy plain text analysis
   - parse structured JSON payloads
   - serialize structured payloads only when ingredients exist

### Phase 2: Save/edit flow integration

1. Update `MealFormSheet` edit initialization to show parsed analysis text instead of raw JSON
2. Preserve original structured AI payload when the user does not modify the analysis field
3. Store structured AI payload after `analyzeMeal()` when ingredients are returned

### Phase 3: Meal card UI

1. Parse `aiAnalysis` per meal in `DayView`
2. Keep the existing analysis text rendering
3. Add ingredient toggle button and collapsible list under calories
4. Hide the section entirely when no ingredients are available

### Phase 4: Localization + planning docs

1. Add new translation keys to `pl.json` and `en.json`
2. Check off completed GamePlan v2.1 items
3. Write testing/review/complete docs after implementation

## Acceptance Criteria

- [x] `analyzeMeal()` returns `ingredients` in addition to `calories` and `analysis`
- [x] Invalid or partial AI JSON does not crash the app
- [x] Existing legacy meals with plain-text `aiAnalysis` still render correctly
- [x] Editing a structured AI meal does not expose raw JSON in the notes field
- [x] Meal cards show a collapsible ingredient section when ingredients exist
- [x] Meal cards fall back to the old view when ingredients are missing
- [x] All new UI strings come from i18n