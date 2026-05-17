export default {
  title: 'Casual Kids Games',
  langLabel: 'Lingua',
  menu: {
    backToMenu: '← Menu',
    pickAGame: 'Scegli un gioco'
  },
  tabs: { tris: 'Tris', imp: 'Impiccato', anagram: 'Anagrammi', memory: 'Memory', t2048: '2048', p15: 'Gioco del 15' },
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
  }
};
