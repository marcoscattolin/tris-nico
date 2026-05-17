# Tris vs IA Imbattibile

Pagina singola che implementa il tris (tic-tac-toe) giocabile nel browser contro un'IA che non perde mai. Realizzata con HTML/CSS/JavaScript vanilla, senza build step né dipendenze.

## Gioca

Apri `index.html` in un browser, oppure visita la versione pubblicata su GitHub Pages.

## Pubblicare su GitHub Pages

1. Pusha questo repository su GitHub.
2. Vai su **Settings → Pages**.
3. Sotto **Source**, seleziona il branch `main` e la cartella `/ (root)`.
4. Salva. Dopo qualche secondo il sito sarà disponibile su `https://<utente>.github.io/<repo>/`.

Il file `.nojekyll` evita che GitHub Pages applichi la pipeline Jekyll (non necessaria qui).

## Strategia dell'IA

L'IA segue la strategia priorizzata di Newell & Simon (1972), descritta su [Wikipedia](https://en.wikipedia.org/wiki/Tic-tac-toe). Ad ogni turno valuta in ordine:

1. **Win** — completa tre in fila se possibile.
2. **Block** — blocca i tre in fila dell'avversario.
3. **Fork** — crea due minacce simultanee.
4. **Block Fork** — blocca il fork dell'avversario (direttamente o forzandolo a difendere).
5. **Center** — gioca al centro.
6. **Opposite Corner** — gioca nell'angolo opposto a quello dell'avversario.
7. **Empty Corner** — gioca in un angolo libero.
8. **Empty Side** — gioca in un lato libero.

Con gioco perfetto da entrambe le parti, il tris termina sempre in patta: il meglio che puoi ottenere è un pareggio.
