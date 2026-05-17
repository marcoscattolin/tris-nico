# Tris &amp; Impiccato

Sito statico a pagina singola con due giochi giocabili nel browser: il **Tris** contro un'IA imbattibile e l'**Impiccato** in italiano. HTML/CSS/JavaScript vanilla, nessuna build, nessuna dipendenza.

## Gioca

Apri `index.html` in un browser, oppure visita la versione pubblicata su GitHub Pages. Il menù in alto permette di passare tra Tris e Impiccato.

### Tris

- Scegli chi inizia (tu o l'IA) e gioca.
- L'IA applica la strategia priorizzata di Newell &amp; Simon (1972) descritta su [Wikipedia](https://en.wikipedia.org/wiki/Tic-tac-toe): Win → Block → Fork → Block Fork → Center → Opposite Corner → Empty Corner → Empty Side. Non perde mai.

### Impiccato

- Parola italiana casuale da una lista interna (~100 parole, lettere senza accenti).
- Tastiera italiana di 21 lettere (A-V, escluse J/K/W/X/Y); funziona anche da tastiera fisica.
- 6 errori e sei impiccato. La figura del boia si compone mano a mano.

A fine partita (in entrambi i giochi) la sessione successiva parte automaticamente dopo 1 secondo, con uno sfondo casuale diverso.

## Pubblicare su GitHub Pages

1. Pusha questo repository su GitHub.
2. **Settings → Pages** → Source: branch `main`, cartella `/ (root)`.
3. Salva. Il sito sarà disponibile su `https://<utente>.github.io/<repo>/`.

Il file `.nojekyll` evita la pipeline Jekyll.
