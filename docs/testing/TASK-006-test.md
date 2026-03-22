# Test Plan — TASK-006 — History Screen (Stage 8)

## Automated Checks

- TypeScript compilation: **PASS** (npx tsc --noEmit, 0 errors)
- Lint: n/a (no ESLint config in project)
- get_errors on all changed files: **PASS**

## Manual Testing Required: yes

Physical Android device or emulator with Expo dev build required.

---

## Preconditions

1. App has been built and installed via `npx expo run:android` (dev build, not Expo Go).
2. At least 5–7 days of meal data logged (spread across 2+ months if possible).
3. Metro running on port 8081: `npx expo start --dev-client --port 8081`.

## Run Commands

```bash
# Start Metro (dev build mode)
npx expo start --dev-client --port 8081

# Launch app on emulator if needed
adb -s emulator-5554 shell am start -n io.github.filipbiernat.mojamicha/.MainActivity
```

---

## Verification Steps (Polski)

### 1. Widok kalendarza

1. Przejdź na zakładkę „Historia".
2. **Oczekiwane:** u góry ekranu widoczny jest pełny miesięczny kalendarz z nawigacją strzałkami.
3. **Oczekiwane:** poniżej kalendarza widoczny jest widok dnia (DayView) z dzisiejszą datą.

### 2. Oznaczenie dni z wpisami

1. Sprawdź dni, w których masz wpisane posiłki.
2. **Oczekiwane:** te daty mają widoczną małą kropkę nadaną kolorem akcentowym (`#00E5FF` dark / koral light).
3. Przejdź strzałką do poprzedniego miesiąca — kropki powinny być poprawnie załadowane.

### 3. Wybór daty na kalendarzu

1. Dotknij dowolnej daty na kalendarzu.
2. **Oczekiwane:** data jest zaznaczona (podświetlona kolor primary), a DayView poniżej przesuwa się na wybraną datę i pokazuje posiłki z tego dnia (lub stan pusty).

### 4. Swipe między dniami

1. W widoku DayView zrób swipe w lewo (dalej) lub w prawo (wstecz).
2. **Oczekiwane:** DayView zmienia datę, a zaznaczenie w kalendarzu przesuwa się na nową datę.
3. Jeśli swipe zmieni miesiąc — **oczekiwane:** kalendarz automatycznie pokazuje nowy miesiąc.
4. Sprawdź też przyciski strzałek w nagłówku DayView (< >) — powinny działać tak samo.

### 5. Edycja posiłku z historii

1. Wybierz datę, która ma posiłki.
2. Stuknij w kartę posiłku na liście.
3. **Oczekiwane:** otwiera się `MealFormSheet` w trybie edycji z danymi wybranego posiłku.
4. Zmień dowolne pole i zapisz.
5. **Oczekiwane:** DayView odświeża się, pokazując zaktualizowany posiłek.

### 6. Motyw ciemny / jasny

1. Wejdź w Ustawienia i zmień motyw.
2. Wróć do historii.
3. **Oczekiwane:** kalendarz i DayView poprawnie stosują nowe kolory (tło, zaznaczenie, kropki, tekst).

### 7. Reset zakładki

1. Przejdź do innej zakładki, a następnie wróć do Historii.
2. **Oczekiwane:** kalendarz resetuje się do bieżącego dnia i miesiąca.

---

## Edge Cases

- Brak danych: miesiąc bez żadnych posiłków — kalendarz nie powinien pokazywać kropek, DayView pokazuje pusty stan.
- Zmiana daty zapisu posiłku na inny miesiąc przez formularz — kalendarz powinien przeskoczyć do nowego miesiąca.
