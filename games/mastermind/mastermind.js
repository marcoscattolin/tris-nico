import { T, onLanguageChange } from '../../shared/i18n.js';
import { changeBackground } from '../../shared/backgrounds.js';

const N_SLOTS = 4;
const N_COLORS = 6;
const MAX_ATTEMPTS = 10;

let secret;
let attempts;
let current;
let gameOver;
let stats;

let subtitleEl, statusEl, boardEl, solutionEl, paletteEl;
let btnCheck, btnClear, btnNew;
let winsEl, lossesEl, bestEl;

function randomSecret() {
  const s = [];
  for (let i = 0; i < N_SLOTS; i++) s.push(1 + Math.floor(Math.random() * N_COLORS));
  return s;
}

function feedback(guess) {
  let exact = 0, near = 0;
  const sUsed = new Array(N_SLOTS).fill(false);
  const gUsed = new Array(N_SLOTS).fill(false);
  for (let i = 0; i < N_SLOTS; i++) {
    if (guess[i] === secret[i]) {
      exact++;
      sUsed[i] = true;
      gUsed[i] = true;
    }
  }
  for (let i = 0; i < N_SLOTS; i++) {
    if (gUsed[i]) continue;
    for (let j = 0; j < N_SLOTS; j++) {
      if (sUsed[j]) continue;
      if (guess[i] === secret[j]) {
        near++;
        sUsed[j] = true;
        break;
      }
    }
  }
  return { exact, near };
}

function makeSlot(colorIdx, { active = false, onClick } = {}) {
  const btn = document.createElement('button');
  btn.className = 'mm-slot';
  btn.type = 'button';
  if (colorIdx) {
    btn.classList.add('filled', `mm-c${colorIdx}`);
    btn.style.background = '';
  }
  if (!active) btn.disabled = true;
  if (onClick) btn.addEventListener('click', onClick);
  return btn;
}

function makeFeedback({ exact, near }) {
  const wrap = document.createElement('div');
  wrap.className = 'mm-feedback';
  const pegs = [];
  for (let i = 0; i < exact; i++) pegs.push('exact');
  for (let i = 0; i < near; i++) pegs.push('near');
  while (pegs.length < N_SLOTS) pegs.push(null);
  for (const kind of pegs) {
    const p = document.createElement('div');
    p.className = 'mm-peg';
    if (kind) p.classList.add(kind);
    wrap.appendChild(p);
  }
  return wrap;
}

function renderBoard() {
  boardEl.innerHTML = '';
  const activeIdx = attempts.length;
  for (let row = 0; row < MAX_ATTEMPTS; row++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'mm-row';
    const slots = document.createElement('div');
    slots.className = 'mm-slots';

    if (row < activeIdx) {
      rowEl.classList.add('done');
      const a = attempts[row];
      for (let i = 0; i < N_SLOTS; i++) slots.appendChild(makeSlot(a.guess[i]));
      rowEl.appendChild(slots);
      rowEl.appendChild(makeFeedback(a));
    } else if (row === activeIdx && !gameOver) {
      rowEl.classList.add('active');
      for (let i = 0; i < N_SLOTS; i++) {
        slots.appendChild(makeSlot(current[i], { active: true, onClick: () => clearSlot(i) }));
      }
      rowEl.appendChild(slots);
      rowEl.appendChild(makeFeedback({ exact: 0, near: 0 }));
    } else {
      for (let i = 0; i < N_SLOTS; i++) slots.appendChild(makeSlot(null));
      rowEl.appendChild(slots);
      rowEl.appendChild(makeFeedback({ exact: 0, near: 0 }));
    }
    boardEl.appendChild(rowEl);
  }
  updateButtons();
}

function renderPalette() {
  paletteEl.innerHTML = '';
  for (let i = 1; i <= N_COLORS; i++) {
    const btn = document.createElement('button');
    btn.className = `mm-color mm-c${i}`;
    btn.type = 'button';
    btn.addEventListener('click', () => placeColor(i));
    paletteEl.appendChild(btn);
  }
}

function placeColor(colorIdx) {
  if (gameOver) return;
  const i = current.indexOf(null);
  if (i === -1) return;
  current[i] = colorIdx;
  renderBoard();
}

function clearSlot(i) {
  if (gameOver) return;
  if (current[i] == null) return;
  current[i] = null;
  renderBoard();
}

function clearCurrent() {
  if (gameOver) return;
  current = new Array(N_SLOTS).fill(null);
  renderBoard();
}

function updateButtons() {
  const full = current.every(c => c != null);
  btnCheck.disabled = gameOver || !full;
  btnClear.disabled = gameOver || current.every(c => c == null);
  btnCheck.textContent = T().mastermind.btnCheck;
  btnClear.textContent = T().mastermind.btnClear;
  btnNew.textContent = T().mastermind.btnNew;
}

function showSolution() {
  solutionEl.innerHTML = '';
  for (const c of secret) solutionEl.appendChild(makeSlot(c));
  solutionEl.hidden = false;
}

function check() {
  if (gameOver) return;
  if (current.some(c => c == null)) return;
  const fb = feedback(current);
  attempts.push({ guess: current.slice(), exact: fb.exact, near: fb.near });
  if (fb.exact === N_SLOTS) {
    win();
  } else if (attempts.length >= MAX_ATTEMPTS) {
    lose();
  } else {
    current = new Array(N_SLOTS).fill(null);
    renderBoard();
  }
}

function win() {
  gameOver = true;
  stats.wins++;
  if (stats.best === null || attempts.length < stats.best) {
    stats.best = attempts.length;
    localStorage.setItem('mastermind-best', stats.best);
  }
  persistTotals();
  refreshStats();
  statusEl.textContent = T().mastermind.won(attempts.length);
  statusEl.className = 'status win';
  renderBoard();
}

function lose() {
  gameOver = true;
  stats.losses++;
  persistTotals();
  refreshStats();
  statusEl.textContent = T().mastermind.lost;
  statusEl.className = 'status lose';
  showSolution();
  renderBoard();
}

function loadStats() {
  const wins = parseInt(localStorage.getItem('mastermind-wins') || '0', 10);
  const losses = parseInt(localStorage.getItem('mastermind-losses') || '0', 10);
  const bestRaw = localStorage.getItem('mastermind-best');
  const best = bestRaw ? parseInt(bestRaw, 10) : null;
  return { wins, losses, best };
}

function persistTotals() {
  localStorage.setItem('mastermind-wins', stats.wins);
  localStorage.setItem('mastermind-losses', stats.losses);
}

function refreshStats() {
  winsEl.textContent = stats.wins;
  lossesEl.textContent = stats.losses;
  bestEl.textContent = stats.best ?? '–';
}

function startRound() {
  secret = randomSecret();
  attempts = [];
  current = new Array(N_SLOTS).fill(null);
  gameOver = false;
  solutionEl.hidden = true;
  solutionEl.innerHTML = '';
  changeBackground();
  statusEl.textContent = T().mastermind.play;
  statusEl.className = 'status';
  refreshStats();
  renderBoard();
}

function refreshText() {
  const t = T().mastermind;
  subtitleEl.textContent = t.subtitle;
  document.getElementById('lbl-mm-wins').textContent = t.statWins;
  document.getElementById('lbl-mm-losses').textContent = t.statLosses;
  document.getElementById('lbl-mm-best').textContent = t.statBest;
  document.getElementById('mm-footer').textContent = t.footer;
  updateButtons();
  if (!gameOver) statusEl.textContent = t.play;
}

function resetStats() {
  stats = { wins: 0, losses: 0, best: stats?.best ?? null };
  refreshStats();
}

function init() {
  subtitleEl = document.getElementById('mm-subtitle');
  statusEl = document.getElementById('mm-status');
  boardEl = document.getElementById('mm-board');
  solutionEl = document.getElementById('mm-solution');
  paletteEl = document.getElementById('mm-palette');
  btnCheck = document.getElementById('mm-check');
  btnClear = document.getElementById('mm-clear');
  btnNew = document.getElementById('mm-new');
  winsEl = document.getElementById('mm-wins');
  lossesEl = document.getElementById('mm-losses');
  bestEl = document.getElementById('mm-best');

  stats = loadStats();

  renderPalette();

  btnCheck.addEventListener('click', check);
  btnClear.addEventListener('click', clearCurrent);
  btnNew.addEventListener('click', () => startRound());

  onLanguageChange(() => { refreshText(); });

  startRound();
}

export default { init, refreshText, resetStats };
