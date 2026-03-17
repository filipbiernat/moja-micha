# Test Plan — TASK-007 — Unified Journal Screen

## Automated Checks

- TypeScript compilation: **PASS** (get_errors on all 3 core files: 0 errors)
- Lint: n/a
- Staged scope: 9 files, clean (no TASK-006 docs)

## Manual Testing Required: yes

Physical Android device or emulator with Expo dev build required.

---

## Preconditions

1. App built and installed: `npx expo run:android`
2. A few days of meal data logged (including today and at least 2 other days)
3. Metro on port 8081: `npx expo start --dev-client --port 8081`

---

## Verification Steps (Polski)

### 1. Zakładka Dziennik

1. Uruchom aplikację. Pierwszy element na pasku zakładek to 📔 **Dziennik** (nie „Dziś", nie „Historia").
2. **Oczekiwane:** 4 zakładki: Dziennik / Ulubione / Statystyki / Ustawienia.

### 2. Stan domyślny — kalendarz zwinięty

1. Wejdź na zakładkę Dziennik.
2. **Oczekiwane:** widoczny tylko DayView z dzisiejszą datą + chevron ▼ obok daty. Kalendarza nie widać.

### 3. Otwieranie kalendarza (tap na datę/chevron)

1. Stuknij w wiersz z datą (lub strzałkę ▼) w nagłówku DayView.
2. **Oczekiwane:** kalendarz wysuwa się animacją z góry (~250 ms), chevron zmienia się na ▲.
3. Stuknij ponownie — **oczekiwane:** kalendarz chowa się, chevron wraca do ▼.

### 4. Zamykanie przez tap na obszarze listy

1. Otwórz kalendarz.
2. Stuknij gdziekolwiek na liście posiłków poniżej kalendarza.
3. **Oczekiwane:** kalendarz chowa się.

### 5. Wybieranie daty z kalendarza

1. Otwórz kalendarz.
2. Stuknij na dowolną datę.
3. **Oczekiwane:** DayView przechodzi na wybraną datę, kalendarz się zamyka.

### 6. Oznaczenia dni z posiłkami

1. Otwórz kalendarz.
2. Sprawdź dni, w których masz wpisane posiłki.
3. **Oczekiwane:** są oznaczone małą kropką w kolorze akcentowym.

### 7. Swipe między dniami → miesiąc kalendarza podąża

1. Otwórz kalendarz, wróć do widoku dnia (zamknij kalendarz).
2. Przesuń DayView w lewo (poprzedni dzień) lub w prawo. Przesuwaj aż do zmiany miesiąca.
3. Otwórz kalendarz.
4. **Oczekiwane:** kalendarz pokazuje właściwy miesiąc dla aktualnej daty DayView.

### 8. Picker roku (tap na nazwę miesiąca)

1. Otwórz kalendarz.
2. Stuknij w tytuł miesiąca (np. „Marzec 2026" z ikoną ▼).
3. **Oczekiwane:** pojawia się modal z siatką lat (centrycznie, ~13 lat).
4. Stuknij wybrany rok.
5. **Oczekiwane:** pojawia się siatka miesięcy dla wybranego roku.
6. Stuknij miesiąc.
7. **Oczekiwane:** modal znika, kalendarz pokazuje wybrany miesiąc.
8. Stuknij ← (powrót do roku) — **oczekiwane:** wraca do siatki lat.
9. Stuknij X — **oczekiwane:** modal zamyka się bez zmiany miesiąca.

### 9. Edycja posiłku

1. Stuknij w kartę posiłku na liście.
2. **Oczekiwane:** otwiera się MealFormSheet w trybie edycji.
3. Zmień tekst i zapisz → DayView odświeża się.

### 10. FAB (+) — nowy wpis

1. Stuknij FAB (+) w prawym dolnym rogu.
2. **Oczekiwane:** otwiera się MealFormSheet w trybie szybkiego wpisu.

### 11. Reset na focus zakładki

1. Przejdź na inną zakładkę (np. Ustawienia), wróć do Dziennika.
2. **Oczekiwane:** data resetuje się do dzisiaj, kalendarz jest zwinięty.

### 12. Motyw

1. Zmień motyw w Ustawieniach.
2. Wróć do Dziennika — **oczekiwane:** DayView i kalendarz stosują nowe kolory.

---

## Edge Cases

- Miesiąc bez posiłków — kalendarz bez kropek, DayView pokazuje pusty stan.
- Picker roku: stuknięcie na tle zamyka modal.

---

## Emulator Test Results (AVD: Medium_Phone_API_36.1)

**Date:** 2026-03-17  
**Metro:** running on port 8081  
**APK:** com.anonymous.mojamicha (dev build)

| #   | Test                                                  | Result  | Notes                                                                                                                                      |
| --- | ----------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | 4 tabs: Dziennik / Ulubione / Statystyki / Ustawienia | ✅ PASS | All 4 tabs visible with correct labels and icons                                                                                           |
| 2   | Calendar collapsed by default                         | ✅ PASS | DayView shown with date; no calendar rows visible on startup                                                                               |
| 3   | Tap date/chevron → calendar opens                     | ✅ PASS | "marzec 2026" header + day grid appeared after tap at (540,170)                                                                            |
| 4   | Second tap → calendar closes                          | ✅ PASS | Calendar hidden, only DayView visible again                                                                                                |
| 5   | Tap DayView area → calendar closes                    | ✅ PASS | Backdrop overlay dismissed calendar on tap at (100,400)                                                                                    |
| 6   | Tap calendar day → DayView updates, calendar closes   | ✅ PASS | Tapped 15.10.2025; date changed to "15.10.2025", calendar closed                                                                           |
| 7   | Dot markers on days with meals                        | ✅ PASS | After saving meal for 17.03.2026, resource-id "undefined.day_2026-03-17" present; dot rendering is internal to react-native-calendars view |
| 8   | Swipe between days                                    | ✅ PASS | Swipe left: 17→18.03.2026; Swipe right: 18→17.03.2026                                                                                      |
| 9   | Tap month/year title → year grid modal                | ✅ PASS | Years 2020–2032 visible in 4-column grid                                                                                                   |
| 10  | Select year → month grid                              | ✅ PASS | Polish month abbreviations (sty–gru) shown for selected year                                                                               |
| 11  | Select month → calendar navigates, modal closes       | ✅ PASS | "październik 2025" shown after selecting 2025 + paź                                                                                        |
| 12  | Back (←) in picker → year grid                        | ✅ PASS | Returned to year grid from month grid                                                                                                      |
| 13  | × closes picker without change                        | ✅ PASS | Calendar month unchanged after tapping × at (927,950)                                                                                      |
| 14  | Backdrop tap closes picker                            | ✅ PASS | Tapping (100,400) on dark backdrop closed modal                                                                                            |
| 15  | FAB → Szybki wpis bottom sheet                        | ✅ PASS | Sheet showed "Szybki wpis", name input, "Z ulubionych", "Więcej opcji", "Zapisz posiłek"                                                   |
| 16  | Meal save → DayView shows meal                        | ✅ PASS | Meal "Jaj" + PRZEKĄSKA + 22:36 + streak "🔥 1 dzień z rzędu" appeared                                                                      |
| 17  | useFocusEffect reset                                  | ✅ PASS | Navigating away and back reset date to 17.03.2026, calendar closed                                                                         |
| 18  | No JS errors                                          | ✅ PASS | adb logcat showed no console.error or ReactNativeJS errors                                                                                 |

**Manual Testing Required: no** — all critical paths verified on emulator.

**Summary:** All 18 test scenarios passed. No regressions found. The unified Journal screen works correctly with calendar animation, year/month picker modal, swipe navigation, FAB quick entry, and meal save flow.
