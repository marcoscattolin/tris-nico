import { T, onLanguageChange } from '../../shared/i18n.js';
import { changeBackground } from '../../shared/backgrounds.js';

const SIZE = 5;

let solution;
let cells;
let tool;
let moves;
let startTime, timerId;
let gameOver;
let best;

let subtitleEl, statusEl, boardEl, movesEl, timeEl, bestEl;
let btnNew, btnFill, btnMark, footerEl;

function rowRuns(arr) {
  const runs = [];
  let r = 0;
  for (const v of arr) {
    if (v === 1) r++;
    else if (r > 0) { runs.push(r); r = 0; }
  }
  if (r > 0) runs.push(r);
  return runs.length === 0 ? [0] : runs;
}

function colOf(grid, c) {
  return grid.map(row => row[c]);
}

function generatePattern() {
  while (true) {
    const grid = [];
    for (let r = 0; r < SIZE; r++) {
      const row = [];
      for (let c = 0; c < SIZE; c++) row.push(Math.random() < 0.55 ? 1 : 0);
      grid.push(row);
    }
    const total = grid.flat().reduce((a, b) => a + b, 0);
    if (total < 8 || total > 18) continue;
    if (grid.some(r => r.every(v => v === 0))) continue;
    let okCols = true;
    for (let c = 0; c < SIZE; c++) {
      if (grid.every(r => r[c] === 0)) { okCols = false; break; }
    }
    if (!okCols) continue;
    return grid;
  }
}

function buildBoard() {
  boardEl.innerHTML = '';
  const corner = document.createElement('div');
  corner.className = 'ng-corner';
  boardEl.appendChild(corner);
  for (let c = 0; c < SIZE; c++) {
    const div = document.createElement('div');
    div.className = 'ng-col-clue';
    const runs = rowRuns(colOf(solution, c));
    div.innerHTML = runs.map(n => `<span>${n}</span>`).join('');
    boardEl.appendChild(div);
  }
  for (let r = 0; r < SIZE; r++) {
    const rc = document.createElement('div');
    rc.className = 'ng-row-clue';
    const runs = rowRuns(solution[r]);
    rc.innerHTML = runs.map(n => `<span>${n}</span>`).join('');
    boardEl.appendChild(rc);
    for (let c = 0; c < SIZE; c++) {
      const btn = document.createElement('button');
      btn.className = 'ng-cell';
      btn.type = 'button';
      btn.dataset.r = r;
      btn.dataset.c = c;
      btn.addEventListener('click', () => applyToCell(r, c, tool));
      btn.addEventListener('contextmenu', e => {
        e.preventDefault();
        applyToCell(r, c, tool === 'fill' ? 'mark' : 'fill');
      });
      boardEl.appendChild(btn);
    }
  }
}

function refreshCells() {
  for (const btn of boardEl.querySelectorAll('.ng-cell')) {
    const r = +btn.dataset.r, c = +btn.dataset.c;
    const v = cells[r][c];
    btn.classList.toggle('filled', v === 1);
    btn.classList.toggle('marked', v === 2);
    btn.textContent = v === 2 ? '×' : '';
  }
}

function applyToCell(r, c, useTool) {
  if (gameOver) return;
  if (!startTime) startTimer();
  const target = useTool === 'fill' ? 1 : 2;
  cells[r][c] = cells[r][c] === target ? 0 : target;
  moves++;
  movesEl.textContent = moves;
  refreshCells();
  if (isSolved()) win();
}

function isSolved() {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const want = solution[r][c] === 1;
      const have = cells[r][c] === 1;
      if (want !== have) return false;
    }
  return true;
}

function win() {
  gameOver = true;
  stopTimer();
  const sec = Math.floor((Date.now() - startTime) / 1000);
  const tStr = formatTime(sec);
  statusEl.textContent = T().nonogram.won(moves, tStr);
  statusEl.className = 'status win';
  if (best === null || moves < best) {
    best = moves;
    localStorage.setItem('nonogram-best', best);
  }
  bestEl.textContent = best;
  for (const el of boardEl.querySelectorAll('.ng-cell')) {
    if (el.classList.contains('filled')) {
      el.classList.remove('solved');
      void el.offsetWidth;
      el.classList.add('solved');
    }
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

function setTool(t) {
  tool = t;
  btnFill.classList.toggle('active', tool === 'fill');
  btnMark.classList.toggle('active', tool === 'mark');
}

function startRound() {
  solution = generatePattern();
  cells = Array.from({ length: SIZE }, () => new Array(SIZE).fill(0));
  moves = 0;
  startTime = null;
  stopTimer();
  timeEl.textContent = '00:00';
  movesEl.textContent = 0;
  gameOver = false;
  changeBackground();
  statusEl.textContent = T().nonogram.play;
  statusEl.className = 'status';
  setTool('fill');
  buildBoard();
  refreshCells();
  const stored = parseInt(localStorage.getItem('nonogram-best') || '0', 10);
  best = stored > 0 ? stored : null;
  bestEl.textContent = best ?? '–';
}

function refreshText() {
  const t = T().nonogram;
  subtitleEl.textContent = t.subtitle;
  btnNew.textContent = t.btnNew;
  btnFill.textContent = t.btnFill;
  btnMark.textContent = t.btnMark;
  document.getElementById('lbl-ng-moves').textContent = t.statMoves;
  document.getElementById('lbl-ng-time').textContent = t.statTime;
  document.getElementById('lbl-ng-best').textContent = t.statBest;
  footerEl.textContent = t.footer;
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
  subtitleEl = document.getElementById('ng-subtitle');
  statusEl = document.getElementById('ng-status');
  boardEl = document.getElementById('ng-board');
  movesEl = document.getElementById('ng-moves');
  timeEl = document.getElementById('ng-time');
  bestEl = document.getElementById('ng-best');
  btnNew = document.getElementById('ng-new');
  btnFill = document.getElementById('ng-fill');
  btnMark = document.getElementById('ng-mark');
  footerEl = document.getElementById('ng-footer');

  btnNew.addEventListener('click', () => startRound());
  btnFill.addEventListener('click', () => setTool('fill'));
  btnMark.addEventListener('click', () => setTool('mark'));

  onLanguageChange(() => { resetStats(); refreshText(); });

  startRound();
}

export default { init, refreshText, resetStats };
