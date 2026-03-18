# TASK-009 Test Report — Statistics Screen

## Automated Checks

### TypeScript Compilation

- **Status:** PASS
- Zero errors across all changed files (`StatsScreen.tsx`, `db/meals.ts`, `db/index.ts`, `i18n/*.json`)
- No implicit `any`

### Lint

- No lint config present in project (no ESLint setup) — skipped

### Static Verification

- All user-visible strings use `t()` translation keys
- All colors come from `ColorTokens` theme tokens
- `testID` present on: `stats-period-toggle`, `stats-period-7d`, `stats-period-30d`, `stats-chart-container`, `stats-empty-state`, `stats-summary-row`, `stats-streak-row`, `stats-streak-current`, `stats-streak-record`

---

## Manual Testing Required: yes

### Preconditions

1. Android emulator running (or physical Android device)
2. Expo Go installed on emulator/device
3. Metro bundler started: `npx expo start --android`

### Run Commands

```bash
cd /c/Filip/SW/MojaMicha
npx expo start --android
```

### Manual Verification Steps (PL)

#### Test 1: Ekran startowy (brak danych)

1. Wyczyść bazę danych lub użyj świeżej instalacji (posiłki bez kalorii)
2. Przejdź do zakładki **Statystyki** 📊
3. ✅ Oczekiwane: widoczny nagłówek "Statystyki", przełącznik "7 dni / 30 dni", sekcja wykresu z pustym stanem ("Brak danych"), karty streaku (0 dni)

#### Test 2: Dane z kaloriami — widok 7 dni

1. Dodaj co najmniej 3 posiłki z różnych dni z wpisanymi kaloriami (np. 1800, 2200, 1500)
2. Przejdź do zakładki **Statystyki**
3. ✅ Oczekiwane: wykres słupkowy widoczny, słupki proporcjonalne do wartości kalorii, żółta linia trendu nad słupkami, poprawne etykiety (skrócone nazwy dni), sekcja Podsumowanie z avg/maks/min

#### Test 3: Dzień dzisiejszy wyróżniony

1. Masz posiłki z kaloriami z dzisiaj
2. ✅ Oczekiwane: słupek dla dnia dzisiejszego jest w kolorze **pomarańczowym/koralowym** (secondary), inne słupki w **cyan/coral** (primary), etykieta dzisiejszego dnia pogrubiona

#### Test 4: Przełącznik widoku 30 dni

1. Naciśnij przycisk "30 dni"
2. ✅ Oczekiwane: wykres rozszerza się (scrollowalny poziomo dla 30 słupków), etykiety co 5 dni (1, 5, 10, 15...), linia trendu 7-dniowa

#### Test 5: Streak — bieżący i rekord

1. Masz wpisy z kilku kolejnych dni
2. ✅ Oczekiwane: sekcja "SERIE" z kartami "Bieżący streak" 🔥 i "Rekord" 🏆, liczby dni poprawne

#### Test 6: Pusty stan bez kalorii

1. Dodaj posiłki BEZ kalorii (pole kalorii pusty)
2. ✅ Oczekiwane: sekcja wykresu pokazuje pusty stan "Brak danych", podsumowanie pokazuje "—" zamiast liczb

#### Test 7: Motyw jasny

1. W Ustawieniach zmień motyw na **Jasny**
2. ✅ Oczekiwane: cały ekran w kolorach jasnych (białe karty, czerwono-różowe akcenty)

#### Test 8: Język angielski

1. W Ustawieniach zmień język na **English**
2. ✅ Oczekiwane: sekcje "CALORIES", "SUMMARY", "STREAKS", karty "Avg / Max / Min", etykiety "Current streak / Record"

---

## Edge Cases

- [ ] Tylko 1 posiłek z kaloriami → wykres + podsumowanie (bez linii trendu bo za mało punktów)
- [ ] Dziura w danych (brak wpisów przez kilka dni w środku 30-dniowego zakresu) → linia trendu nie łączy się przez dziurę
- [ ] Bardzo duże kalorie (np. 9000) → skala Y dopasowuje się (round up do 500)

---

## Status

**Manual Testing Required: yes** — Wymaga weryfikacji SVG wykresu i interakcji na urządzeniu/emulatorze.
