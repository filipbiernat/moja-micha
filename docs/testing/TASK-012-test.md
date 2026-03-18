# TASK-012 Test Report — Recent Meals Autocomplete

## Automated Checks

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ no errors |
| TypeScript strict | ✅ no implicit any |

## Manual Testing Required: yes

### Preconditions
- Android emulator running
- App installed via `npx expo start --android` or dev build
- At least 1–2 prior meals saved (so recent suggestions exist)

### Run Command
```
npx expo start --android
```

### Manual Verification Steps (PL)

1. **Brak sugestii (pusta baza)** — Przy pierwszym uruchomieniu appki (zero posiłków) otwórz szybki wpis: nie powinny pojawić się żadne chipy sugestii.

2. **Sugestie po dodaniu posiłków** — Dodaj 3–5 posiłków z różnymi tekstami (np. "jajecznica", "owsianka", "kanapka"). Otwórz ponownie szybki wpis (FAB +): powinny pojawić się chipy z ostatnimi posiłkami pod polem tekstowym.

3. **Filtrowanie** — W polu tekstowym wpisz "j" — widoczna powinna być tylko sugestia "jajecznica". Wyczyść pole — powinny wrócić wszystkie sugestie.

4. **Wybór sugestii** — Dotknij chipu "owsianka": pole tekstowe powinno wypełnić się tekstem "owsianka".

5. **Pełny formularz** — Otwórz pełny formularz (przycisk "Więcej opcji"). Sugestie powinny też wyświetlić się pod polem "Posiłek" w pełnym formularzu.

6. **Edycja posiłku** — Dotknij istniejącego posiłku, aby go edytować. W edycji (SNAP_FULL) sugestie powinny być widoczne.

7. **Scrologia horyzontalna** — Jeśli jest więcej niż ~4 sugestie, sprawdź przewijanie listy chipów w poziomie.

### Notes
- Chips do not need to dismiss the keyboard after selection (keyboard stays open for further editing)
- Chips should have unique testIDs (`meal-form-suggestion-chip-<text>`)

**Manual Testing Required: yes**
