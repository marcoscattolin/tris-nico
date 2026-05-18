# Configurazione GTM — guida operativa

Questo documento descrive come configurare il container Google Tag Manager
**`GTM-KSS8BN6Q`** per gestire Google Analytics 4 e Google AdSense del sito
`casualkidsgames.netlify.app`.

> **Nota terminologica.** "Google Ads" può indicare due cose diverse:
> - **Google AdSense** — programma per *publisher* (chi pubblica un sito e
>   guadagna mostrando annunci). Publisher ID: `pub-1324858277403968`.
> - **Google Ads** (ex AdWords) — piattaforma per *inserzionisti* (chi paga
>   per far comparire annunci altrove). Si configura tramite tag di
>   conversione con un Conversion ID `AW-XXXXXXXX`.
>
> Su questo sito siamo *publisher*: la sezione "Google Ads" sotto si riferisce
> ad **AdSense**. Se in futuro userai anche Google Ads come inserzionista,
> aggiungi un tag separato — l'ultima sezione spiega come.

---

## Premesse architetturali

Lo stato attuale del codice:

- **Unico tag Google** caricato dalle pagine HTML: `shared/gtm.js` (in `<head>`,
  il più in alto possibile, + `<noscript>` iframe dopo `<body>`).
- **Consent Mode v2** è inizializzato in `shared/gtm.js` **prima** del caricamento
  del container GTM, con tutti e 4 i flag a `'denied'`:
  - `ad_storage`
  - `ad_user_data`
  - `ad_personalization`
  - `analytics_storage`
- **Nessun caricamento diretto** di `gtag/js`, `adsbygoogle.js` o Funding
  Choices nel codice: tutto avviene tramite tag configurati dentro GTM.
- Il footer di ogni pagina ha il pulsante "Gestisci preferenze cookie" che
  chiama `window.googlefc.showRevocationMessage()` — quindi Funding Choices
  deve essere caricato e disponibile come oggetto globale.

Tradotto: l'unico file di codice che cambia in caso di nuove integrazioni
Google è questo container GTM. Nessuna modifica al repository.

---

## Prerequisiti

1. Accesso al container GTM **`GTM-KSS8BN6Q`** con permessi *Edit + Publish*.
2. Accesso alla property GA4 **`G-MLTDK8KDVW`** (Admin → Data Streams).
3. Accesso all'account AdSense del publisher **`pub-1324858277403968`** con
   Funding Choices abilitato.

Da fare una sola volta nelle impostazioni del container:

- **Admin → Container Settings → Additional Settings → Consent Overview** →
  attiva *Enable consent overview* (mostra una colonna che evidenzia quali
  tag rispettano il Consent Mode).

---

## 1) Supporto Google Analytics (GA4)

### 1.1 Tag GA4 Configuration

| Campo | Valore |
| --- | --- |
| Tag type | **Google Tag** (ex *GA4 Configuration*) |
| Nome | `GA4 — Configuration` |
| Tag ID | `G-MLTDK8KDVW` |
| Configuration parameters | *(lasciare vuoto, nessun parametro custom)* |
| Trigger | **Initialization - All Pages** |

### 1.2 Consent Settings del tag

Apri **Advanced Settings → Consent Settings**:

- **Built-in consent checks**: lascia *Not set* (il tag Google Tag rispetta
  Consent Mode in automatico — quando `analytics_storage` è `denied` invia
  comunque ping anonimizzati grazie a Consent Mode, e si attiva pienamente
  appena diventa `granted`).
- **Additional consent checks**: non necessario. Consent Mode fa già la sua
  parte; aggiungere qui un check su `analytics_storage` bloccherebbe del tutto
  il tag in stato denied, perdendo i ping di modellazione (cookieless pings).

> Se vuoi un comportamento più strict (nessun ping finché l'utente non
> acconsente esplicitamente), in *Additional consent checks* seleziona
> *Require additional consent* e aggiungi `analytics_storage`. Ma sappi che
> perdi la **conversion modeling** di Google.

### 1.3 (Facoltativo) Eventi GA4 custom

Se più avanti vuoi tracciare eventi specifici (es. "partita vinta",
"lingua cambiata"), crea per ognuno un tag **Google Analytics: GA4 Event**:

| Campo | Esempio |
| --- | --- |
| Measurement ID | `G-MLTDK8KDVW` |
| Event Name | `game_won` |
| Event Parameters | `game_id` = `{{Game ID}}` (variabile da `dataLayer`) |
| Trigger | Custom Event matching `game_won` |

Il codice del gioco dovrà fare `window.dataLayer.push({ event: 'game_won', game_id: 'tris' })`.

### 1.4 Test

1. Click su **Preview** in GTM, inserisci `https://casualkidsgames.netlify.app/`.
2. Nel Tag Assistant verifica che `GA4 — Configuration` compaia sotto
   "Tags Fired" su ogni pagina.
3. In GA4 vai a *Reports → Realtime* e conferma che ti vedi.

---

## 2) Supporto Google AdSense (publisher)

AdSense richiede **due** cose distinte dentro GTM:

A. **Il CMP (Funding Choices)** che mostra il banner di consenso e aggiorna il
   Consent Mode quando l'utente sceglie.
B. **Lo script `adsbygoogle.js`** che effettivamente serve gli annunci sul
   sito.

### 2.1 Tag CMP Funding Choices

| Campo | Valore |
| --- | --- |
| Tag type | **Custom HTML** |
| Nome | `Funding Choices CMP` |
| Trigger | **Consent Initialization - All Pages** |
| Tag firing priority (Advanced) | `100` (alta, deve precedere gli altri tag) |
| Consent Settings | *No additional consent required* |

HTML del tag:

```html
<script>
(function () {
  var PUB_ID = 'pub-1324858277403968';
  var s = document.createElement('script');
  s.async = true;
  s.setAttribute('data-cfasync', 'false');
  s.src = 'https://fundingchoicesmessages.google.com/i/' + PUB_ID + '?ers=1';
  document.head.appendChild(s);

  (function signal() {
    if (window.frames['googlefcPresent']) return;
    if (!document.body) { setTimeout(signal, 0); return; }
    var iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:0;height:0;border:none;z-index:-1000;left:-1000px;top:-1000px;display:none;';
    iframe.name = 'googlefcPresent';
    document.body.appendChild(iframe);
  })();
})();
</script>
```

> Questo è esattamente lo snippet che prima era in `shared/cmp.js`. Lo carica
> async, espone `window.googlefc` (usato dal pulsante "Gestisci preferenze
> cookie" nel footer) e inietta l'iframe `googlefcPresent` richiesto da
> Funding Choices come heartbeat per la pagina.

Una volta caricato, **Funding Choices aggiorna automaticamente il Consent
Mode** chiamando `gtag('consent', 'update', { … })` in base alla scelta
dell'utente. Non serve scrivere codice di update manuale.

### 2.2 Tag AdSense (`adsbygoogle.js`)

| Campo | Valore |
| --- | --- |
| Tag type | **Custom HTML** |
| Nome | `AdSense — adsbygoogle.js` |
| Trigger | **All Pages** |
| Consent Settings | *Require additional consent* su `ad_storage` |

HTML del tag:

```html
<script async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1324858277403968"
  crossorigin="anonymous"></script>
```

> Con *Require additional consent* su `ad_storage`, lo script viene iniettato
> **solo dopo** che l'utente concede il consenso pubblicitario via Funding
> Choices. Finché `ad_storage` è `'denied'`, nessuna chiamata ad AdSense parte.

### 2.3 (Solo se usi annunci manuali) Slot `<ins class="adsbygoogle">`

Se vuoi posizionare slot pubblicitari specifici nelle pagine, ti servono due
cose:

1. **Nel codice del sito**, in punti specifici dove vuoi un annuncio:
   ```html
   <ins class="adsbygoogle"
        style="display:block"
        data-ad-client="ca-pub-1324858277403968"
        data-ad-slot="XXXXXXXXXX"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
   ```
2. **Un tag GTM** che esegua `(adsbygoogle = window.adsbygoogle || []).push({})`
   per ogni `<ins>` presente. Esempio (Custom HTML, trigger *DOM Ready*,
   consent on `ad_storage`):
   ```html
   <script>
     document.querySelectorAll('ins.adsbygoogle:not([data-adsbygoogle-status])')
       .forEach(function () { (window.adsbygoogle = window.adsbygoogle || []).push({}); });
   </script>
   ```

Se invece preferisci **Auto ads** (Google decide dove inserire gli annunci),
basta abilitarli nella dashboard AdSense — il tag `adsbygoogle.js` sopra è
già sufficiente, niente `<ins>` necessari.

### 2.4 Test

1. **Preview** GTM su `https://casualkidsgames.netlify.app/`.
2. Verifica nel Tag Assistant che fra i tag scattati ci siano `Funding
   Choices CMP` (subito) e che `AdSense — adsbygoogle.js` resti *blocked by
   consent* finché non clicchi "Accetta" sul banner.
3. Dopo "Accetta", ricarica e verifica che `AdSense — adsbygoogle.js` ora
   compaia sotto "Tags Fired".
4. In Chrome DevTools → Network filtra per `googlesyndication`: dopo il
   consenso deve apparire la richiesta a `adsbygoogle.js`.

---

## 3) (Eventuale futuro) Google Ads come inserzionista

Se un giorno comprerai traffico via Google Ads e vorrai tracciare le
conversioni, ti servirà un tag aggiuntivo:

| Campo | Valore |
| --- | --- |
| Tag type | **Google Ads Conversion Tracking** |
| Conversion ID | `AW-XXXXXXXX` (lo trovi nell'account Google Ads) |
| Conversion Label | `xxxxxxxxxxxxxx` |
| Trigger | l'evento che identifica la conversione (es. submit form, click CTA) |
| Consent Settings | Built-in checks (rispetta automaticamente `ad_storage` e `ad_user_data`) |

In più imposta una volta sola il tag **Google Ads Remarketing** se vuoi audience
di remarketing.

---

## 4) Pubblicazione

1. **Submit** in alto a destra in GTM.
2. Compila Version Name (es. `v1 — GA4 + AdSense via GTM`) e Description.
3. **Publish**.

Da questo momento le pagine live useranno la nuova configurazione **senza
modifiche al codice**: l'unico script Google sulle pagine resta `gtm.js`.

---

## 5) Diagnostica rapida

| Sintomo | Probabile causa |
| --- | --- |
| GA4 non vede nessun utente | `analytics_storage` resta `'denied'` (Funding Choices non si carica o l'utente non ha consenso) — controlla che il tag CMP scatti su *Consent Initialization* |
| Banner Funding Choices non appare | l'iframe `googlefcPresent` non è stato iniettato — verifica che il tag CMP esegua *prima* che venga renderizzato il body, o che il fallback `setTimeout` dello snippet sia presente |
| AdSense carica anche senza consenso | il tag AdSense non ha *Require additional consent* su `ad_storage` |
| Pulsante "Gestisci preferenze cookie" non funziona | `window.googlefc` non è disponibile — il tag CMP non è scattato; controlla i trigger |
| `dataLayer is undefined` in console | qualcosa carica prima di `gtm.js` — verifica che `<script src="…/shared/gtm.js">` sia il primissimo `<script>` nell'`<head>` |
