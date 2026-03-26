# Kontekst rozmowy i nowe zadanie

## Kontekst

W aplikacji Moja Micha, podczas dodawania posiłku, pod polem "Co zjadłeś" wyświetlają się podpowiedzi (chipsy) na podstawie ostatnich wpisów. Dotychczas podpowiedzi były przewijane poziomo, ale użytkownik widział tylko dwie, a druga była ucięta. Zmieniono to na układ zawijany (flexWrap), z limitem liczby podpowiedzi.

W kolejnym kroku pojawiła się potrzeba lepszego wykorzystania przestrzeni:

- Obecnie: krótka podpowiedź + długa podpowiedź + krótka podpowiedź zajmują 3 linijki, bo każda podpowiedź jest w osobnym wierszu jeśli nie mieści się w całości w poprzednim.
- Problem: Marnuje się miejsce — np. dwie krótkie podpowiedzi mogłyby być w jednej linii, ale przez długą podpowiedź pomiędzy nimi są rozdzielone.

## Nowe zadanie

1. W trybie uproszczonym (quick entry): wyświetlaj maksymalnie 3 podpowiedzi.
2. W trybie zaawansowanym (full form — z wyborem daty, godziny i kalorii): wyświetlaj maksymalnie 7 podpowiedzi.
3. Zadbaj o efektywne wykorzystanie przestrzeni:
    - Chipsy powinny układać się w wierszach tak, by minimalizować liczbę zajętych linii (np. dwie krótkie podpowiedzi mogą być w jednej linii, nawet jeśli pomiędzy nimi w tablicy jest długa podpowiedź).
    - Unikaj sytuacji, w której przez długą podpowiedź pomiędzy krótkimi powstają niepotrzebne puste miejsca.

Nie przechodź do implementacji przed akceptacją tego opisu.
