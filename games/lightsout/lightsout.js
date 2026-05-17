import { T, onLanguageChange } from '../../shared/i18n.js';
import { changeBackground } from '../../shared/backgrounds.js';

const SIZE = 5;
let grid;
let cells;
let moves;
let startTime, timerId;
let gameOver;
let best;

let subtitleEl, statusEl, boardEl, movesEl, timeEl, bestEl, btnNew;

function buildBoard() {
  boardEl.innerHTML = '';
  cells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const btn = document.createElement('button');
      btn.className = 'lo-cell';
      btn.type = 'button';
      btn.addEventListener('click', () => onPress(r, c));
      boardEl.appendChild(btn);
      cells.push(btn);
    }
  }
}

function cellAt(r, c) { return cells[r * SIZE + c]; }

function updateCell(r, c) {
  cellAt(r, c).classList.toggle('on', grid[r][c]);
}

function toggle(r, c) {
  if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return;
  grid[r][c] = !grid[r][c];
  updateCell(r, c);
}

function press(r, c) {
  toggle(r, c);
  toggle(r - 1, c);
  toggle(r + 1, c);
  toggle(r, c - 1);
  toggle(r, c + 1);
}

function isSolved() {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (grid[r][c]) return false;
  return true;
}

function generatePuzzle() {
  grid = Array.from({ length: SIZE }, () => new Array(SIZE).fill(false));
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      updateCell(r, c);

  const candidates = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      candidates.push([r, c]);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const numPresses = 6 + Math.floor(Math.random() * 4);
  for (let i = 0; i < numPresses; i++) {
    const [r, c] = candidates[i];
    press(r, c);
  }
  if (isSolved()) press(2, 2);
}

function onPress(r, c) {
  if (gameOver) return;
  if (!startTime) startTimer();
  press(r, c);
  moves++;
  movesEl.textContent = moves;
  if (isSolved()) win();
}

function win() {
  gameOver = true;
  stopTimer();
  const sec = Math.floor((Date.now() - startTime) / 1000);
  const tStr = formatTime(sec);
  statusEl.textContent = T().lightsout.won(moves, tStr);
  statusEl.className = 'status win';
  if (best === null || moves < best) {
    best = moves;
    localStorage.setItem('lightsout-best', best);
  }
  bestEl.textContent = best;
  for (const el of cells) {
    el.classList.remove('solved');
    void el.offsetWidth;
    el.classList.add('solved');
    el.disabled = true;
  }
}

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function startTimer() {
  startTime = Date.now();
  timerId = setInterval(() => {
    const sec = Math.floor((Date.now() - startTime) / 1000);
    timeEl.textContent = formatTime(sec);
  }, 500);
}
function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

function startRound() {
  buildBoard();
  moves = 0;
  startTime = null;
  stopTimer();
  timeEl.textContent = '00:00';
  movesEl.textContent = 0;
  gameOver = false;
  changeBackground();
  statusEl.textContent = T().lightsout.play;
  statusEl.className = 'status';

  generatePuzzle();

  const stored = parseInt(localStorage.getItem('lightsout-best') || '0', 10);
  best = stored > 0 ? stored : null;
  bestEl.textContent = best ?? '–';
}

function refreshText() {
  const t = T().lightsout;
  subtitleEl.textContent = t.subtitle;
  btnNew.textContent = t.btnNew;
  document.getElementById('lbl-lo-moves').textContent = t.statMoves;
  document.getElementById('lbl-lo-time').textContent = t.statTime;
  document.getElementById('lbl-lo-best').textContent = t.statBest;
  document.getElementById('lo-footer').textContent = t.footer;
  if (!gameOver) statusEl.textContent = t.play;
}

function resetStats() {
  moves = 0;
  movesEl.textContent = 0;
  stopTimer();
  startTime = null;
  timeEl.textContent = '00:00';
}

function init() {
  subtitleEl = document.getElementById('lo-subtitle');
  statusEl = document.getElementById('lo-status');
  boardEl = document.getElementById('lo-board');
  movesEl = document.getElementById('lo-moves');
  timeEl = document.getElementById('lo-time');
  bestEl = document.getElementById('lo-best');
  btnNew = document.getElementById('lo-new');

  btnNew.addEventListener('click', () => startRound());

  onLanguageChange(() => {
    resetStats();
    refreshText();
  });

  startRound();
}

export default { init, refreshText, resetStats };
