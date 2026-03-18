# TASK-008 Test Plan — Favorites Screen (Stage 9)

## Automated Checks

| Check                                   | Result             |
| --------------------------------------- | ------------------ |
| TypeScript (`tsc --noEmit`)             | PASS — zero errors |
| VS Code error panel (all changed files) | PASS — zero errors |

## Emulator Smoke Tests (ADB automation — Android API 36.1)

Emulator: `Medium_Phone_API_36.1`, 1080×2400, Expo Go, Metro port 8081.
Bundle load time: 3613 ms, 2037 modules, zero runtime errors in Metro logs.

| #   | Scenario                       | Result  | Notes                                                                                                                                             |
| --- | ------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | App loads to Journal screen    | ✅ PASS | Date "18.03.2026", "Suma kalorii" 0, "Brak posiłków" visible                                                                                      |
| E2  | Navigate to Favorites tab      | ✅ PASS | Tab bounds [270,2211][540,2337], tap → screen changed                                                                                             |
| E3  | Favorites screen title         | ✅ PASS | "Ulubione" rendered                                                                                                                               |
| E4  | Segmented control tabs         | ✅ PASS | "Szablony" and "Oznaczone gwiazdką" both rendered                                                                                                 |
| E5  | Templates empty state          | ✅ PASS | "Brak szablonów" + "Dodaj swój pierwszy szablon!"                                                                                                 |
| E6  | FAB exists with correct testID | ✅ PASS | `favorites-add-template-fab`, content-desc "Dodaj szablon"                                                                                        |
| E7  | FAB opens TemplateFormSheet    | ✅ PASS | Title "Nowy szablon" appeared after FAB tap                                                                                                       |
| E8  | Form field labels present      | ✅ PASS | NAZWA, POSIŁEK, KALORIE (OPCJONALNIE), Zapisz button                                                                                              |
| E9  | Form fields have testIDs       | ✅ PASS | `template-form-name-input`, `template-form-meal-text-input`, `template-form-calories-input`, `template-form-save-btn`, `template-form-cancel-btn` |
| E10 | Fields receive tap focus       | ✅ PASS | `focused="true"` confirmed via UI dump after tap                                                                                                  |
| E11 | No runtime errors              | ✅ PASS | Metro log: bundle OK, no crash, no JS error                                                                                                       |

**Limitation:** `BottomSheetTextInput` (@gorhom/bottom-sheet v5) does not accept `adb shell input text` or
individual `keyevent` commands. This is a known ADB limitation — the component uses an internal event
routing that bypasses Android's standard IME injection. Scenarios T2-T6, T8 require manual device testing.

## Follow-up Fix Verification — 2026-03-18

| Check                                     | Result | Notes                                                                         |
| ----------------------------------------- | ------ | ----------------------------------------------------------------------------- |
| TypeScript (`tsc --noEmit`)               | PASS   | Explicit rerun after follow-up refactor                                       |
| Shared sort control wiring                | PASS   | `SortCycleButton` reused by Journal and Favorites                             |
| TemplateFormSheet save CTA visibility     | PASS   | Emulator UI dump: save button ends at `y=2125`, bottom tabs start at `y=2211` |
| Journal inline delete removed             | PASS   | Delete button removed from `DayView` render path                              |
| Delete moved to edit flow                 | PASS   | `meal-form-delete-btn` rendered only in `mode === "edit"`                     |
| Favorites card tap uses meal              | PASS   | Separate `Use` button removed; `handleUse` moved to card content tap          |
| TemplateFormSheet opens larger by default | PASS   | `openAdd` and `openEdit` now open at the larger snap point (`snapToIndex(1)`) |

### Additional emulator smoke notes

1. Favorites screen still loads correctly after refactor.
2. Template form opens correctly from FAB and starts higher than before.
3. Save button is fully visible above the bottom tab bar.
4. Sorting cycle behavior and delete-in-edit behavior were validated by code path plus typecheck; full interaction still requires manual testing with populated data.

## Manual Testing Required: yes

Below are manual verification steps. Perform on Android emulator or physical device with `npx expo start`.

---

### Preconditions

- App running on Android emulator / device
- At least one meal exists in the Journal (add one if needed via FAB)

---

### Test 1 — Favorites screen loads

1. Tap the ⭐ tab.
2. **Expected:** Screen shows „Ulubione" / „Favorites" title, segmented control with two tabs (Szablony | Oznaczone gwiazdką), empty state for Templates, FAB (+) button.

---

### Test 2 — Create template

1. In Templates tab, tap FAB (+).
2. **Expected:** Bottom sheet opens, title „Nowy szablon" / „New template".
3. Enter name (e.g. „Owsianka"), meal text (e.g. „Płatki owsiane z mlekiem"), calories „350".
4. Tap „Zapisz" / „Save".
5. **Expected:** Sheet closes, template appears in list.

---

### Test 3 — Template sort toggle

1. Create a second template (e.g. „Jogurt z owocami").
2. **Expected:** Sort toggle button appears above the list.
3. Tap sort toggle — it should switch between „Najnowsze" / „Newest" and „A–Z".
4. In A–Z mode, verify templates are sorted alphabetically by name.

---

### Test 4 — Edit template

1. Tap the pencil icon on a template.
2. **Expected:** Bottom sheet opens with existing values pre-filled.
3. Change the name, tap „Zapisz".
4. **Expected:** List updates with new name.

---

### Test 5 — Delete template

1. Tap the trash icon on a template.
2. **Expected:** Alert: „Usuń szablon / Na pewno chcesz usunąć ten szablon?"
3. Tap „Usuń". **Expected:** Template removed from list.
4. Tap trash again → tap „Anuluj". **Expected:** Template NOT removed.

---

### Test 6 — Use template → Journal refreshes immediately

1. With at least one template, tap „Użyj" / „Use".
2. **Expected:** Alert: „Dodano! / Posiłek został dodany do dziennika."
3. Dismiss alert. Navigate to 📔 Dziennik tab.
4. **Expected:** New meal entry appears in today's list WITHOUT needing to swipe.

---

### Test 7 — Starred tab empty state

1. Switch to „Oznaczone gwiazdką" / „Starred" tab.
2. **Expected:** Empty state with ⭐ emoji and explanatory text.

---

### Test 8 — Delete meal from Journal

1. In Journal (📔 tab), find a meal card.
2. **Expected:** Each meal card has a trash icon button on the right side.
3. Tap the trash icon.
4. **Expected:** Alert: „Usuń posiłek / Na pewno chcesz usunąć ten posiłek?"
5. Tap „Usuń". **Expected:** Meal disappears from the list. Calorie total updates.

---

### Test 9 — Starred tab with items (requires TASK-013)

_Deferred to TASK-013 (starring from Journal). The „Oznaczone gwiazdką" tab, unstar button, and „Use" action for starred items are implemented and ready; triggering population requires the star toggle from Journal._

---

## Run Commands

```bash
npx expo start
# then press 'a' to open Android emulator
```
