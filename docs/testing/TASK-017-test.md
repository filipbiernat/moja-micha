# TASK-017 Test Plan & Results

## Automated checks

- TypeScript: PASS (`npx tsc --noEmit`)
- Review: PASS (`docs/reviews/TASK-017-review.md` status: `APPROVED`)
- Editor diagnostics: PASS (no errors in edited source files)

## Follow-up fixes covered by this test update

- Daily summary prompt no longer assumes the day is already complete when only a partial meal log exists.
- Canonical summary headings are normalized to Polish section titles with diacritics when the UI language is `pl`.
- The summary card is hidden entirely for empty days, is collapsed by default, and resets its local state when the viewed day changes.
- The generic empty summary prompt uses tighter vertical spacing.
- Recent suggestion chips use bottom-sheet-aware horizontal scrolling in both quick and expanded forms.
- The meal quick-entry sheet uses fixed snap points again so the FAB flow opens at the intended height.

---

## Manual Testing Required: yes

Reason: live end-to-end verification of AI-generated summary content still requires a valid OpenAI API key, and the FAB quick-entry height fix should still be spot-checked on device/emulator because this update did not include a fresh trustworthy interactive emulator pass.

## Previous emulator verification still relevant

Environment previously used during TASK-017 follow-up validation:

- Android emulator: `Medium_Phone_API_36.1`
- Installed dev build package on emulator: `com.anonymous.mojamicha`
- Runtime language in settings DB: `pl`
- Metro status: `packager-status:running` on port `8081`

Previously verified:

- Ingredient toggle still expanded and collapsed correctly after the compact UI refinement.
- Daily summary fallback states rendered in Polish.
- Runtime database included the `daily_summaries` table.
- The daily summary card rendered correctly after being moved into the `FlatList` header.

## Manual verification steps pending (Polish)

Preconditions:

- W emulatorze lub na urządzeniu ustaw poprawny klucz OpenAI w Ustawieniach.
- Uruchom Metro przez `npx expo start --dev-client --port 8081`.
- Otwórz aktualny dev build aplikacji.

Steps:

1. Dodaj lub edytuj posiłek przy aktywnym języku polskim.
2. Sprawdź, czy analiza AI zwraca nazwy składników po polsku.
3. W widoku dnia z co najmniej jednym posiłkiem użyj `Generuj` w karcie podsumowania.
4. Potwierdź, że nagłówki sekcji są po polsku, np. `Co poszło dobrze`, `Co poprawić`, `Jedna konkretna wskazówka na jutro`.
5. Po wejściu na dzień z zapisanym podsumowaniem potwierdź, że karta startuje zwinięta i rozwija się dopiero po tapnięciu.
6. Przejdź na dzień bez posiłków i potwierdź, że sekcja `Podsumowanie dietetyka AI` nie renderuje się wcale.
7. Dla dnia z posiłkami, ale bez wygenerowanego podsumowania, potwierdź, że tekst zachęty nie ma nadmiernych pustych marginesów pionowych.
8. Zwiń i rozwiń kartę podsumowania, a następnie przewiń ekran w dół do listy posiłków.
9. Otwórz `Szybki wpis`, przejdź do `Więcej opcji` i sprawdź, czy rząd podpowiedzi z ostatnich wpisów przewija się poziomo bez przycinania pionowego.
10. Otwórz `Szybki wpis` z FAB i potwierdź, że sheet startuje na oczekiwanej wysokości, a `Więcej opcji` nadal rozwija go do pełnego formularza.
11. Potwierdź, że zapisane podsumowanie pojawia się po ponownym otwarciu tego dnia.
12. Sprawdź, czy odświeżenie podsumowania aktualizuje znacznik czasu `Wygenerowano:`.

## Notes

- During earlier follow-up validation, some Maestro retries hit a white-screen dev-client state even though the app package was installed. The stable recovery path was: confirm Metro on `8081`, `adb am force-stop com.anonymous.mojamicha`, then relaunch and rerun Maestro.
- BottomSheet-based flows remained timing-sensitive in Maestro, so treat automated coverage there as smoke-level only and rely on a human device/emulator spot-check for final UX sign-off.
