# TASK-005 Test Report — Replace Modal favorites picker with BottomSheet

**Date:** 2026-03-16  
**Tester:** testing-subagent  
**Status:** PASS (automated) / MANUAL TESTING REQUIRED

---

## Automated Checks

| # | Check | Command | Result |
|---|-------|---------|--------|
| 1 | TypeScript strict typecheck | `npx tsc --noEmit` | ✅ PASS — exit 0, no errors |
| 2 | No forbidden patterns (`React Native Modal`, `<Modal`, `FlatList`) | `grep -n "React Native Modal\|<Modal\|FlatList" components/MealFormSheet.tsx` | ✅ PASS — 0 matches (grep exit 1) |
| 3 | BottomSheet components present (`BottomSheetSectionList`, `BottomSheetBackdrop`, `favoritesSheetRef`) | `grep -n "BottomSheetSectionList\|BottomSheetBackdrop\|favoritesSheetRef" components/MealFormSheet.tsx` | ✅ PASS — 8 matches (lines 5, 6, 7, 77, 169, 185, 196, 959, 964, 965, 995, 1021) |
| 4 | i18n section keys used (`favorites_picker_section_templates`, `favorites_picker_section_starred`) | `grep -n "favorites_picker_section_templates\|favorites_picker_section_starred" components/MealFormSheet.tsx` | ✅ PASS — 2 matches (lines 179, 182) |
| 5 | testIDs present (`favorites-picker-close-btn`, `favorites-picker-item-` prefix, trigger buttons) | `grep -n "favorites-picker" components/MealFormSheet.tsx` + trigger buttons | ✅ PASS — close-btn (line 997), item prefix (line 1050), quick-favorites-btn (line 868), full-favorites-btn (line 581) |
| 6 | Staged files scope — only task-relevant files | `git diff --cached --name-only` | ✅ PASS — exactly 3 files: `components/MealFormSheet.tsx`, `docs/reviews/TASK-005-review.md`, `docs/tasks/TASK-005-plan.md` |

**All 6 automated checks: PASS**

---

## Manual Testing Required

**Platform:** Android (Expo Managed Workflow)  
**Prerequisites:** Android device or emulator connected

### Uruchomienie aplikacji

```
npx expo start --android
```

---

### Warunki wstępne (Preconditions)

1. Aplikacja skompilowana i załadowana na urządzeniu Android.
2. W bazie danych powinny istnieć co najmniej 2–3 ulubione pozycje (zakładki + oznaczone gwiazdką), aby przetestować grupowanie sekcji. Jeśli baza jest pusta — użyj ulubionych z poprzednich zadań lub dodaj ręcznie przez ekran Ulubionych.
3. Scenariusz „pusta lista" wymaga osobnego uruchomienia z wyczyszczoną bazą (lub usunięciem wszystkich ulubionych).

---

### Scenariusze testowe

#### MT-01 — Przycisk „Z ulubionych" w widoku szybkiego wpisu (snap 50%)

1. Otwórz kartę **Dzisiaj**.
2. Naciśnij przycisk **+** (dodaj posiłek) — arkusz otwiera się w pozycji 50%.
3. Naciśnij przycisk **Z ulubionych** (`testID="meal-form-quick-favorites-btn"`).
4. **Oczekiwany wynik:** Otwiera się *drugi* arkusz dolny (nie dialog Modal), widoczny nad głównym arkuszem. Pokazuje sekcje z ulubionymi lub tekst „brak ulubionych".

#### MT-02 — Przycisk „Z ulubionych" w pełnym formularzu (snap 92%)

1. Otwórz arkusz dodawania posiłku, naciśnij **Rozwiń** lub edytuj istniejący posiłek.
2. Naciśnij mały przycisk **Z ulubionych** obok etykiety „Posiłek" (`testID="meal-form-full-favorites-btn"`).
3. **Oczekiwany wynik:** Arkusz ulubionych otwiera się poprawnie, nie zakłóca klawiatury.

#### MT-03 — Wybranie ulubionego

1. Otwórz arkusz ulubionych (MT-01 lub MT-02).
2. Naciśnij dowolny wiersz ulubionego (testID `favorites-picker-item-{id}`).
3. **Oczekiwany wynik:** Pole tekstowe posiłku wypełnia się tekstem ulubionego; jeśli ulubiony ma kalorie, pole kalorii też się wypełnia. Arkusz ulubionych zamyka się płynnie i wraca do głównego formularza.

#### MT-04 — Zamknięcie gestem przeciągania

1. Otwórz arkusz ulubionych.
2. Przeciągnij go w dół (pan-to-dismiss).
3. **Oczekiwany wynik:** Arkusz zamyka się. Po ponownym otwarciu arkusz ulubionych wyświetla świeże dane (poprzednia lista `favoritesSections` jest wyczyszczona).

#### MT-05 — Przycisk Zamknij w nagłówku arkusza ulubionych

1. Otwórz arkusz ulubionych.
2. Naciśnij ikonę **×** w prawym górnym rogu (`testID="favorites-picker-close-btn"`).
3. **Oczekiwany wynik:** Arkusz ulubionych zamyka się, powrót do widoku głównego formularza.

#### MT-06 — Stan pusty

1. Usuń wszystkie ulubione (lub przetestuj na urządzeniu z pustą bazą).
2. Otwórz arkusz ulubionych.
3. **Oczekiwany wynik:** Zamiast listy wyświetla się komunikat o braku ulubionych (klucz i18n `mealForm.favorites_picker_empty`).

#### MT-07 — Grupowanie sekcji

1. Upewnij się, że istnieje co najmniej jeden wpis typu **szablon** i jeden **oznaczony gwiazdką**.
2. Otwórz arkusz ulubionych.
3. **Oczekiwany wynik:** Dwie wyraźnie oznaczone sekcje: „SZABLONY" i „OZNACZONE GWIAZDKĄ" (lub odpowiedniki w języku aplikacji).

#### MT-08 — Zamknięcie głównego arkusza zamyka też arkusz ulubionych

1. Otwórz arkusz ulubionych (MT-01).
2. Zamknij główny arkusz poprzez przeciąganie w dół lub przycisk Anuluj.
3. **Oczekiwany wynik:** Oba arkusze zamykają się. Nie ma żadnego „osierocone" arkusze na ekranie.

#### MT-09 — Brak migotania/przezroczystości na Androidzie

1. Otwórz i zamknij arkusz ulubionych kilka razy.
2. **Oczekiwany wynik:** Brak migotania, transparentnych artefaktów lub zakłóceń animacji (problem obecny w poprzedniej implementacji opartej na Modal).

---

### Obszary ryzyka regresji

- Otwieranie/zamykanie głównego `MealFormSheet` bez używania ulubionych (flow podstawowy bez zmian).
- Edycja posiłku (`openEdit`) — weryfikacja, że stan formularza nie jest nadpisywany przez logikę ulubionych.
- Klawisz Back na Androidzie przy otwartym arkuszu ulubionych — powinien zamknąć tylko arkusz ulubionych, nie cofać nawigacji.

---

## Poprawki po testach manualnych

| Fix | Opis |
|-----|------|
| Bug fix (TASK-005) | `snapToIndex` zastąpione przez `index={favoritesSheetIndex}` state — przyciski działają poprawnie na urządzeniu |

## Podsumowanie

| Kategoria | Status |
|-----------|--------|
| Testy automatyczne | ✅ WSZYSTKIE PRZESZŁY (6/6) |
| Testy manualne | ⏳ WYMAGANE |
| Kandydat do commita | ✅ GOTOWY |
| Staged files hygiene | ✅ OK |

**Komenda do uruchomienia:**

```bash
npx expo start
```
*(Expo Go na telefonie — zeskanuj QR kod; nie używać `--android` gdy `adb`/`ANDROID_HOME` nie jest skonfigurowane)*


**Pliki w staged:**

```
components/MealFormSheet.tsx
docs/reviews/TASK-005-review.md
docs/tasks/TASK-005-plan.md
```
