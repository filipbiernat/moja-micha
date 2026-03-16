# Code Review: TASK-004 — Meal Add/Edit Form (Stage 7)

**Status:** APPROVED (after fixes applied)

**Fixes applied post-initial review:**
- Quick-entry title now uses `mode === "add" ? t("mealForm.title_quick") : t("mealForm.title_edit")`
- Quick-entry header `View` override now includes `borderBottomColor: colors.divider`


---

## Summary

The implementation is structurally sound and hits every acceptance criterion at the functional level: keyboard footer layout is correct, `keyboardBehavior="interactive"` is set, both modes are implemented, i18n is complete in both languages, all colors come from theme tokens, TypeScript is strict throughout, and testIDs are on every interactive element. One real UX bug exists — the quick-entry title hardcode means a user who opens an edit form and manually collapses it sees "Quick entry" as the title while editing an existing meal. Save still works correctly. All other findings are minor polish gaps.

---

## Issues Found

### WARNING

- **[WARNING]** `components/MealFormSheet.tsx` — Quick-entry header always renders `t("mealForm.title_quick")` regardless of `mode`. When `openEdit` is called and the user subsequently collapses the sheet to snap index 0 (via swipe or the chevron button), the title switches to "Quick entry" while `mode` remains `"edit"` and `editMealId` is non-null. Save still executes `updateMeal` correctly, so data is safe, but the user receives a contradictory title. Fix: `mode === "add" ? t("mealForm.title_quick") : t("mealForm.title_edit")` in the quick-entry header.

### MINOR

- **[MINOR]** `components/MealFormSheet.tsx` — Quick-entry header `View` override is `{ marginBottom: spacing.sm }` with no `borderBottomColor`. The base `formHeader` style has `borderBottomWidth: StyleSheet.hairlineWidth`. Without a color the divider renders with an undefined/platform-default color, which may be invisible on dark themes. Full-form header correctly applies `borderBottomColor: colors.divider`; quick-entry header should match.

- **[MINOR]** `components/MealFormSheet.tsx` — `handleExpand` / `handleCollapse` both immediately flip `isExpanded` before the snap animation finishes. The layout switches to the target view while the sheet is still at the wrong height, causing ~200ms of the new layout crammed into the old sheet height. Deferring the state flip to `handleSheetChange` (already called by `@gorhom/bottom-sheet` when snap completes) would eliminate the jank, at the cost of the opposite visual issue (old layout briefly at new height). Trade-off acceptable but worth logging.

- **[MINOR]** `components/MealFormSheet.tsx` — `isSaving` guard is ineffective. `setIsSaving(true)` → synchronous try-finally → `setIsSaving(false)` are all batched by React 18's automatic batching. The button never visually disables. Harmless with synchronous Drizzle calls, but misleading and will silently break if operations become async.

- **[MINOR]** `components/MealFormSheet.tsx` — Edit-mode save branch `else if (editMealId !== null)` silently no-ops if `mode === "edit"` but `editMealId` somehow became null, yet still calls `onSaved(selectedDate)` suggesting success to the parent. Unreachable in practice because `openEdit` always sets `editMealId`, but worth an explicit guard or `console.warn`.

- **[MINOR]** `components/MealFormSheet.tsx` — `meal.mealType as MealType` cast in `openEdit` trusts the DB value without narrowing. Low risk while writes are app-controlled and the set of valid values hasn't changed, but will silently produce a broken chip selection if schema drift occurs.

---

## What is Correct

- Footer is outside `BottomSheetScrollView` and inside the `flex: 1` container — buttons will remain visible above keyboard.
- `keyboardBehavior="interactive"` and `keyboardBlurBehavior="restore"` are set correctly.
- All `mealForm.*` i18n keys are present and match in both `en.json` and `pl.json`.
- All colors reference theme tokens; no hardcoded hex values.
- `createMeal` / `updateMeal` called only through `db/meals.ts`.
- `MealFormSheetHandle` typed correctly with `forwardRef`; no implicit `any`.
- `testID` present on every interactive element.
- Text persists correctly when expanding from quick to full form.
- Date/time pickers rendered outside BottomSheet to avoid layout conflicts.
- `onSaved(date)` triggers parent refresh with the correct saved date.

---

## Recommendations

1. Fix the quick-entry title in edit mode (single-line change — see WARNING above).
2. Add `borderBottomColor: colors.divider` to the quick-entry header override.
3. Stage all task files before committing: `git add components/MealFormSheet.tsx app/screens/TodayScreen.tsx components/DayView.tsx components/index.ts utils/index.ts i18n/en.json i18n/pl.json package.json package-lock.json docs/tasks/TASK-004-plan.md`.

---

**Review Report Path:** `docs/reviews/TASK-004-review.md`

**Commit Readiness:** not ready (one WARNING must be resolved; staging hygiene required)

**Candidate Scope Match:** matched

**Rejection Type:** Logic/Quality Rejection

**Next Steps:** Revise
