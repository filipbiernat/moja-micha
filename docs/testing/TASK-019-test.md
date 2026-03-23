# TASK-019 — Test Report: JSON Data Export / Import

## Automated Checks

| Check              | Result               |
| ------------------ | -------------------- |
| `npx tsc --noEmit` | ✅ exit 0, no errors |

## Manual Testing Required: yes

Manual testing requires a physical Android device or emulator with the Expo dev build running.

---

## Preconditions

1. App built and running on Android emulator or device (`npx expo run:android`).
2. Settings screen is accessible via the bottom tab.
3. At least one meal logged in the journal (to make export non-trivial).

---

## Test Cases

### T1 — Export (happy path)

**Steps:**

1. Otwórz ekran Ustawień.
2. Przewiń w dół do sekcji "DANE".
3. Odczytaj dwie opcje: "Eksportuj dane do pliku JSON" i "Importuj dane z pliku JSON".
4. Dotknij "Eksportuj dane do pliku JSON".
5. Poczekaj na pojawienie się arkusza udostępniania systemu Android.
6. Sprawdź, że nazwa pliku to `moja-micha-YYYY-MM-DD.json`.
7. Anuluj arkusz udostępniania.

**Expected:**

- ActivityIndicator pojawia się podczas eksportu.
- Arkusz udostępniania otwiera się z poprawną nazwą pliku.
- Oba przyciski są wyłączone podczas eksportu.

---

### T2 — Export then verify JSON content

**Steps:**

1. Powtórz T1, ale wybierz "Zapisz na urządzeniu" lub "Wyślij do siebie" (np. Google Drive, e-mail).
2. Otwórz zapisany plik w edytorze tekstu.
3. Zweryfikuj strukturę:
    - `"version": 1`
    - `"exportedAt"` jako ISO 8601
    - Tablice `"meals"`, `"favorites"`, `"dailySummaries"`
    - Obiekt `"settings"` bez klucza `openai_api_key`

**Expected:**

- JSON jest poprawnie sformatowany (wcięcia 2 spacje).
- Brak klucza `openai_api_key` w sekcji `settings`.

---

### T3 — Import (happy path)

**Steps:**

1. Zachowaj/zanotuj aktualną liczbę posiłków.
2. Dotknij "Importuj dane z pliku JSON".
3. Wybierz plik JSON wyeksportowany w T2.
4. Sprawdź, że pojawia się dialog potwierdzenia z przyciskami "Importuj" i "Anuluj".
5. Dotknij "Importuj".
6. Poczekaj na alert potwierdzenia importu: "Dane zostały pomyślnie zaimportowane."

**Expected:**

- Dialog potwierdzenia pojawia się.
- Po zatwierdzeniu importu wyświetla się alert o sukcesie.
- Dane w dzienniku są zgodne z importowanym plikiem.

---

### T4 — Import cancelled by user (press Cancel in dialog)

**Steps:**

1. Dotknij "Importuj dane z pliku JSON".
2. Wybierz prawidłowy plik JSON.
3. W dialogu potwierdzenia dotknij "Anuluj".

**Expected:**

- Żadne dane nie zostają nadpisane.
- `isImporting` resetuje się — oba przyciski akcji są ponownie aktywne.

---

### T5 — Import cancelled at file picker

**Steps:**

1. Dotknij "Importuj dane z pliku JSON".
2. W selektorze plików dotknij strzałki Wstecz / Anuluj bez wybierania pliku.

**Expected:**

- Żaden alert nie pojawia się.
- Aplikacja wraca do stanu normalnego (oba przyciski aktywne).

---

### T6 — Import invalid file

**Steps:**

1. Dotknij "Importuj dane z pliku JSON".
2. Wybierz dowolny plik nie będący kopią zapasową Moja Micha (np. plik tekstowy lub JSON o innej strukturze).

**Expected:**

- Pojawia się alert: "Wybrany plik nie jest prawidłową kopią zapasową Moja Micha."
- Dane nie ulegają zmianie.

---

### T7 — Run Commands

```bash
# Start Metro bundler
npx expo start --dev-client --port 8081

# Build and install on emulator (if not yet built)
npx expo run:android
```

---

## Notes

- The OpenAI API key is intentionally excluded from export; verify this in T2.
- `restoreFromBackup` runs inside a SQLite transaction; if any row fails, the DB rolls back — no partial state corruption.
- Hardware back button during the confirm dialog is blocked (`cancelable: false`).
