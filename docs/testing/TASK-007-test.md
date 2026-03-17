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
