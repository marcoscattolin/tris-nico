import { T, onLanguageChange } from '../../shared/i18n.js';
import { changeBackground } from '../../shared/backgrounds.js';

const EMOJIS = ['🐶','🐱','🦊','🐯','🐻','🐼','🦁','🐰'];
const stats = { moves: 0, pairs: 0, best: null };
let cards = [], flipped = [], matched = new Set(), busy = false, gameOver = false;
let autoRestartTimer = null;

let subtitleEl, statusEl, boardEl, movesEl, pairsEl, bestEl, btnNew;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function renderBoard() {
  boardEl.innerHTML = '';
  cards.forEach((emoji, idx) => {
    const btn = document.createElement('button');
    btn.className = 'memory-card';
    btn.dataset.i = idx;
    btn.textContent = emoji;
    if (flipped.includes(idx) || matched.has(idx)) btn.classList.add('flipped');
    if (matched.has(idx)) { btn.classList.add('matched'); btn.disabled = true; }
    btn.addEventListener('click', () => flip(idx));
    boardEl.appendChild(btn);
  });
}

function flip(idx) {
  if (busy || gameOver) return;
  if (flipped.includes(idx) || matched.has(idx)) return;
  if (flipped.length >= 2) return;
  flipped.push(idx);
  renderBoard();
  if (flipped.length === 2) {
    stats.moves++;
    movesEl.textContent = stats.moves;
    const [a, b] = flipped;
    if (cards[a] === cards[b]) {
      matched.add(a); matched.add(b);
      flipped = [];
      stats.pairs++;
      pairsEl.textContent = `${stats.pairs}/8`;
      renderBoard();
      if (stats.pairs === 8) endGame();
    } else {
      busy = true;
      setTimeout(() => {
        flipped = [];
        busy = false;
        renderBoard();
      }, 700);
    }
  }
}

function endGame() {
  gameOver = true;
  statusEl.textContent = T().memory.won(stats.moves);
  statusEl.className = 'status win';
  if (stats.best === null || stats.moves < stats.best) {
    stats.best = stats.moves;
    localStorage.setItem('memory-best', stats.best);
    bestEl.textContent = stats.best;
  }
  autoRestartTimer = setTimeout(() => { autoRestartTimer = null; startRound(); }, 1500);
}

function startRound() {
  if (autoRestartTimer !== null) { clearTimeout(autoRestartTimer); autoRestartTimer = null; }
  cards = shuffle([...EMOJIS, ...EMOJIS]);
  flipped = [];
  matched = new Set();
  stats.moves = 0;
  stats.pairs = 0;
  busy = false;
  gameOver = false;
  changeBackground();
  statusEl.textContent = T().memory.play;
  statusEl.className = 'status';
  movesEl.textContent = 0;
  pairsEl.textContent = '0/8';
  const stored = localStorage.getItem('memory-best');
  stats.best = stored ? parseInt(stored, 10) : null;
  bestEl.textContent = stats.best ?? '–';
  renderBoard();
}

function refreshText() {
  const t = T().memory;
  subtitleEl.textContent = t.subtitle;
  btnNew.textContent = t.btnNew;
  document.getElementById('lbl-mem-moves').textContent = t.statMoves;
  document.getElementById('lbl-mem-pairs').textContent = t.statPairs;
  document.getElementById('lbl-mem-best').textContent = t.statBest;
  document.getElementById('mem-footer').textContent = t.footer;
  if (!gameOver) statusEl.textContent = t.play;
}

function resetStats() {
  stats.moves = 0;
  stats.pairs = 0;
  movesEl.textContent = 0;
  pairsEl.textContent = '0/8';
}

function init() {
  subtitleEl = document.getElementById('mem-subtitle');
  statusEl = document.getElementById('mem-status');
  boardEl = document.getElementById('mem-board');
  movesEl = document.getElementById('mem-moves');
  pairsEl = document.getElementById('mem-pairs');
  bestEl = document.getElementById('mem-best');
  btnNew = document.getElementById('mem-new');

  btnNew.addEventListener('click', () => startRound());

  onLanguageChange(() => {
    resetStats();
    refreshText();
  });

  startRound();
}

export default { init, refreshText, resetStats };
