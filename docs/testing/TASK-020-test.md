# TASK-020 Test Report: Suggestion Chips — Mode-Specific Limits and Space-Efficient Sorting

## Automated Checks

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ PASSED — 0 errors |
| `npx expo lint` | ✅ PASSED — 0 errors, 6 warnings (all pre-existing, not introduced by this task) |

## Code Review

Reviewer: code-review-subagent  
Result: **APPROVED**

## Manual Testing Required: yes

The changes affect interactive chip rendering inside a `BottomSheet`. Per project rules, UI component changes require manual verification on a running emulator.

### Preconditions

- Android emulator running with dev build (or Expo Go)
- At least 8–10 meals logged so enough suggestions exist (with varying name lengths)

### Run Commands

```bash
npx expo start
```

### Verification Steps

1. Otwórz zakładkę Journal i naciśnij FAB, aby otworzyć **quick entry** (tryb uproszczony).
2. Sprawdź, czy pod polem tekstowym widoczne są **co najwyżej 3 chipsy** z propozycjami.
3. Sprawdź, że chipsy są posortowane od **najkrótszego do najdłuższego** (krótsze wiersze układają się razem, minimalizując liczbę zajętych linii).
4. Naciśnij przycisk „Rozwiń" (Expand), aby przejść do **trybu pełnej formy** (full form).
5. Sprawdź, czy widoczne są **co najwyżej 7 chipsów** z propozycjami.
6. Sprawdź, że chipsy są posortowane od najkrótszego do najdłuższego.
7. Wpisz fragment tekstu w pole posiłku — sprawdź, że filtrowanie działa poprawnie i chipsy aktualizują się z zachowaniem sortu.
8. Kliknij chip — sprawdź, że tekst jest wstawiany do pola i chip znika (mealText zmieniony).
9. Sprawdź brak regresji: obramowanie, kolory, padding chipsów wyglądają normalnie w ciemnym i jasnym motywie.
