# Code Review: TASK-009 — Statistics Screen

**Status:** APPROVED

**Summary:** Implementation is solid and meets all acceptance criteria. No blocking issues. Three minor findings (unused i18n keys, trend-line visual gap bridging, non-idiomatic pluralization) are noted for awareness but do not warrant revision.

---

## Candidate Scope

Staged diff was **unavailable** — changes are already committed. Review performed against current workspace files:

- `app/screens/StatsScreen.tsx`
- `db/meals.ts`
- `db/index.ts`
- `i18n/en.json`, `i18n/pl.json`
- `GamePlan.md`
- `docs/tasks/TASK-009-plan.md`

---

## Issues Found

### [MINOR] Two unused i18n keys defined but never referenced in `StatsScreen.tsx`

- `stats.chart_today` (en.json:143, pl.json:148)
- `stats.per_day` (en.json:140, pl.json:145)

Both keys are fully translated in both locale files but have no `t()` call site in the screen. Not a runtime error, but clutters the translation namespace and may cause confusion for future translators.

**Recommendation:** Remove both keys from both locale files, or add them to their intended UI locations if they were meant to be shown (e.g., a "per day" suffix under the avg summary card).

---

### [MINOR] Trend line polyline bridges across empty-data gaps

In `CalorieChart`, null MA entries are filtered before building the `<Polyline points>` string:

```ts
const maPoints = maValues
    .map((v, i): string | null => { if (v === null) return null; ... })
    .filter((p): p is string => p !== null);
// ...
<Polyline points={maPoints.join(' ')} ... />
```

On a 30-day view with data gaps (e.g., days 6–10 have no meals), the single polyline visually bridges the gap, drawing a line over the empty/floored bars. The visual signal is misleading: the trend appears continuous even where no data exists.

**Recommendation:** Either segment the polyline into multiple `<Polyline>` elements per consecutive group of non-null points, or accept the current behavior as a known simplification (document in a comment).

---

### [MINOR] Manual pluralization bypasses i18next pluralization engine

```tsx
const streakLabel = (count: number): string =>
    t(count === 1 ? "stats.streak_days_one" : "stats.streak_days_other", {
        count,
    });
```

This manually switches keys instead of using i18next's native `t('stats.streak_days', { count })` convention (which auto-resolves `_one` / `_other` / `_few` etc. via CLDR rules). In the current Polish translation both `_one` and `_other` map correctly (`dzień` / `dni`), so there is no visible bug. However, adding a third language or updating pluralization rules would require touching this code rather than just the JSON files.

**Recommendation:** Replace with `t('stats.streak_days', { count })` using a canonical `stats.streak_days` key, letting i18next resolve the suffix automatically.

---

## Positive Findings (summarized)

- **Bug fix correct:** `ne(calories, sql\`NULL\`)`→`isNotNull(calories)`in`getCalorieSummary`is the right fix. The`COALESCE` is now effectively a no-op but is harmless.
- **`getRecordStreak` algorithm:** Iterates ASC-ordered distinct dates, increments `currentStreak` on diff=1, resets to 1 otherwise. Correctly initializes `maxStreak = 1` (first row is always a streak of 1). No off-by-one.
- **Hook/effect stability:** `loadData` closes only over `db`, accepts `activePeriod` as a parameter. `useFocusEffect` passes `period` explicitly. `handlePeriodChange` passes the new period immediately before React re-renders. No stale closure risk.
- **TypeScript:** No implicit `any`. All interfaces (`DayData`, `CalorieChartProps`) are explicit. The `t(labelKey as Parameters<typeof t>[0])` cast is deliberate and acceptable.
- **i18n coverage:** All visible strings routed through `t()`. Section labels, empty state, summary labels, streak labels, period toggle, header — covered.
- **Theme usage:** All colors from `ColorTokens` (`colors.primary`, `colors.secondary`, `colors.warning`, `colors.streak`, `colors.divider`, `colors.border`, `colors.textMuted`, `colors.textOnAccent`, `colors.surface`, `colors.surfaceElevated`, `colors.background`, `colors.textPrimary`, `colors.textSecondary`). SVG geometry constants (`strokeWidth={1}`, `fontSize={9}`, `rx={3}`, `opacity={0.85}`) are numbers, not color strings — acceptable per spec.
- **`testID` placement:** Present on the period toggle row, individual toggle buttons, chart container, empty state, summary row, streak row, and streak cards.
- **Chart geometry:** `toBarY` clamps to `Math.max(2, ...)` ensuring a minimum 2px sentinel bar for zero-data days. `toLineY` is unclamped (correct for the MA trend line). Y-axis labels use `k` suffix for values ≥ 1000 (e.g., `1.5k`). Grid line at `cal === 0` correctly suppresses its label.
- **30d scroll:** `ScrollView horizontal` wraps the SVG only for the 30d view. 7d returns the SVG directly.
- **`getRecordStreak` export:** Confirmed in `db/index.ts`.

---

## Recommendations

1. Remove `stats.chart_today` and `stats.per_day` from both locale files, or wire them up to visible UI.
2. Consider segmenting the MA polyline into non-null runs to avoid bridging gaps.
3. Replace manual `streakLabel` key switching with standard i18next plural key (`stats.streak_days`).

---

**Review Report Path:** `docs/reviews/TASK-009-review.md`

**Commit Readiness:** ready

**Candidate Scope Match:** unknown (no staged diff; reviewed committed code)

**Rejection Type:** none

**Next Steps:** Approve — proceed to testing phase. Minor items can be addressed in a follow-up task or inline with TASK-009 cleanup if desired.
