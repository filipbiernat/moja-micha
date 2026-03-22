# TASK-015 Complete — OpenAI v2 Integration + Model Selection

## Summary

Implemented full OpenAI Chat Completions integration into Moja Micha:

- API key and model stored/read from SQLite via `SETTING_KEYS`
- Meal auto-analysis after save (add-mode only, fills null calories/notes)
- Daily AI insight on today's journal view
- Model selection in Settings (6 models incl. gpt-5, gpt-5.2)

## Phase summary

| Phase                               | Status      |
| ----------------------------------- | ----------- |
| Schema + i18n                       | ✅ Done     |
| services/openai.ts                  | ✅ Done     |
| SettingsScreen (key + model picker) | ✅ Done     |
| MealFormSheet AI enrichment         | ✅ Done     |
| DayView daily insight               | ✅ Done     |
| Code review (3 cycles)              | ✅ APPROVED |

## Review report

`docs/reviews/TASK-015-review.md`

## Test report

`docs/testing/TASK-015-test.md`

## Commit message

```
feat(ai): integrate OpenAI Chat Completions for meal analysis and daily insights

- Add services/openai.ts: analyzeMeal + getDailyInsight using fetch() directly,
  gpt-4o-mini default, 30s AbortController timeout, JSON.parse guarded
- Add OPENAI_API_KEY and OPENAI_MODEL to SETTING_KEYS (SQLite persistence)
- SettingsScreen: masked API key input with show/hide toggle; model selector
  (gpt-4o-mini / gpt-4o / gpt-4.1 / gpt-4.5 / gpt-5 / gpt-5.2) at module scope
- MealFormSheet: async AI enrichment after save (add-mode only); isAnalyzing
  state disables both quick-entry and full-form save buttons during analysis;
  sheet stays open until AI resolves; isAnalyzing reset on swipe-close
- DayView: Ask AI button (today-only, when key set and meals > 0); insightAbortRef
  prevents stale date insights from overwriting newer state on fast date navigation
- All user-visible strings use i18n keys (pl + en); dead i18n keys removed
```
