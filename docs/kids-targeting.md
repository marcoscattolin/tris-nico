# Configurare il sito come "directed to children" (COPPA / GDPR-K)

Questa guida elenca i passi operativi per dichiarare ufficialmente il sito come rivolto a bambini lato Google (AdSense, GTM, GA4) e adeguare il sito ai requisiti normativi.

> **Nota**: dichiarare il sito come *child-directed* forza Google a servire solo annunci **non personalizzati**. Aspettati un calo significativo di RPM (anche 60-80%), ma è obbligatorio per legge se il target reale è minori di 13 anni.

---

## 1. AdSense — Dichiarazione "directed to children"

1. Vai su <https://adsense.google.com> e accedi con l'account publisher.
2. Menu laterale → **Privacy & messaging** → **Tag for child-directed treatment (TFCD)**.
3. Aggiungi il sito (`casualkidsgames.com` o dominio corrente) e seleziona **"Directed to children"**.
   - Se solo alcune pagine sono per bambini, scegli **"Mixed audience"** e configura a livello pagina.
4. Salva. Da questo momento Google forza NPA (Non-Personalized Ads) sul traffico del sito.
5. Sulla stessa schermata, attiva anche **Tag for users under the age of consent (TFUA)** per traffico EEA/UK — applica le stesse restrizioni a minori europei sotto età di consenso GDPR.

**Verifica**: dopo ~24h, in *Reports* dovresti vedere il flag "Child-directed: Yes" sul sito.

---

## 2. Funding Choices (CMP)

Funding Choices è già integrato via GTM (publisher `pub-1324858277403968`). Per traffico child-directed:

1. Vai su <https://fundingchoices.google.com>.
2. Seleziona il sito → **Settings** → **GDPR message**.
3. Verifica che sia configurato con **"Reject all"** ben visibile (richiesto da GDPR-K per minori).
4. Sotto *Ad serving* conferma che il fallback sia **"Serve non-personalized ads"** anche quando l'utente accetta tutto (override forzato per child-directed).
5. Salva e ri-pubblica il messaggio.

Lato codice non serve toccare nulla: `shared/gtm.js` già imposta tutti i consensi a `denied` di default, Funding Choices gestisce l'update via Consent Mode v2.

---

## 3. Google Analytics 4 (GA4)

GA4 raccoglie dati comportamentali — va limitata per COPPA.

1. Vai su <https://analytics.google.com> → property `G-MLTDK8KDVW`.
2. **Admin → Data Settings → Data Collection**:
   - Disattiva **Google Signals data collection**.
   - Disattiva **Granular location and device data collection**.
3. **Admin → Data Settings → Data Retention**: imposta a **2 mesi** (minimo).
4. **Admin → Account Settings → Account Data Sharing**: deseleziona tutte le condivisioni opzionali (Google products & services, benchmarking, technical support, account specialists).
5. Conferma in **Admin → Property Settings** che la property abbia **"Allow advertising features" = OFF**.

---

## 4. Google Search Console

1. Vai su <https://search.google.com/search-console>.
2. Seleziona la proprietà del sito.
3. Non c'è un flag esplicito "kids", ma assicurati che:
   - Nessun annuncio AdSense personalizzato venga indicizzato (già gestito al punto 1).
   - Il sito non sia in categorie *adult* o *gambling* (verifica in *Manual actions*).

---

## 5. Aggiornamenti al sito (codice)

### 5.1 Meta tag globali
Aggiungere ai `<head>` di tutte le pagine HTML (`index.html`, `games/*/index.html`, `legal/privacy/index.html`):

```html
<meta name="rating" content="general">
<meta name="audience" content="children">
```

### 5.2 Privacy Policy
Aggiornare `legal/privacy/index.html` con sezioni:

- **Target del sito**: dichiarazione esplicita che il sito è rivolto a bambini sotto i 13 anni.
- **COPPA compliance** (utenti USA): cosa raccogliamo, cosa NON raccogliamo (no profilazione, no remarketing, no dati personali identificativi).
- **GDPR-K** (utenti EU): base giuridica per il trattamento dei dati di minori, riferimento all'età di consenso (13-16 anni a seconda dello stato membro).
- **Contatto genitore**: email per richieste di accesso/cancellazione dati esercitate dal genitore o tutore.
- **Cookie**: elenco aggiornato — solo cookie tecnici, no advertising cookies persistenti.

### 5.3 (Opzionale) Disabilita link a piattaforme social
Se nel sito ci sono share-button o link a YouTube/Facebook/Instagram, valutare la rimozione: questi servizi raccolgono dati e non sono COPPA-compliant per default.

---

## 6. Documentazione obbligatoria da conservare

Conservare offline (Drive, cartella `compliance/`):

- Screenshot della configurazione AdSense con TFCD/TFUA attivi.
- Screenshot impostazioni GA4 con Google Signals OFF.
- Versione datata della Privacy Policy pubblicata.
- Eventuali richieste di cancellazione dati ricevute dai genitori (log con data, email, esito).

Il **Federal Trade Commission (FTC)** può richiedere queste evidenze in caso di audit COPPA.

---

## 7. Checklist finale

Prima di considerare il sito "kids-ready":

- [ ] AdSense → TFCD attivo
- [ ] AdSense → TFUA attivo (per EEA)
- [ ] Funding Choices → messaggio GDPR con "Reject all" visibile
- [ ] GA4 → Google Signals OFF
- [ ] GA4 → Granular location OFF
- [ ] GA4 → Data retention = 2 mesi
- [ ] Meta tag `rating` e `audience` aggiunti a tutte le pagine
- [ ] Privacy Policy aggiornata con sezioni COPPA + GDPR-K
- [ ] Email di contatto per richieste genitori pubblicata
- [ ] Rimossi/auditati eventuali widget social/tracking di terze parti
- [ ] Backup screenshot di tutte le configurazioni

---

## Riferimenti

- COPPA (FTC): <https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy>
- GDPR-K (EDPB Guidelines on children's data): <https://edpb.europa.eu/>
- Google AdSense — Ad serving to children: <https://support.google.com/adsense/answer/10502938>
- Google TFCD/TFUA documentation: <https://support.google.com/admanager/answer/3671211>
- Consent Mode v2: <https://support.google.com/analytics/answer/9976101>
