# Moja Micha – Lista zadań

> Aplikacja mobilna do monitorowania diety i liczenia kalorii.
> Backendless, React Native (Expo), tylko Android (na razie).

---

## 📋 Ustalenia i decyzje projektowe

### Stack technologiczny

- **Framework:** React Native z Expo (managed workflow)
- **Storage:** `expo-sqlite` (SQLite lokalnie na urządzeniu)
- **Projekt:** Istniejące repo `HelloWorld_ReactNative` – pełna rewolucja nazwy, zawartości i struktury folderów
- **Cel platformy:** Android (iOS opcjonalnie w przyszłości)

### Motyw wizualny

- **Domyślny (ciemny):** „Fitness Neon" — tło `#0F0F1A`, akcenty `#00E5FF` + `#FF6B35`
- **Alternatywny (jasny):** „Fresh & Vibrant" — tło `#F8F9FA`, akcenty `#FF6B6B` + `#4ECDC4`
- **Przełączanie:** w Ustawieniach (domyślnie z systemu)
- **Styl:** Minimalistyczny, czysty, praktyczny

### Język

- Polski i Angielski
- Przełączanie w Ustawieniach (domyślnie z systemu)

### Pola posiłku

| Pole              | Opis                                                  |
| ----------------- | ----------------------------------------------------- |
| **Nazwa posiłku** | Auto-wybierana wg pory dnia, edytowalna ręcznie       |
| **Godzina**       | Auto z aktualną godziną, edytowalna ręcznie           |
| **Posiłek**       | Główne pole – wpisywane ręcznie (GBoard + dyktowanie) |
| **Kalorie**       | Opcjonalne – ręcznie w v1, docelowo przez AI          |
| **Analiza AI**    | Opcjonalne – notatki własne w v1, docelowo przez AI   |

### Auto-wybór nazwy posiłku wg pory dnia

| Nazwa        | Godziny                                     |
| ------------ | ------------------------------------------- |
| Śniadanie    | 05:00 – 10:00                               |
| II Śniadanie | 10:00 – 12:00                               |
| Obiad        | 12:00 – 15:00                               |
| Podwieczorek | 15:00 – 18:00                               |
| Kolacja      | 18:00 – 21:00                               |
| Przekąska    | 21:00 – 05:00 (catch-all poza przedziałami) |

Każda kategoria może być ręcznie nadpisana inną przez użytkownika.

### Ulubione

- **Szablony:** tworzone ręcznie w specjalnym widoku (nazwa + treść posiłku + opcjonalnie kcal)
- **Oznaczone wpisy:** konkretne historyczne wpisy oznaczone gwiazdką ⭐
- **Kopiowanie z ulubionych:** nowy wpis z aktualną godziną i datą, treść Posiłku skopiowana, wszystko edytowalne

### Widok dzienny

- Lista posiłków (domyślnie od najnowszego, sortowanie zmienialne)
- Suma kalorii na górze
- Pasek postępu kalorii (tylko jeśli ustawiony dzienny cel)
- Streak 🔥 (np. „5 dni z rzędu") – mały, dyskretny

### Statystyki

- Wykres słupkowy – kalorie każdego dnia (7 / 30 dni)
- Linia trendu (średnia krocząca)
- Podsumowanie: średnia, maksimum, minimum
- Streak – ile dni z rzędu logowano posiłki

### Ustawienia

- Motyw: Ciemny / Jasny / Z systemu
- Język: Polski / Angielski / Z systemu
- Dzienny cel kalorii (opcjonalny, można wyłączyć)

### Wersjonowanie

- **v1** – Pełna aplikacja bez AI (ręczny wpis kalorii, pole Analiza AI jako notatki)
- **v2** – Integracja z OpenAI: auto-kalkulacja kalorii + komunikat o postępie dnia
- **v3** – Android Widget 1×1 (szybki wpis spoza aplikacji, opcjonalnie z uruchomieniem mikrofonu GBoard)

---

## 🗂️ Struktura folderów (docelowa)

```
moja-micha/
├── app/                    # Ekrany (Expo Router lub React Navigation)
│   ├── (tabs)/
│   │   ├── today.tsx       # Dziś
│   │   ├── history.tsx     # Historia
│   │   ├── favorites.tsx   # Ulubione
│   │   ├── stats.tsx       # Statystyki
│   │   └── settings.tsx    # Ustawienia
│   └── _layout.tsx
├── components/             # Wspólne komponenty
├── db/                     # SQLite – schematy, migracje, zapytania
├── hooks/                  # Custom hooks
├── i18n/                   # Lokalizacja (PL / EN)
├── theme/                  # Kolory, typography, dark/light
├── utils/                  # Helpers (pora dnia → nazwa posiłku, itp.)
└── assets/
```

---

## ✅ Zadania do wykonania

### 0. Przygotowanie projektu

- [x] Zmiana nazwy repozytorium i folderu na `moja-micha`
- [x] Wyczyszczenie projektu HelloWorld (usunięcie przykładowego kodu)
- [x] Instalacja zależności: `expo-sqlite`, `react-native-reanimated`, `react-native-gesture-handler`, `@react-navigation/native`, `@react-navigation/bottom-tabs`, `react-native-safe-area-context`, `react-native-screens`
- [x] Instalacja i18n: `expo-localization`, `i18next`, `react-i18next`
- [x] Instalacja kalendarza: `react-native-calendars`
- [x] Instalacja bottom sheet: `@gorhom/bottom-sheet`
- [x] Konfiguracja Expo Router lub React Navigation
- [x] Konfiguracja TypeScript (jeśli nie ma)

### 1. Baza danych (SQLite)

- [x] Projektowanie schematu:
    - Tabela `meals` (id, date, time, meal_type, meal_text, calories, ai_analysis, created_at, updated_at)
    - Tabela `favorites` (id, type [template/starred], name, meal_text, calories, source_meal_id, created_at)
    - Tabela `settings` (key, value)
- [x] Implementacja migracji bazy danych
- [x] Implementacja CRUD dla posiłków
- [x] Implementacja CRUD dla ulubionych
- [x] Implementacja zapisu i odczytu ustawień

### 2. System motywów (Theme)

- [x] Definicja tokenów kolorów dla motywu ciemnego (Fitness Neon)
- [x] Definicja tokenów kolorów dla motywu jasnego (Fresh & Vibrant)
- [x] ThemeProvider + hook `useTheme()`
- [x] Obsługa automatycznego wykrywania motywu systemowego
- [x] Przełączanie i zapamiętywanie motywu w ustawieniach

### 3. Internacjonalizacja (i18n)

- [x] Konfiguracja `i18next` z `expo-localization`
- [x] Tłumaczenia PL – wszystkie teksty UI
- [x] Tłumaczenia EN – wszystkie teksty UI
- [x] Automatyczne wykrywanie języka systemu
- [x] Przełączanie i zapamiętywanie języka w ustawieniach

### 4. Nawigacja

- [x] Pasek zakładek (bottom tab bar) z 4 zakładkami:
    - 📔 Dziennik (zastąpił "Dziś" + "Historia")
    - ⭐ Ulubione
    - 📊 Statystyki
    - ⚙️ Ustawienia
- [x] Ikonki dla każdej zakładki

### 5. Komponent widoku dnia (współdzielony)

- [x] Lista posiłków z danego dnia
- [x] Sortowanie: od najnowszego / od najstarszego
- [x] Suma kalorii na górze
- [x] Pasek postępu względem dziennego celu (jeśli ustawiony)
- [x] Streak 🔥 (dyskretny, w nagłówku)
- [x] Swipe w lewo/prawo między dniami
- [x] Obsługa pustego stanu (brak posiłków)

### 6. Ekran: Dziennik (połączenie Dziś + Historia)

- [x] Komponent widoku dnia z datą = dzisiaj
- [x] Nagłówek z datą i streakiem
- [x] Przycisk FAB (+) – szybki wpis (bottom sheet)
- [x] Swipe między dniami
- [x] Zwijany kalendarz (domyślnie zwinięty): tap na datę lub chevron otwiera/zamyka
- [x] Oznaczenie dni z wpisami na kalendarzu (kropka/kolor)
- [x] Wybieranie daty z kalendarza → DayView przechodzi na wybrany dzień
- [x] Nawigacja do odległychmiesięcy/lat (tap na tytuł miesiąca → siatka lat → miesiące)
- [x] Edycja posiłków z poprzednich dni

### 7. Formularz dodawania / edycji posiłku

- [x] **Bottom sheet** (podstawowy widok – szybki wpis):
    - Pole „Posiłek" (multiline, obsługuje GBoard + dyktowanie)
    - Obsługa klawiatury (KeyboardAvoidingView – content się przesuwa, nie zasłania)
    - Opcja rozwinięcia do pełnego formularza
- [x] **Pełny formularz** (rozwinięty):
    - Nazwa posiłku (picker z listą + auto-wybór wg pory dnia)
    - Godzina (time picker, domyślnie aktualna)
    - Pole „Posiłek"
    - Kalorie (opcjonalne, numeryczne)
    - Analiza AI / notatki (opcjonalne, multiline)
- [x] Walidacja: pole „Posiłek" wymagane
- [x] Zapis nowego posiłku
- [x] Edycja istniejącego posiłku
- [x] Możliwość logowania posiłku wstecz (zmiana daty)
- [x] Wybór z ulubionych w formularzu

### 8. Ekran: Historia → przeniesione do etapu 6 (Dziennik)

- [x] Scalono z ekranem Dziś w jedną zakładkę Dziennik (patrz etap 6)

### 9. Ekran: Ulubione

- [x] Zakładki lub sekcje: Szablony | Oznaczone gwiazdką
- [x] **Szablony:**
    - Lista szablonów
    - Tworzenie nowego szablonu (nazwa, treść, opcjonalnie kcal)
    - Edycja szablonu
    - Usuwanie szablonu
- [x] **Oznaczone gwiazdką:**
    - Lista historycznych wpisów z gwiazdką
    - Możliwość odpinania gwiazdki
- [x] Użycie ulubionego → nowy wpis z aktualną godziną, treść skopiowana

### 10. Ekran: Statystyki

- [x] Przełącznik widoku: 7 dni / 30 dni
- [x] Wykres słupkowy – kalorie per dzień
- [x] Linia trendu (średnia krocząca)
- [x] Podsumowanie: średnia / maks / min dzienna
- [x] Streak: bieżący i rekordowy
- [x] Obsługa braku danych (pusty stan)

### 11. Ekran: Ustawienia

- [x] Motyw: Ciemny / Jasny / Z systemu
- [x] Język: Polski / Angielski / Z systemu
- [x] Dzienny cel kalorii (pole numeryczne, możliwość wyłączenia)
- [x] Zapis ustawień do SQLite
- [x] Natychmiastowe zastosowanie zmiany motywu i języka

### 12. Ostatnie posiłki

- [x] Automatyczna lista N ostatnich unikalnych wpisów pola „Posiłek"
- [x] Dostępna z formularza jako podpowiedź / autocomplete

### 13. Oznaczanie gwiazdką

- [x] Przycisk ⭐ przy każdym posiłku na liście
- [x] Togglowanie ulubionych (dodaj/usuń ze strony ulubionych)

### 14. Jakość i dobre praktyki

- [ ] TypeScript – typowanie wszystkich danych i propsów
- [ ] Obsługa błędów bazy danych
- [ ] Loading states (skeleton / spinner)
- [ ] Responsywność (różne rozmiary ekranów Android)
- [ ] Dostępność (accessibilityLabel na przyciskach)
- [ ] Brak hardcoded strings (wszystko przez i18n)

---

## 🚀 Plan wersjonowania

### v1 – Gotowa aplikacja (bez AI)

Wszystkie zadania 0–14 powyżej.

### v2 – Integracja z OpenAI

- [ ] Ekran ustawień: pole na klucz API OpenAI
- [ ] Po zapisaniu posiłku: auto-wysyłka treści do LLM
- [ ] Zwrot: wyliczone kalorie + analiza (uzupełniają pola automatycznie)
- [ ] Komunikat dzienny: jak idzie względem celu kalorycznego
- [ ] Obsługa przypadku braku sieci / błędu API

### v3 – Android Widget

- [ ] Widget 1×1 na ekranie głównym Androida
- [ ] Jedno kliknięcie → uruchamia aplikację z otwartym bottom sheetem (szybki wpis)
- [ ] Opcjonalnie: uruchomienie mikrofonu GBoard bezpośrednio z widgetu
- [ ] Implementacja: `react-native-android-widget`

---

_Ostatnia aktualizacja: 2026-03-10_
