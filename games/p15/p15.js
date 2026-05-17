import { T, onLanguageChange } from '../../shared/i18n.js';
import { changeBackground } from '../../shared/backgrounds.js';

const SIZE = 4;
let grid;
let tiles;
let blankR, blankC;
let moves, startTime, timerId, gameOver, best;

let subtitleEl, statusEl, boardEl, movesEl, timeEl, bestEl, btnNew;
let bgEl, tilesLayerEl;

function setupBoard() {
  boardEl.innerHTML = '';
  bgEl = document.createElement('div');
  bgEl.className = 'p15-bg';
  for (let i = 0; i < SIZE * SIZE; i++) {
    const c = document.createElement('div');
    c.className = 'p15-bg-cell';
    bgEl.appendChild(c);
  }
  boardEl.appendChild(bgEl);
  tilesLayerEl = document.createElement('div');
  tilesLayerEl.className = 'p15-tiles';
  boardEl.appendChild(tilesLayerEl);
}

function createTile(value, r, c) {
  const el = document.createElement('button');
  el.className = 'p15-tile';
  el.textContent = value;
  el.style.setProperty('--r', r);
  el.style.setProperty('--c', c);
  el.addEventListener('click', () => clickTile(value));
  tilesLayerEl.appendChild(el);
  const tile = { id: value, value, r, c, el };
  tiles.set(value, tile);
  return tile;
}

function isSolved() {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const expected = (r === SIZE - 1 && c === SIZE - 1) ? 0 : (r * SIZE + c + 1);
      if (grid[r][c] !== expected) return false;
    }
  return true;
}

function dataSwap(r, c) {
  const id = grid[r][c];
  const tile = tiles.get(id);
  grid[blankR][blankC] = id;
  tile.r = blankR;
  tile.c = blankC;
  grid[r][c] = 0;
  blankR = r; blankC = c;
}

function moveTile(r, c) {
  const id = grid[r][c];
  if (!id) return;
  const tile = tiles.get(id);
  const oldR = blankR, oldC = blankC;
  grid[oldR][oldC] = id;
  grid[r][c] = 0;
  tile.r = oldR; tile.c = oldC;
  blankR = r; blankC = c;
  tile.el.style.setProperty('--r', tile.r);
  tile.el.style.setProperty('--c', tile.c);
}

function clickTile(value) {
  if (gameOver) return;
  const tile = tiles.get(value);
  if (!tile) return;
  const { r, c } = tile;
  if (r === blankR && c !== blankC) {
    const dir = c < blankC ? -1 : 1;
    let count = 0;
    while (blankC !== c) {
      moveTile(blankR, blankC + dir);
      count++;
    }
    registerMove(count);
  } else if (c === blankC && r !== blankR) {
    const dir = r < blankR ? -1 : 1;
    let count = 0;
    while (blankR !== r) {
      moveTile(blankR + dir, blankC);
      count++;
    }
    registerMove(count);
  }
}

function registerMove(n) {
  if (n === 0) return;
  moves += n;
  movesEl.textContent = moves;
  if (!startTime) startTimer();
  updateCorrect();
  if (isSolved()) win();
}

function updateCorrect() {
  for (const tile of tiles.values()) {
    const expectedValue = tile.r * SIZE + tile.c + 1;
    tile.el.classList.toggle('correct', tile.value === expectedValue);
  }
}

function win() {
  gameOver = true;
  stopTimer();
  const sec = Math.floor((Date.now() - startTime) / 1000);
  const tStr = formatTime(sec);
  statusEl.textContent = T().p15.won(moves, tStr);
  statusEl.className = 'status win';
  if (best === null || moves < best) {
    best = moves;
    localStorage.setItem('p15-best', best);
  }
  bestEl.textContent = best;
  for (const tile of tiles.values()) {
    tile.el.classList.remove('won');
    void tile.el.offsetWidth;
    tile.el.classList.add('won');
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

function shuffleData() {
  let lastBlank = null;
  for (let i = 0; i < 250; i++) {
    const neighbors = [];
    if (blankR > 0) neighbors.push([blankR - 1, blankC]);
    if (blankR < SIZE - 1) neighbors.push([blankR + 1, blankC]);
    if (blankC > 0) neighbors.push([blankR, blankC - 1]);
    if (blankC < SIZE - 1) neighbors.push([blankR, blankC + 1]);
    const filtered = lastBlank ? neighbors.filter(([r, c]) => r !== lastBlank[0] || c !== lastBlank[1]) : neighbors;
    const pool = filtered.length ? filtered : neighbors;
    const [r, c] = pool[Math.floor(Math.random() * pool.length)];
    lastBlank = [blankR, blankC];
    dataSwap(r, c);
  }
}

function startRound() {
  setupBoard();
  grid = [];
  tiles = new Map();
  moves = 0;
  startTime = null;
  stopTimer();
  timeEl.textContent = '00:00';
  movesEl.textContent = 0;
  gameOver = false;

  let value = 1;
  for (let r = 0; r < SIZE; r++) {
    const row = [];
    for (let c = 0; c < SIZE; c++) {
      if (r === SIZE - 1 && c === SIZE - 1) row.push(0);
      else row.push(value++);
    }
    grid.push(row);
  }
  blankR = SIZE - 1; blankC = SIZE - 1;

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const id = grid[r][c];
      if (id) createTile(id, r, c);
    }
  }

  do { shuffleData(); } while (isSolved());

  for (const tile of tiles.values()) {
    tile.el.style.transition = 'none';
    tile.el.style.setProperty('--r', tile.r);
    tile.el.style.setProperty('--c', tile.c);
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      for (const tile of tiles.values()) tile.el.style.transition = '';
    });
  });

  changeBackground();
  statusEl.textContent = T().p15.play;
  statusEl.className = 'status';

  const stored = parseInt(localStorage.getItem('p15-best') || '0', 10);
  best = stored > 0 ? stored : null;
  bestEl.textContent = best ?? '–';

  updateCorrect();
}

function refreshText() {
  const t = T().p15;
  subtitleEl.textContent = t.subtitle;
  btnNew.textContent = t.btnNew;
  document.getElementById('lbl-p15-moves').textContent = t.statMoves;
  document.getElementById('lbl-p15-time').textContent = t.statTime;
  document.getElementById('lbl-p15-best').textContent = t.statBest;
  document.getElementById('p15-footer').textContent = t.footer;
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
  subtitleEl = document.getElementById('p15-subtitle');
  statusEl = document.getElementById('p15-status');
  boardEl = document.getElementById('p15-board');
  movesEl = document.getElementById('p15-moves');
  timeEl = document.getElementById('p15-time');
  bestEl = document.getElementById('p15-best');
  btnNew = document.getElementById('p15-new');

  btnNew.addEventListener('click', () => startRound());

  onLanguageChange(() => {
    resetStats();
    refreshText();
  });

  startRound();
}

export default { init, refreshText, resetStats };
