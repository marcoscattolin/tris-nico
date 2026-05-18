import { T, onLanguageChange } from '../../shared/i18n.js';
import { changeBackground } from '../../shared/backgrounds.js';

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}
function frac(n, d = 1) {
  if (d === 0) return null;
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}
function fAdd(a, b) { return frac(a.n * b.d + b.n * a.d, a.d * b.d); }
function fSub(a, b) { return frac(a.n * b.d - b.n * a.d, a.d * b.d); }
function fMul(a, b) { return frac(a.n * b.n, a.d * b.d); }
function fDiv(a, b) { return b.n === 0 ? null : frac(a.n * b.d, a.d * b.n); }
function fEq(a, b) { return a.n === b.n && a.d === b.d; }
function fStr(a) { return a.d === 1 ? `${a.n}` : `${a.n}/${a.d}`; }

const TARGET = frac(24);

function canSolve(nums) {
  if (nums.length === 1) return fEq(nums[0], TARGET);
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const a = nums[i], b = nums[j];
      const rest = [];
      for (let k = 0; k < nums.length; k++) if (k !== i && k !== j) rest.push(nums[k]);
      const candidates = [fAdd(a, b), fMul(a, b), fSub(a, b), fSub(b, a), fDiv(a, b), fDiv(b, a)];
      for (const r of candidates) {
        if (r === null) continue;
        rest.push(r);
        if (canSolve(rest)) return true;
        rest.pop();
      }
    }
  }
  return false;
}

function generatePuzzle() {
  while (true) {
    const nums = [];
    for (let i = 0; i < 4; i++) nums.push(1 + Math.floor(Math.random() * 9));
    if (canSolve(nums.map(v => frac(v)))) return nums;
  }
}

const OPS = [
  { id: '+', label: '+', apply: fAdd },
  { id: '-', label: '−', apply: fSub },
  { id: '*', label: '×', apply: fMul },
  { id: '/', label: '÷', apply: fDiv },
];

let initialNums;
let tiles;
let history;
let nextTileId;
let selectedTileId, selectedOp;
let gameWon, gameOver;
let stats;
let streak;

let subtitleEl, statusEl, tilesEl, opsEl;
let btnUndo, btnReset, btnNew;
let winsEl, lossesEl, bestEl, footerEl;

function loadStats() {
  const wins = parseInt(localStorage.getItem('t24-wins') || '0', 10);
  const losses = parseInt(localStorage.getItem('t24-losses') || '0', 10);
  const bestRaw = localStorage.getItem('t24-best');
  const best = bestRaw ? parseInt(bestRaw, 10) : null;
  return { wins, losses, best };
}
function persistStats() {
  localStorage.setItem('t24-wins', stats.wins);
  localStorage.setItem('t24-losses', stats.losses);
  if (stats.best !== null) localStorage.setItem('t24-best', stats.best);
}
function refreshStats() {
  winsEl.textContent = stats.wins;
  lossesEl.textContent = stats.losses;
  bestEl.textContent = stats.best ?? '–';
}

function setStatus(text, cls = '') {
  statusEl.textContent = text;
  statusEl.className = 'status' + (cls ? ' ' + cls : '');
}

function renderTiles() {
  tilesEl.innerHTML = '';
  for (const t of tiles) {
    const btn = document.createElement('button');
    btn.className = 't24-tile';
    btn.type = 'button';
    if (t.id === selectedTileId) btn.classList.add('selected');
    btn.textContent = fStr(t.value);
    btn.addEventListener('click', () => onTile(t.id));
    tilesEl.appendChild(btn);
  }
}

function renderOps() {
  opsEl.innerHTML = '';
  for (const op of OPS) {
    const btn = document.createElement('button');
    btn.className = 't24-op';
    btn.type = 'button';
    if (op.id === selectedOp) btn.classList.add('selected');
    btn.textContent = op.label;
    btn.addEventListener('click', () => onOp(op.id));
    opsEl.appendChild(btn);
  }
}

function onTile(id) {
  if (gameOver) return;
  if (selectedTileId === null) {
    selectedTileId = id;
    renderTiles();
    return;
  }
  if (selectedTileId === id) {
    selectedTileId = null;
    selectedOp = null;
    renderTiles();
    renderOps();
    return;
  }
  if (selectedOp === null) {
    selectedTileId = id;
    renderTiles();
    return;
  }
  applyOp(selectedTileId, id, selectedOp);
}

function onOp(opId) {
  if (gameOver) return;
  selectedOp = selectedOp === opId ? null : opId;
  renderOps();
}

function applyOp(idA, idB, opId) {
  const a = tiles.find(t => t.id === idA);
  const b = tiles.find(t => t.id === idB);
  const op = OPS.find(o => o.id === opId);
  const result = op.apply(a.value, b.value);
  if (result === null) {
    setStatus(T().t24.divByZero, 'lose');
    selectedOp = null;
    renderOps();
    return;
  }
  history.push(tiles.slice());
  const newTile = { id: nextTileId++, value: result };
  tiles = tiles.filter(t => t.id !== idB);
  const newIdx = tiles.findIndex(t => t.id === idA);
  tiles[newIdx] = newTile;
  selectedTileId = null;
  selectedOp = null;
  setStatus(T().t24.play);
  renderTiles();
  renderOps();
  checkEnd();
}

function checkEnd() {
  if (tiles.length === 1) {
    const v = tiles[0].value;
    if (fEq(v, TARGET)) win();
    else setStatus(T().t24.notYet(fStr(v)), 'lose');
  }
}

function win() {
  gameWon = true;
  gameOver = true;
  stats.wins++;
  streak++;
  if (stats.best === null || streak > stats.best) stats.best = streak;
  persistStats();
  refreshStats();
  setStatus(T().t24.won, 'win');
  for (const el of tilesEl.querySelectorAll('.t24-tile')) {
    el.classList.add('correct');
    el.disabled = true;
  }
}

function undo() {
  if (gameOver) return;
  if (history.length === 0) return;
  tiles = history.pop();
  selectedTileId = null;
  selectedOp = null;
  setStatus(T().t24.play);
  renderTiles();
  renderOps();
}

function reset() {
  if (gameOver) return;
  history = [];
  tiles = initialNums.map(v => ({ id: nextTileId++, value: frac(v) }));
  selectedTileId = null;
  selectedOp = null;
  setStatus(T().t24.play);
  renderTiles();
  renderOps();
}

function startRound() {
  if (initialNums && !gameWon) {
    stats.losses++;
    streak = 0;
    persistStats();
  }
  initialNums = generatePuzzle();
  nextTileId = 1;
  history = [];
  tiles = initialNums.map(v => ({ id: nextTileId++, value: frac(v) }));
  selectedTileId = null;
  selectedOp = null;
  gameWon = false;
  gameOver = false;
  changeBackground();
  setStatus(T().t24.play);
  refreshStats();
  renderTiles();
  renderOps();
}

function refreshText() {
  const t = T().t24;
  subtitleEl.textContent = t.subtitle;
  btnUndo.textContent = t.btnUndo;
  btnReset.textContent = t.btnReset;
  btnNew.textContent = t.btnNew;
  document.getElementById('lbl-t24-wins').textContent = t.statWins;
  document.getElementById('lbl-t24-losses').textContent = t.statLosses;
  document.getElementById('lbl-t24-best').textContent = t.statBest;
  footerEl.textContent = t.footer;
  if (!gameOver && statusEl.className === 'status') setStatus(t.play);
}

function resetStats() {
  stats = { wins: 0, losses: 0, best: stats?.best ?? null };
  streak = 0;
  refreshStats();
}

function init() {
  subtitleEl = document.getElementById('t24-subtitle');
  statusEl = document.getElementById('t24-status');
  tilesEl = document.getElementById('t24-tiles');
  opsEl = document.getElementById('t24-ops');
  btnUndo = document.getElementById('t24-undo');
  btnReset = document.getElementById('t24-reset');
  btnNew = document.getElementById('t24-new');
  winsEl = document.getElementById('t24-wins');
  lossesEl = document.getElementById('t24-losses');
  bestEl = document.getElementById('t24-best');
  footerEl = document.getElementById('t24-footer');

  stats = loadStats();
  streak = 0;

  btnUndo.addEventListener('click', undo);
  btnReset.addEventListener('click', reset);
  btnNew.addEventListener('click', () => startRound());

  onLanguageChange(() => { refreshText(); });

  startRound();
}

export default { init, refreshText, resetStats };
