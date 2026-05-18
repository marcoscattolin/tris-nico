import { currentLang, T, onLanguageChange } from '../../shared/i18n.js';
import { LADDER_WORDS, ALPHABETS } from '../../shared/words.js';
import { changeBackground } from '../../shared/backgrounds.js';

const LENGTH = 4;
const MIN_TARGET_DIST = 3;
const MAX_TARGET_DIST = 5;

const stats = { wins: 0, losses: 0, streak: 0, best: 0 };
let dictSet = new Set();
let start = '', target = '', minSteps = 0;
let ladder = [];
let gameOver = false;
let autoRestartTimer = null;

let subtitleEl, statusEl, ladderEl, inputEl, submitBtn, hintEl,
    undoBtn, newBtn, winsEl, lossesEl, bestEl, footerEl;

function buildDict() {
  const pool = (LADDER_WORDS[currentLang] && LADDER_WORDS[currentLang][LENGTH]) || LADDER_WORDS.it[LENGTH];
  dictSet = new Set(pool.map(w => w.toUpperCase()));
}

function neighbors(word) {
  const alphabet = ALPHABETS[currentLang];
  const out = [];
  for (let i = 0; i < word.length; i++) {
    for (const c of alphabet) {
      if (c === word[i]) continue;
      const n = word.slice(0, i) + c + word.slice(i + 1);
      if (dictSet.has(n)) out.push(n);
    }
  }
  return out;
}

function bfs(from, maxDepth) {
  const dist = new Map([[from, 0]]);
  const queue = [from];
  let head = 0;
  while (head < queue.length) {
    const w = queue[head++];
    const d = dist.get(w);
    if (d >= maxDepth) continue;
    for (const n of neighbors(w)) {
      if (!dist.has(n)) {
        dist.set(n, d + 1);
        queue.push(n);
      }
    }
  }
  return dist;
}

function generatePuzzle() {
  const words = [...dictSet];
  for (let attempt = 0; attempt < 80; attempt++) {
    const s = words[Math.floor(Math.random() * words.length)];
    const dist = bfs(s, MAX_TARGET_DIST);
    const candidates = [];
    for (const [w, d] of dist) {
      if (d >= MIN_TARGET_DIST && d <= MAX_TARGET_DIST) candidates.push([w, d]);
    }
    if (candidates.length === 0) continue;
    const [t, d] = candidates[Math.floor(Math.random() * candidates.length)];
    start = s; target = t; minSteps = d;
    return;
  }
  // Fallback estremo: due parole vicine
  for (const s of words) {
    const ns = neighbors(s);
    if (ns.length > 0) { start = s; target = ns[0]; minSteps = 1; return; }
  }
}

function diffCount(a, b) {
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

function changedIndex(prev, curr) {
  for (let i = 0; i < prev.length; i++) if (prev[i] !== curr[i]) return i;
  return -1;
}

function renderRow(word, type, prevWord) {
  const row = document.createElement('div');
  row.className = 'wl-row ' + type;
  const changed = (type === 'user' && prevWord) ? changedIndex(prevWord, word) : -1;
  for (let i = 0; i < word.length; i++) {
    const cell = document.createElement('div');
    cell.className = 'wl-cell' + (i === changed ? ' changed' : '');
    cell.textContent = word[i];
    row.appendChild(cell);
  }
  return row;
}

function render() {
  ladderEl.innerHTML = '';
  ladderEl.appendChild(renderRow(start, 'start', null));
  for (let i = 1; i < ladder.length; i++) {
    const row = renderRow(ladder[i], gameOver && i === ladder.length - 1 && ladder[i] === target ? 'user win' : 'user', ladder[i - 1]);
    ladderEl.appendChild(row);
  }
  ladderEl.appendChild(renderRow(target, 'target', null));

  const t = T().wordladder;
  hintEl.textContent = t.minSteps(minSteps) + ' • ' + t.usedSteps(ladder.length - 1);

  inputEl.disabled = gameOver;
  submitBtn.disabled = gameOver;
  undoBtn.disabled = gameOver || ladder.length <= 1;
}

function showStatus(text, cls) {
  statusEl.textContent = text;
  statusEl.className = 'status' + (cls ? ' ' + cls : '');
}

function showError(text) {
  inputEl.classList.add('wrong');
  showStatus(text, 'lose');
  setTimeout(() => {
    if (gameOver) return;
    inputEl.classList.remove('wrong');
    showStatus(T().wordladder.play);
  }, 1100);
}

function trySubmit() {
  if (gameOver) return;
  const raw = inputEl.value.trim().toUpperCase();
  if (!raw) return;
  const t = T().wordladder;

  if (raw.length !== LENGTH) { showError(t.errLen(LENGTH)); return; }

  const alphabet = ALPHABETS[currentLang];
  for (const c of raw) {
    if (!alphabet.includes(c)) { showError(t.errAlphabet); return; }
  }

  const prev = ladder[ladder.length - 1];
  if (raw === prev) { showError(t.errSame); return; }
  if (ladder.includes(raw)) { showError(t.errRepeat); return; }

  const d = diffCount(prev, raw);
  if (d !== 1) { showError(t.errOneLetter); return; }

  if (!dictSet.has(raw)) { showError(t.errNotInDict); return; }

  ladder.push(raw);
  inputEl.value = '';
  if (raw === target) win();
  else { render(); showStatus(t.play); }
}

function win() {
  gameOver = true;
  stats.wins++;
  stats.streak++;
  if (stats.streak > stats.best) {
    stats.best = stats.streak;
    localStorage.setItem('wordladder-best-' + currentLang, stats.best);
  }
  winsEl.textContent = stats.wins;
  bestEl.textContent = stats.best;
  render();
  const moves = ladder.length - 1;
  showStatus(T().wordladder.won(moves), 'win');
  autoRestartTimer = setTimeout(() => { autoRestartTimer = null; startRound(); }, 1800);
}

function skip() {
  if (autoRestartTimer !== null) { clearTimeout(autoRestartTimer); autoRestartTimer = null; }
  if (!gameOver && ladder.length > 1) {
    // se l'utente abbandona a metà gioco contiamo come saltata
    stats.losses++; stats.streak = 0;
    lossesEl.textContent = stats.losses;
    bestEl.textContent = stats.best;
  } else if (!gameOver) {
    stats.losses++; stats.streak = 0;
    lossesEl.textContent = stats.losses;
  }
  startRound();
}

function undo() {
  if (gameOver || ladder.length <= 1) return;
  ladder.pop();
  inputEl.value = '';
  render();
  showStatus(T().wordladder.play);
}

function startRound() {
  if (autoRestartTimer !== null) { clearTimeout(autoRestartTimer); autoRestartTimer = null; }
  buildDict();
  generatePuzzle();
  ladder = [start];
  gameOver = false;
  inputEl.value = '';
  inputEl.classList.remove('wrong');
  inputEl.disabled = false;
  submitBtn.disabled = false;
  changeBackground();
  render();
  showStatus(T().wordladder.play);
  // su mobile non vogliamo forzare la tastiera, ma su desktop il focus è comodo
  if (matchMedia && !matchMedia('(hover: none)').matches) inputEl.focus();
}

function refreshText() {
  const t = T().wordladder;
  subtitleEl.textContent = t.subtitle;
  submitBtn.textContent = t.btnSubmit;
  undoBtn.textContent = t.btnUndo;
  newBtn.textContent = t.btnNew;
  document.getElementById('lbl-wl-wins').textContent = t.statWins;
  document.getElementById('lbl-wl-losses').textContent = t.statLosses;
  document.getElementById('lbl-wl-best').textContent = t.statBest;
  footerEl.textContent = t.footer;
  inputEl.placeholder = t.inputPlaceholder;
  if (!gameOver) showStatus(t.play);
  if (start && target) render();
}

function resetStats() {
  stats.wins = 0; stats.losses = 0; stats.streak = 0;
  winsEl.textContent = 0; lossesEl.textContent = 0;
  stats.best = parseInt(localStorage.getItem('wordladder-best-' + currentLang) || '0', 10);
  bestEl.textContent = stats.best;
}

function init() {
  subtitleEl = document.getElementById('wl-subtitle');
  statusEl = document.getElementById('wl-status');
  ladderEl = document.getElementById('wl-ladder');
  inputEl = document.getElementById('wl-input');
  submitBtn = document.getElementById('wl-submit');
  hintEl = document.getElementById('wl-hint');
  undoBtn = document.getElementById('wl-undo');
  newBtn = document.getElementById('wl-new');
  winsEl = document.getElementById('wl-wins');
  lossesEl = document.getElementById('wl-losses');
  bestEl = document.getElementById('wl-best');
  footerEl = document.getElementById('wl-footer');

  inputEl.maxLength = LENGTH;
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); trySubmit(); }
  });
  inputEl.addEventListener('input', () => {
    inputEl.value = inputEl.value.toUpperCase().slice(0, LENGTH);
    inputEl.classList.remove('wrong');
  });
  submitBtn.addEventListener('click', trySubmit);
  undoBtn.addEventListener('click', undo);
  newBtn.addEventListener('click', skip);

  onLanguageChange(() => {
    resetStats();
    refreshText();
    startRound();
  });

  resetStats();
  startRound();
}

export default { init, refreshText, resetStats };
