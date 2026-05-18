# Monetizzazione del sito: SEO base + attivazione AdSense Auto Ads

Guida step-by-step per monetizzare il sito tramite Google AdSense, partendo dalle fondamenta SEO necessarie a generare traffico indicizzabile.

**Stato infrastruttura attuale:**
- GTM (`GTM-KSS8BN6Q`) integrato in tutte le pagine via `shared/gtm.js`
- AdSense publisher `pub-1324858277403968` configurato in `ads.txt`
- Consent Mode v2 con default `denied` su tutti i flag
- Funding Choices CMP gestito tramite tag GTM
- GA4 (`G-MLTDK8KDVW`) configurato

**Cosa manca per monetizzare:**
- SEO foundations (sitemap, robots, meta tag, canonical, OpenGraph)
- Attivazione Auto Ads in console AdSense
- Submission del sito a Google Search Console

**Parametri di riferimento:**
- Dominio target: `https://casualkidsgames.netlify.app`
- Strategia ads: solo Auto Ads (no ad unit manuali in fase 1)
- Meta description: hardcoded in italiano nell'HTML (no i18n)

---

## Fase A — Modifiche al codice (SEO foundations)

### A.1. Creare `robots.txt` in root

Nuovo file `robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://casualkidsgames.netlify.app/sitemap.xml
```

### A.2. Creare `sitemap.xml` in root

Nuovo file con tutte le 10 URL del sito (landing + 8 giochi + privacy). Riferimento: `shared/registry.js` per la lista slug aggiornata (`tris`, `impiccato`, `anagrammi`, `memory`, `t2048`, `p15`, `mastermind`, `lightsout`).

Formato standard XML sitemap con `<loc>`, `<lastmod>`, `<changefreq>monthly</changefreq>`, `<priority>` (1.0 per landing, 0.8 per giochi, 0.3 per privacy).

Esempio struttura:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://casualkidsgames.netlify.app/</loc>
    <lastmod>2026-05-18</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://casualkidsgames.netlify.app/games/tris/</loc>
    <lastmod>2026-05-18</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- ...altri giochi... -->
  <url>
    <loc>https://casualkidsgames.netlify.app/legal/privacy/</loc>
    <lastmod>2026-05-18</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
```

### A.3. Meta tag SEO in ogni pagina HTML

Aggiungere nel `<head>` di tutte le 10 pagine (`index.html`, 8 game pages, `legal/privacy/index.html`):

```html
<meta name="description" content="<descrizione specifica della pagina>" />
<link rel="canonical" href="https://casualkidsgames.netlify.app/<path>/" />
<meta property="og:title" content="<title>" />
<meta property="og:description" content="<descrizione>" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://casualkidsgames.netlify.app/<path>/" />
<meta property="og:site_name" content="Casual Games" />
<meta name="twitter:card" content="summary" />
```

Descrizioni hardcoded in italiano, una per pagina. Esempi:

| Pagina | Descrizione |
|--------|-------------|
| Landing | "Raccolta di giochi casual gratuiti da giocare nel browser: Tris, Memory, 2048, Impiccato, Anagrammi e altro. Nessun download, nessuna registrazione." |
| Tris | "Gioca a Tris (Tic Tac Toe) online contro un'IA imbattibile. Gratis, senza registrazione, nel browser." |
| Impiccato | "Gioca all'Impiccato (Hangman) online in italiano e inglese. Indovina la parola prima di esaurire i tentativi." |
| Anagrammi | "Risolvi anagrammi online: rimetti in ordine le lettere per scoprire la parola. Gioco gratuito di parole." |
| Memory | "Memory online: trova le coppie di animali nel minor numero di mosse possibile. Gioco gratuito nel browser." |
| 2048 | "2048 online: unisci le tessere per arrivare al 2048. Versione classica del gioco di numeri." |
| P15 | "Gioco del 15 online: rimetti in ordine le tessere nel minor numero di mosse. Puzzle classico." |
| Mastermind | "Mastermind online: indovina la combinazione di colori. Gioco di logica classico." |
| Lights Out | "Lights Out online: spegni tutte le luci della griglia. Puzzle di logica nel browser." |
| Privacy | "Informativa privacy e cookie policy di Casual Games." |

### A.4. Migliorare i `<title>` delle pagine

I title attuali sono troppo generici per la SEO. Aggiornare:

| Pagina | Title attuale | Title nuovo |
|--------|--------------|-------------|
| `index.html` | Giochi | Casual Games — Giochi gratis nel browser |
| `games/tris/` | Tris | Tris online gratis — Casual Games |
| `games/impiccato/` | Impiccato | Impiccato online gratis — Casual Games |
| `games/anagrammi/` | Anagrammi | Anagrammi online gratis — Casual Games |
| `games/memory/` | Memory | Memory online gratis — Casual Games |
| `games/t2048/` | 2048 | 2048 online gratis — Casual Games |
| `games/p15/` | Gioco del 15 | Gioco del 15 online gratis — Casual Games |
| `games/mastermind/` | Mastermind | Mastermind online gratis — Casual Games |
| `games/lightsout/` | Lights Out | Lights Out online gratis — Casual Games |
| `legal/privacy/` | Privacy & Cookie Policy | (invariato) |

### A.5. OG image (opzionale, posticipabile)

Aggiungere un'immagine `/og-image.png` (1200×630) e referenziarla con:

```html
<meta property="og:image" content="https://casualkidsgames.netlify.app/og-image.png" />
```

Per ora omettere — i social sharing useranno solo titolo + descrizione.

### File da modificare/creare

- **Nuovi**: `robots.txt`, `sitemap.xml`
- **Modificati**: `index.html`, `games/tris/index.html`, `games/impiccato/index.html`, `games/anagrammi/index.html`, `games/memory/index.html`, `games/t2048/index.html`, `games/p15/index.html`, `games/mastermind/index.html`, `games/lightsout/index.html`, `legal/privacy/index.html` (solo `<head>`)

---

## Fase B — Azioni operative (console Google)

Queste **non** sono modifiche al codice — sono passi da eseguire manualmente nelle console.

### B.1. Approvazione AdSense

1. Vai su <https://adsense.google.com> → *Sites* → conferma che `casualkidsgames.netlify.app` sia listato come "Ready" / "Approved".
2. Se non lo è: avvia il processo di richiesta. Google fa review (1-14 giorni).
3. Requisiti già soddisfatti:
   - ✓ Contenuto originale (giochi proprietari)
   - ✓ Privacy Policy (`legal/privacy/`)
   - ✓ Navigazione chiara (landing + game pages)
   - ✓ HTTPS (Netlify lo gestisce nativamente)

### B.2. Attivazione Auto Ads

1. AdSense → *Ads* → *By site* → seleziona il dominio → *Edit*.
2. Attiva **Auto ads** (toggle on).
3. In *Ad formats* abilita almeno: **Anchor**, **Vignette**, **In-page**.
4. Disattiva **Multiplex** per ora (è invasivo sui game sites).
5. *Ad load*: parti basso (~50%) per non degradare UX, poi alza in base ai dati di engagement.
6. Salva. Auto Ads inizia a servire entro ~30 minuti.

### B.3. Google Search Console

1. Vai su <https://search.google.com/search-console> → *Add property* → URL: `https://casualkidsgames.netlify.app`.
2. Verifica tramite tag HTML: copia il token che Google ti fornisce e aggiungilo al `<head>` di `index.html`:

   ```html
   <meta name="google-site-verification" content="<token>" />
   ```

   In alternativa: verifica via DNS aggiungendo un record TXT su Netlify DNS.
3. Una volta verificato: *Sitemaps* → submit `https://casualkidsgames.netlify.app/sitemap.xml`.
4. Verifica indicizzazione in *Pages* dopo 24-72h.
5. Monitora *Performance* nelle settimane successive per identificare query e CTR.

### B.4. (Opzionale) Bing Webmaster Tools

Stesso processo su <https://www.bing.com/webmasters> per indicizzazione Bing/DuckDuckGo. Bing copre ~5-10% del traffico ma è facile da abilitare (puoi importare direttamente da Search Console).

---

## Fase C — Verifica end-to-end

### Test locale

Avvia il server locale:

```bash
python -m http.server 8000
```

Verifica nel DOM `<head>` di ogni pagina:
- `<title>` aggiornato
- `<meta name="description">` presente con testo corretto
- `<link rel="canonical">` con URL assoluto corretto
- OG tags presenti (`og:title`, `og:description`, `og:url`, `og:type`, `og:site_name`)
- `<meta name="twitter:card">` presente

Apri `http://localhost:8000/sitemap.xml` e verifica XML valido (no errori parser browser).

Apri `http://localhost:8000/robots.txt` e verifica che linki la sitemap corretta.

### Test post-deploy

1. Submit sitemap su Google Search Console e verifica "Success" (non "Error").
2. Usa <https://search.google.com/test/rich-results> per testare il rendering OG/SEO di ogni URL.
3. Verifica con <https://www.google.com/webmasters/markup-tester/> che `robots.txt` sia parseable.
4. Apri il sito da Chrome incognito → DevTools → *Network*: dopo aver dato consenso nel banner Funding Choices, verifica che lo script `adsbygoogle.js` venga caricato.
5. Usa <https://pagespeed.web.dev/> per testare Core Web Vitals dopo aver attivato Auto Ads (gli ads possono degradare CLS/LCP).

### Verifica AdSense

Dopo 24-48h di Auto Ads attivo, verifica in console AdSense → *Reports*:
- Impression registrate
- Click registrati
- CTR e RPM iniziali
- Eventuali warning di policy o ads.txt

---

## Cosa NON è incluso (azioni future)

- **Ad unit manuali** con posizionamento specifico (es. banner sopra il gioco). Richiede creare ad unit in AdSense e inserire `<ins class="adsbygoogle">` nelle pagine.
- **OG image custom** (1200×630 con branding del sito).
- **Traduzione meta description in EN** (richiede integrare i meta tag con il bundle i18n).
- **Schema.org markup** (`WebSite`, `VideoGame`, `BreadcrumbList`) per rich snippets nelle SERP.
- **Strategie di acquisizione traffico**: social, backlinks, content marketing, SEO long-tail.
- **Piattaforme alternative ad AdSense** (Ezoic, Mediavine, AdThrive) — richiedono soglia minima di traffico (10k-50k sessions/mese) ma RPM 2-4x superiore.
- **A/B test sulle posizioni Auto Ads** una volta accumulati dati di engagement.

Tutte attivabili in step successivi una volta che il sito ha traffico misurabile (almeno qualche centinaio di sessioni/giorno).

---

## Note operative

- **Compliance**: il setup attuale è già GDPR-compliant grazie a Consent Mode + Funding Choices. Non serve aggiungere nulla per il traffico EEA/UK.
- **Click sui propri annunci**: ban immediato e permanente di AdSense. Mai cliccare i propri ads, neanche per test. Usa la modalità "Ad preview tool" in AdSense per verificare rendering senza generare click reali.
- **Aspettative realistiche**: un game site con 10k pageview/mese e Auto Ads attivo paga ~$10-30/mese. Per fare reddito serio servono almeno 100k+ pageview/mese.
- **Priorità**: SEO è il vero collo di bottiglia. Senza indicizzazione e traffico, AdSense paga $0. La Fase A va eseguita prima della Fase B.
