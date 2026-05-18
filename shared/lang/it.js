export default {
  title: 'Casual Games',
  langLabel: 'Lingua',
  menu: {
    backToMenu: '← Menu',
    pickAGame: 'Scegli un gioco'
  },
  legal: {
    privacyLink: 'Privacy & Cookie',
    manageConsent: 'Gestisci preferenze cookie',
    privacyPageTitle: 'Privacy Policy & Cookie Policy',
    cmpUnavailable: 'Il sistema di gestione consensi non è ancora caricato. Riprova tra qualche secondo o ricarica la pagina.'
  },
  tabs: { tris: 'Tris', imp: 'Impiccato', anagram: 'Anagrammi', memory: 'Memory', t2048: '2048', p15: 'Gioco del 15', mastermind: 'Mastermind', lightsout: 'Lights Out', t24: 'Gioco del 24', nonogram: 'Nonogram', snake: 'Snake', wordladder: 'Word Ladder', ops: 'Operatori mancanti', tabelline: 'Tabelline 2048' },
  tris: {
    subtitle: "Strategia Newell & Simon — l'IA non perde mai",
    btnHumanFirst: 'Inizio io',
    btnAiFirst: "Inizia l'IA",
    btnReset: 'Nuova partita',
    yourTurn: m => `Tocca a te (${m})`,
    aiThinking: "L'IA pensa…",
    draw: 'Patta.',
    youWon: 'Hai vinto! Davvero?',
    aiWon: "Ha vinto l'IA.",
    scoreYou: 'Tu', scoreDraws: 'Patte', scoreAi: 'IA',
    footer: 'Il meglio che puoi fare è pareggiare.'
  },
  imp: {
    subtitle: 'Indovina la parola prima di farti impiccare',
    btnNew: 'Nuova parola',
    guess: 'Indovina una lettera',
    won: w => `Bravo! La parola era ${w}.`,
    lost: w => `Impiccato. La parola era ${w}.`,
    statWins: 'Vittorie', statErrors: 'Errori', statLosses: 'Sconfitte',
    footer: a => `${a} lettere. 9 errori e sei spacciato.`
  },
  anagram: {
    subtitle: 'Rimetti in ordine le lettere',
    btnNew: 'Nuova parola',
    btnClear: 'Cancella',
    guess: 'Componi la parola',
    correct: w => `Bravo! Era ${w}.`,
    wrong: 'Non è esatta.',
    statWins: 'Indovinate', statLosses: 'Saltate', statBest: 'Record',
    footer: 'Click per posizionare le lettere.'
  },
  memory: {
    subtitle: 'Trova tutte le coppie',
    btnNew: 'Nuova partita',
    play: 'Trova le coppie',
    won: m => `Completato in ${m} mosse!`,
    statMoves: 'Mosse', statPairs: 'Coppie', statBest: 'Record',
    footer: '8 coppie da trovare. Meno mosse, meglio è.'
  },
  t2048: {
    subtitle: 'Unisci le tessere fino a 2048',
    btnNew: 'Nuovo gioco',
    play: 'Frecce o swipe',
    won: 'Hai raggiunto 2048!',
    lost: 'Niente più mosse.',
    statScore: 'Punteggio', statBest: 'Record', statMax: 'Max',
    footer: 'Frecce ↑↓←→ o swipe.'
  },
  p15: {
    subtitle: 'Sistema le tessere da 1 a 15 in ordine',
    btnNew: 'Mescola',
    play: 'Muovi le tessere',
    won: (m, t) => `Risolto in ${m} mosse (${t})!`,
    statMoves: 'Mosse', statTime: 'Tempo', statBest: 'Record',
    footer: 'Clicca una tessera adiacente al vuoto.'
  },
  mastermind: {
    subtitle: 'Indovina la sequenza di colori',
    btnNew: 'Nuova partita',
    btnCheck: 'Verifica',
    btnClear: 'Cancella',
    play: 'Componi la sequenza',
    won: n => `Indovinato in ${n} tentativi!`,
    lost: 'Tentativi esauriti. Eccoti la soluzione.',
    pegExact: 'Nero = colore giusto, posto giusto',
    pegNear: 'Bianco = colore giusto, posto sbagliato',
    statWins: 'Vittorie', statLosses: 'Sconfitte', statBest: 'Record',
    footer: '4 colori su 6 disponibili, 10 tentativi. I colori possono ripetersi.'
  },
  lightsout: {
    subtitle: 'Spegni tutte le luci',
    btnNew: 'Nuova partita',
    play: 'Clicca per cambiare',
    won: (m, t) => `Risolto in ${m} mosse (${t})!`,
    statMoves: 'Mosse', statTime: 'Tempo', statBest: 'Record',
    footer: 'Clicca una luce: cambia anche le 4 adiacenti.'
  },
  t24: {
    subtitle: 'Combina i 4 numeri per ottenere 24',
    btnNew: 'Nuova partita',
    btnUndo: 'Annulla',
    btnReset: 'Reset',
    play: 'Tocca un numero, un operatore e un altro numero',
    won: 'Esatto! Hai fatto 24!',
    notYet: v => `Hai ottenuto ${v}, non 24.`,
    divByZero: 'Non puoi dividere per zero.',
    statWins: 'Vittorie', statLosses: 'Saltate', statBest: 'Record',
    footer: 'Usa tutti e 4 i numeri con + − × ÷ per arrivare a 24.'
  },
  nonogram: {
    subtitle: "Riempi le celle e scopri l'immagine",
    btnNew: 'Nuova partita',
    btnFill: '● Riempi',
    btnMark: '× Marca',
    play: 'I numeri ai bordi sono i blocchi consecutivi da riempire',
    won: (m, t) => `Risolto in ${m} mosse (${t})!`,
    statMoves: 'Mosse', statTime: 'Tempo', statBest: 'Record',
    footer: 'Click sinistro applica lo strumento; click destro applica l\'altro.'
  },
  snake: {
    subtitle: 'Mangia il cibo e cresci senza colpire muri o te stesso',
    btnNew: 'Nuova partita',
    btnPause: 'Pausa',
    btnResume: 'Riprendi',
    play: 'Frecce o WASD per muovere; swipe su touch',
    ready: 'Premi una freccia (o swipe) per iniziare',
    paused: 'In pausa',
    won: s => `Hai riempito la griglia! (${s} punti)`,
    lost: s => `Game over. Punteggio: ${s}.`,
    statScore: 'Punteggio', statTime: 'Tempo', statBest: 'Record',
    footer: 'Frecce o WASD per muovere, Spazio per la pausa.'
  },
  tabelline: {
    subtitle: 'Il 2048 delle tabelline — unisci due tessere uguali per salire di +1',
    btnNew: 'Nuova partita',
    play: n => `Tabellina del ${n}: frecce o swipe per unire le tessere`,
    won: (n, k, v) => `Bravo! Hai raggiunto ${n}×${k} = ${v}.`,
    lost: 'Niente più mosse.',
    statScore: 'Punteggio', statBest: 'Record', statMax: 'Max',
    footer: 'Due tessere uguali si fondono nel multiplo successivo (N×k + N×k → N×(k+1)). Goal: arrivare a N×10.'
  },
  ops: {
    subtitle: 'Inserisci gli operatori giusti per raggiungere il target',
    btnClear: 'Cancella',
    btnNew: 'Nuova partita',
    play: 'Tocca uno slot ? e scegli un operatore',
    won: seq => `Esatto! ${seq} funziona.`,
    notYet: v => `Risultato ${v}, non è il target.`,
    divByZero: 'La divisione non dà un intero. Riprova.',
    statWins: 'Vittorie', statLosses: 'Saltate', statBest: 'Record streak',
    footer: 'Precedenza standard: × e ÷ prima di + e −. Le divisioni devono dare numeri interi.'
  },
  wordladder: {
    subtitle: "Trasforma una parola nell'altra cambiando una lettera alla volta",
    btnSubmit: 'Invia',
    btnUndo: 'Annulla',
    btnNew: 'Nuova partita',
    play: 'Scrivi la prossima parola e premi Invio',
    inputPlaceholder: '4 lettere',
    minSteps: n => `Soluzione minima: ${n} passi`,
    usedSteps: n => `usati: ${n}`,
    errLen: n => `Servono esattamente ${n} lettere`,
    errAlphabet: 'Lettere non valide per questa lingua',
    errSame: 'È la stessa parola',
    errRepeat: 'Parola già usata in questa scalata',
    errOneLetter: 'Devi cambiare esattamente UNA lettera',
    errNotInDict: 'Parola non riconosciuta',
    won: n => `Bravo! Ce l'hai fatta in ${n} passi.`,
    statWins: 'Vittorie', statLosses: 'Saltate', statBest: 'Record streak',
    footer: 'Ogni passo cambia una sola lettera e deve essere una parola valida.'
  }
};
