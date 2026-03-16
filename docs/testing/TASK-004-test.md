# TASK-004 — Meal Add/Edit Form (Stage 7): Test Report

**Date:** 2026-03-16
**Reviewed by:** testing-subagent
**Status:** PASS (automated) / Manual verification required

---

## Automated Checks

| Check                      | Command            | Result                                             |
| -------------------------- | ------------------ | -------------------------------------------------- |
| TypeScript                 | `npx tsc --noEmit` | ✅ PASS — zero errors                              |
| i18n key parity (mealForm) | manual diff        | ✅ PASS — identical 19 keys in en.json and pl.json |

### i18n Key Parity Detail

Both `i18n/en.json` and `i18n/pl.json` contain exactly the same `mealForm` keys:

```
title_quick, title_add, title_edit,
field_meal_type, field_date, field_time, field_meal_text,
field_calories, field_notes,
placeholder_meal_text, placeholder_calories, placeholder_notes,
btn_expand, btn_collapse, btn_save, btn_saving, btn_cancel,
validation_required, save_error
```

No missing or extra keys on either side.

---

## Code Inspection Notes

- `MealFormSheet` uses `keyboardBehavior="interactive"` and `keyboardBlurBehavior="restore"` — correct approach for keeping footer buttons above the keyboard.
- `DateTimePicker` components are rendered **outside** the `BottomSheet` tree, avoiding known layout conflict on Android.
- All interactive elements carry `testID` props — ready for future automation.
- `openEdit` always sets `isExpanded = true` and snaps to index 1 (92%) — pre-fill path is sound.
- `handleSheetChange` at index 0 resets `isExpanded` to `false` — collapse-via-drag behavior is wired.
- Validation clears on-the-fly as soon as the user types in the meal text field.
- Error boundary in `handleSave` shows `mealForm.save_error` to the user on DB exceptions.

---

## Manual Testing Required

**Yes.** The following areas require a physical Android device or emulator running via Expo Go.

---

## Preconditions

1. Device (Android) with Expo Go installed, or Android emulator running.
2. Project built and served:
    ```
    npx expo start
    ```
3. Open the app to the **Dziś / Today** tab.
4. At least one meal already saved (required for test cases 9–10). You can create one via the form itself.

---

## Run Command

```bash
cd c:\Filip\SW\MojaMicha
npx expo start
```

Scan the QR code with Expo Go on the device, or press `a` to launch the Android emulator.

---

## Manual Test Cases

### TC-01 — FAB opens quick entry sheet

**Kroki:**

1. Dotknij przycisk FAB (`+`) w prawym dolnym rogu ekranu Dziś.

**Oczekiwany wynik:**

- Arkusz wsuwa się od dołu i zajmuje ~50% wysokości ekranu.
- Widoczny nagłówek „Szybki wpis", pole tekstowe oraz przyciski „Pełny formularz" i „Zapisz posiłek".

---

### TC-02 — Zapis szybkiego wpisu

**Kroki:**

1. Otwórz arkusz (FAB).
2. Wpisz dowolny tekst w polu tekstowym, np. „Jajecznica".
3. Dotknij „Zapisz posiłek".

**Oczekiwany wynik:**

- Arkusz się zamyka.
- Nowy posiłek pojawia się na liście w widoku dzisiejszego dnia.

---

### TC-03 — Walidacja pustego pola

**Kroki:**

1. Otwórz arkusz (FAB), nie wpisuj nic.
2. Dotknij „Zapisz posiłek".

**Oczekiwany wynik:**

- Arkusz pozostaje otwarty.
- Pod polem tekstowym wyświetla się komunikat błędu: „Opis posiłku jest wymagany."
- Błąd znika natychmiast po rozpoczęciu pisania.

---

### TC-04 — Rozwijanie do pełnego formularza

**Kroki:**

1. Otwórz arkusz (FAB) — widok szybkiego wpisu.
2. Dotknij przycisku „Pełny formularz".

**Oczekiwany wynik:**

- Arkusz rozciąga się do ~92% wysokości ekranu.
- Nagłówek zmienia się na „Dodaj posiłek".
- Widoczne pola: chipsy typów posiłku, Data, Godzina, opis posiłku, Kalorie, Notatki.
- Na dole przyciski „Anuluj" i „Zapisz posiłek" są zawsze widoczne.

---

### TC-05 — Natywny selektor daty

**Kroki:**

1. Otwórz pełny formularz (TC-04).
2. Dotknij przycisku „Data" (pokazuje datę w formacie DD.MM.RRRR).

**Oczekiwany wynik:**

- Otwiera się natywny dialog wyboru daty (Android DatePickerDialog).
- Po wybraniu daty i potwierdzeniu, przycisk „Data" aktualizuje się do wybranej wartości.

---

### TC-06 — Natywny selektor godziny

**Kroki:**

1. Otwórz pełny formularz.
2. Dotknij przycisku „Godzina".

**Oczekiwany wynik:**

- Otwiera się natywny dialog wyboru godziny (24h, Android TimePickerDialog).
- Po wyborze, przycisk „Godzina" aktualizuje się do wybranej wartości.

---

### TC-07 — Chipsy typów posiłku

**Kroki:**

1. Otwórz pełny formularz.
2. Dotknij kolejno: „Obiad", potem „Kolacja".

**Oczekiwany wynik:**

- Aktywny chip wyróżnia się kolorem akcentu (tło + tekst).
- Poprzednio aktywny chip wraca do stanu neutralnego.
- Jednocześnie aktywny jest dokładnie jeden chip.

---

### TC-08 — Pełny formularz — wszystkie pola + zapis

**Kroki:**

1. Otwórz pełny formularz i wypełnij:
    - Typ: „Obiad"
    - Data: jutrzejsza
    - Godzina: 13:00
    - Opis posiłku: „Zupa pomidorowa"
    - Kalorie: 350
    - Notatki: „Z makaronem"
2. Dotknij „Zapisz posiłek".

**Oczekiwany wynik:**

- Arkusz się zamyka.
- Widok przeskakuje do jutrzejszego dnia i wyświetla zapisany posiłek z danymi: typ Obiad, 13:00, 350 kcal, notatka.

---

### TC-09 — Otwieranie karty posiłku do edycji

**Kroki:**

1. Upewnij się, że na liście istnieje przynajmniej jeden posiłek.
2. Dotknij karty posiłku.

**Oczekiwany wynik:**

- Arkusz otwiera się w trybie pełnego formularza (~92%).
- Nagłówek: „Edytuj posiłek".
- Wszystkie pola są wstępnie wypełnione danymi tapniętego posiłku.

---

### TC-10 — Zapis edytowanego posiłku

**Kroki:**

1. Otwórz istniejący posiłek do edycji (TC-09).
2. Zmień opis na „Zmieniony opis", zmień kalorie na 500.
3. Dotknij „Zapisz posiłek".

**Oczekiwany wynik:**

- Arkusz się zamyka.
- Karta posiłku na liście aktualizuje się: nowy opis i 500 kcal.

---

### TC-11 — Widoczność przycisków przy otwartej klawiaturze

**Kroki:**

1. Otwórz pełny formularz.
2. Dotknij pola opisu posiłku — klawiatura systemu się otwiera.

**Oczekiwany wynik:**

- Arkusz przesuwa się w górę razem z klawiaturą (`keyboardBehavior="interactive"`).
- Przyciski „Anuluj" i „Zapisz posiłek" pozostają widoczne nad klawiaturą.
- Przewijanie pól formularza działa poprawnie.

---

### TC-12 — Zwinięcie pełnego formularza gestem

**Kroki:**

1. Otwórz pełny formularz.
2. Przeciągnij uchwyt arkusza w dół tak, aby arkusz zatrzymał się na ~50%.

**Oczekiwany wynik:**

- Arkusz zatrzymuje się w widoku szybkiego wpisu (50%).
- Nagłówek zmienia się na „Szybki wpis" (tryb „add") lub „Edytuj posiłek" (tryb „edit").
- Tekst wpisany w poprzednim widoku jest zachowany w polu.

---

## Rejestr ryzyk

| Ryzyko                                                                                    | Prawdopodobieństwo | Uwagi                          |
| ----------------------------------------------------------------------------------------- | ------------------ | ------------------------------ |
| `keyboardBehavior="interactive"` może zachowywać się inaczej w starszych wersjach Android | Niskie             | Należy przetestować na API 30+ |
| Natywny DateTimePicker — wygląd różni się między Androidem 10 i 13                        | Niskie             | Tylko kosmetyczne              |
| Brak animacji przy przejściu quick→full jeśli jest uruchomiony na wolnym urządzeniu       | Niskie             | Nie blokuje funkcji            |

---

## Decyzja o gotowości

Kandydat jest gotowy do ręcznego testu akceptacyjnego na urządzeniu po pomyślnym przejściu automatycznych sprawdzeń TypeScript i weryfikacji kluczy i18n.
