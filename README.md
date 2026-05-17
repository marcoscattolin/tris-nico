# Giochi

Sito statico a pagina singola con sei giochi giocabili nel browser, localizzati in 8 lingue (italiano, inglese britannico e americano, tedesco, spagnolo, cinese pinyin, hindi romanizzato, latino). HTML/CSS/JavaScript vanilla, nessuna build, nessuna dipendenza.

## Giochi

- **Tris** — contro un'IA imbattibile (strategia Newell &amp; Simon).
- **Impiccato** — indovina la parola, 9 errori massimi, la forca si compone progressivamente; prima e ultima lettera già rivelate.
- **Anagrammi** — rimetti in ordine le lettere mescolate, click per posizionare i tasselli nei slot.
- **Memory** — griglia 4×4 con 8 coppie di emoji da accoppiare; record sulle mosse.
- **2048** — unisci le tessere fino a raggiungere 2048; frecce o swipe.
- **Gioco del 15** — rimetti in ordine le tessere da 1 a 15 facendole scivolare nello spazio vuoto; record sulle mosse minime.

## Gioca

Apri `index.html` in un browser, oppure visita la versione pubblicata su GitHub Pages. In alto: selettore di lingua, poi menù per scegliere il gioco. La lingua e i record vengono ricordati via `localStorage`.

## Pubblicare su GitHub Pages

1. Pusha questo repository su GitHub.
2. **Settings → Pages** → Source: branch `main`, cartella `/ (root)`.
3. Salva. Il sito sarà disponibile su `https://<utente>.github.io/<repo>/`.

Il file `.nojekyll` evita la pipeline Jekyll.
