export default {
  title: 'Casual Kids Games',
  langLabel: 'Language',
  menu: {
    backToMenu: '← Menu',
    pickAGame: 'Pick a game'
  },
  legal: {
    privacyLink: 'Privacy & Cookies',
    manageConsent: 'Manage cookie preferences',
    privacyPageTitle: 'Privacy Policy & Cookie Policy',
    cmpUnavailable: 'The consent management system is not loaded yet. Try again in a few seconds or reload the page.'
  },
  tabs: { tris: 'Noughts & Crosses', imp: 'Hangman', anagram: 'Anagrams', memory: 'Memory', t2048: '2048', p15: '15 Puzzle', mastermind: 'Mastermind' },
  tris: {
    subtitle: 'Newell & Simon strategy — the AI never loses',
    btnHumanFirst: 'I start', btnAiFirst: 'AI starts', btnReset: 'New game',
    yourTurn: m => `Your turn (${m})`, aiThinking: 'AI is thinking…',
    draw: 'Draw.', youWon: 'You won! Really?', aiWon: 'The AI won.',
    scoreYou: 'You', scoreDraws: 'Draws', scoreAi: 'AI',
    footer: 'The best you can do is draw.'
  },
  imp: {
    subtitle: 'Guess the word before getting hanged', btnNew: 'New word',
    guess: 'Guess a letter',
    won: w => `Well done! The word was ${w}.`,
    lost: w => `Hanged. The word was ${w}.`,
    statWins: 'Wins', statErrors: 'Errors', statLosses: 'Losses',
    footer: a => `${a} letters. 9 errors and you're done.`
  },
  anagram: {
    subtitle: 'Unscramble the letters', btnNew: 'New word', btnClear: 'Clear',
    guess: 'Build the word',
    correct: w => `Brilliant! It was ${w}.`, wrong: "That's not it.",
    statWins: 'Solved', statLosses: 'Skipped', statBest: 'Best',
    footer: 'Click letters to place them.'
  },
  memory: {
    subtitle: 'Find all the pairs', btnNew: 'New game', play: 'Find the pairs',
    won: m => `Done in ${m} moves!`,
    statMoves: 'Moves', statPairs: 'Pairs', statBest: 'Best',
    footer: '8 pairs to find. Fewer moves is better.'
  },
  t2048: {
    subtitle: 'Merge tiles to reach 2048', btnNew: 'New game',
    play: 'Arrow keys or swipe', won: 'You reached 2048!', lost: 'No more moves.',
    statScore: 'Score', statBest: 'Best', statMax: 'Max',
    footer: 'Arrow keys ↑↓←→ or swipe.'
  },
  p15: {
    subtitle: 'Arrange the tiles 1 to 15 in order',
    btnNew: 'Shuffle',
    play: 'Slide the tiles',
    won: (m, t) => `Solved in ${m} moves (${t})!`,
    statMoves: 'Moves', statTime: 'Time', statBest: 'Best',
    footer: 'Click a tile next to the gap.'
  },
  mastermind: {
    subtitle: 'Guess the secret colour sequence',
    btnNew: 'New game',
    btnCheck: 'Check',
    btnClear: 'Clear',
    play: 'Build the sequence',
    won: n => `Solved in ${n} tries!`,
    lost: 'Out of tries. Here is the answer.',
    pegExact: 'Black = right colour, right spot',
    pegNear: 'White = right colour, wrong spot',
    statWins: 'Wins', statLosses: 'Losses', statBest: 'Best',
    footer: '4 colours from 6, 10 tries. Colours can repeat.'
  }
};
