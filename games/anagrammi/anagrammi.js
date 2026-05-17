import { currentLang, T, onLanguageChange } from '../../shared/i18n.js';
import { WORDS } from '../../shared/words.js';
import { changeBackground } from '../../shared/backgrounds.js';

const stats = { wins: 0, losses: 0, streak: 0, best: 0 };
let currentWord = '', placedTileIdx = [], tilesUsed = [];
let autoRestartTimer = null, lastWord = '', gameOver = false;

let subtitleEl, statusEl, slotsEl, tilesEl, winsEl, lossesEl, bestEl, btnNew, btnClear;

function pickWord() {
  const pool = WORDS[currentLang] || WORDS.it;
  let w;
  do {
    w = pool[Math.floor(Math.random() * pool.length)];
  } while ((w === lastWord || w.length < 4) && pool.length > 1);
  lastWord = w;
  return w.toUpperCase();
}

function scramble(word) {
  const letters = [...word];
  for (let attempt = 0; attempt < 20; attempt++) {
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    if (letters.join('') !== word) return letters;
  }
  return letters;
}

function renderSlots() {
  slotsEl.innerHTML = '';
  slotsEl.classList.remove('wrong', 'correct');
  for (let i = 0; i < currentWord.length; i++) {
    const slot = document.createElement('div');
    slot.className = 'anagram-slot';
    if (placedTileIdx[i] !== undefined) {
      slot.textContent = tilesUsed[placedTileIdx[i]].letter;
      slot.classList.add('filled');
      slot.addEventListener('click', () => removeFromSlot(i));
    }
    slotsEl.appendChild(slot);
  }
}

function renderTiles() {
  tilesEl.innerHTML = '';
  tilesUsed.forEach((tile, idx) => {
    const btn = document.createElement('button');
    btn.className = 'anagram-tile';
    btn.textContent = tile.letter;
    btn.disabled = tile.used;
    btn.addEventListener('click', () => placeTile(idx));
    tilesEl.appendChild(btn);
  });
}

function placeTile(idx) {
  if (gameOver) return;
  if (tilesUsed[idx].used) return;
  const nextSlot = placedTileIdx.findIndex(v => v === undefined);
  const targetSlot = nextSlot === -1 ? placedTileIdx.length : nextSlot;
  if (targetSlot >= currentWord.length) return;
  placedTileIdx[targetSlot] = idx;
  tilesUsed[idx].used = true;
  renderSlots();
  renderTiles();
  if (placedTileIdx.filter(v => v !== undefined).length === currentWord.length) verify();
}

function removeFromSlot(i) {
  if (gameOver) return;
  const tileIdx = placedTileIdx[i];
  if (tileIdx === undefined) return;
  tilesUsed[tileIdx].used = false;
  placedTileIdx[i] = undefined;
  slotsEl.classList.remove('wrong');
  renderSlots();
  renderTiles();
}

function verify() {
  const guess = placedTileIdx.map(idx => tilesUsed[idx].letter).join('');
  if (guess === currentWord) {
    gameOver = true;
    slotsEl.classList.add('correct');
    statusEl.textContent = T().anagram.correct(currentWord);
    statusEl.className = 'status win';
    stats.wins++;
    stats.streak++;
    if (stats.streak > stats.best) {
      stats.best = stats.streak;
      localStorage.setItem('anagram-best-' + currentLang, stats.best);
    }
    winsEl.textContent = stats.wins;
    bestEl.textContent = stats.best;
    autoRestartTimer = setTimeout(() => { autoRestartTimer = null; startRound(); }, 1000);
  } else {
    slotsEl.classList.add('wrong');
    statusEl.textContent = T().anagram.wrong;
    statusEl.className = 'status lose';
    setTimeout(() => {
      if (gameOver) return;
      clearSlots();
      statusEl.textContent = T().anagram.guess;
      statusEl.className = 'status';
    }, 700);
  }
}

function clearSlots() {
  placedTileIdx = new Array(currentWord.length).fill(undefined);
  tilesUsed.forEach(t => t.used = false);
  slotsEl.classList.remove('wrong', 'correct');
  renderSlots();
  renderTiles();
}

function skip() {
  if (gameOver) return;
  stats.streak = 0;
  stats.losses++;
  lossesEl.textContent = stats.losses;
  startRound();
}

function startRound() {
  if (autoRestartTimer !== null) { clearTimeout(autoRestartTimer); autoRestartTimer = null; }
  currentWord = pickWord();
  const scrambled = scramble(currentWord);
  tilesUsed = scrambled.map(letter => ({ letter, used: false }));
  placedTileIdx = new Array(currentWord.length).fill(undefined);
  gameOver = false;
  changeBackground();
  statusEl.textContent = T().anagram.guess;
  statusEl.className = 'status';
  renderSlots();
  renderTiles();
  stats.best = parseInt(localStorage.getItem('anagram-best-' + currentLang) || '0', 10);
  bestEl.textContent = stats.best;
}

function refreshText() {
  const t = T().anagram;
  subtitleEl.textContent = t.subtitle;
  btnNew.textContent = t.btnNew;
  btnClear.textContent = t.btnClear;
  document.getElementById('lbl-an-wins').textContent = t.statWins;
  document.getElementById('lbl-an-losses').textContent = t.statLosses;
  document.getElementById('lbl-an-best').textContent = t.statBest;
  document.getElementById('an-footer').textContent = t.footer;
  if (!gameOver) statusEl.textContent = t.guess;
}

function resetStats() {
  stats.wins = 0; stats.losses = 0; stats.streak = 0;
  winsEl.textContent = 0; lossesEl.textContent = 0;
  stats.best = parseInt(localStorage.getItem('anagram-best-' + currentLang) || '0', 10);
  bestEl.textContent = stats.best;
}

function init() {
  subtitleEl = document.getElementById('an-subtitle');
  statusEl = document.getElementById('an-status');
  slotsEl = document.getElementById('an-slots');
  tilesEl = document.getElementById('an-tiles');
  winsEl = document.getElementById('an-wins');
  lossesEl = document.getElementById('an-losses');
  bestEl = document.getElementById('an-best');
  btnNew = document.getElementById('an-new');
  btnClear = document.getElementById('an-clear');

  btnNew.addEventListener('click', () => skip());
  btnClear.addEventListener('click', () => clearSlots());

  onLanguageChange(() => {
    resetStats();
    refreshText();
    startRound();
  });

  startRound();
}

export default { init, refreshText, resetStats };
