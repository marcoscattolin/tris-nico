# Tris &amp; Impiccato

Sito statico a pagina singola con due giochi giocabili nel browser: il **Tris** contro un'IA imbattibile e l'**Impiccato**, in 8 lingue (italiano, inglese britannico e americano, tedesco, spagnolo, cinese pinyin, hindi romanizzato, latino). HTML/CSS/JavaScript vanilla, nessuna build, nessuna dipendenza.

## Gioca

Apri `index.html` in un browser, oppure visita la versione pubblicata su GitHub Pages. In alto: selettore di lingua e menù per passare tra Tris e Impiccato. La lingua scelta viene ricordata via `localStorage`.

### Tris

- Scegli chi inizia (tu o l'IA) e gioca.
- L'IA applica la strategia priorizzata di Newell &amp; Simon (1972) descritta su [Wikipedia](https://en.wikipedia.org/wiki/Tic-tac-toe): Win → Block → Fork → Block Fork → Center → Opposite Corner → Empty Corner → Empty Side. Non perde mai.

### Impiccato

- Parola casuale dalla lista della lingua scelta (~50-100 parole per lingua, senza diacritici).
- Tastiera con l'alfabeto della lingua: 21 lettere per l'italiano, 24 per il latino classico (no J/W), 26 per inglese / tedesco / pinyin / hindi romanizzato, 27 per lo spagnolo (con Ñ). Funziona anche da tastiera fisica.
- 9 errori e sei impiccato: ad ogni errore appare un nuovo pezzo, prima la forca (asta verticale, asta superiore, cavo) e poi il corpo (testa, busto, braccia, gambe).
- La prima e l'ultima lettera della parola sono già rivelate all'inizio.

A fine partita (in entrambi i giochi) la sessione successiva parte automaticamente dopo 1 secondo, con uno sfondo casuale diverso.

## Pubblicare su GitHub Pages

1. Pusha questo repository su GitHub.
2. **Settings → Pages** → Source: branch `main`, cartella `/ (root)`.
3. Salva. Il sito sarà disponibile su `https://<utente>.github.io/<repo>/`.

Il file `.nojekyll` evita la pipeline Jekyll.
