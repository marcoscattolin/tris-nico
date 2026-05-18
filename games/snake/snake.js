import { T, onLanguageChange } from '../../shared/i18n.js';
import { changeBackground } from '../../shared/backgrounds.js';

const ROWS = 15, COLS = 15;
const TICK_MS = 160;

let cells;
let snake;
let dir, nextDir;
let food;
let score;
let tickId;
let gameOver, paused, everStarted;
let elapsedMs, timerStartedAt, timerId;
let best;

let subtitleEl, statusEl, boardEl, scoreEl, timeEl, bestEl;
let btnNew, btnPause, footerEl;

function buildBoard() {
  boardEl.innerHTML = '';
  cells = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      const div = document.createElement('div');
      div.className = 'snake-cell';
      boardEl.appendChild(div);
      row.push(div);
    }
    cells.push(row);
  }
}

function paint() {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      cells[r][c].className = 'snake-cell';
  for (let i = 0; i < snake.length; i++) {
    const { r, c } = snake[i];
    const el = cells[r][c];
    el.classList.add('snake');
    if (i === 0) el.classList.add('head');
  }
  if (food) cells[food.r][food.c].classList.add('food');
}

function tick() {
  if (paused || gameOver) return;
  dir = nextDir;
  const head = snake[0];
  const nh = { r: head.r + dir.dr, c: head.c + dir.dc };
  if (nh.r < 0 || nh.r >= ROWS || nh.c < 0 || nh.c >= COLS) { lose(); return; }
  const eating = food && nh.r === food.r && nh.c === food.c;
  const checkLen = eating ? snake.length : snake.length - 1;
  for (let i = 0; i < checkLen; i++) {
    if (snake[i].r === nh.r && snake[i].c === nh.c) { lose(); return; }
  }
  snake.unshift(nh);
  if (eating) { score++; spawnFood(); }
  else { snake.pop(); }
  paint();
  scoreEl.textContent = score;
}

function spawnFood() {
  const occupied = new Set(snake.map(s => s.r * COLS + s.c));
  const empties = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (!occupied.has(r * COLS + c)) empties.push({ r, c });
  if (empties.length === 0) { food = null; win(); return; }
  food = empties[Math.floor(Math.random() * empties.length)];
}

function persistBest() {
  if (best === null || score > best) {
    best = score;
    localStorage.setItem('snake-best', best);
  }
  bestEl.textContent = best ?? 0;
}

function lose() {
  gameOver = true;
  if (tickId) { clearInterval(tickId); tickId = null; }
  stopTimer();
  statusEl.textContent = T().snake.lost(score);
  statusEl.className = 'status lose';
  persistBest();
}

function win() {
  gameOver = true;
  if (tickId) { clearInterval(tickId); tickId = null; }
  stopTimer();
  statusEl.textContent = T().snake.won(score);
  statusEl.className = 'status win';
  persistBest();
}

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
function startTimer() {
  timerStartedAt = Date.now();
  timerId = setInterval(() => {
    const sec = Math.floor((elapsedMs + (Date.now() - timerStartedAt)) / 1000);
    timeEl.textContent = formatTime(sec);
  }, 500);
}
function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    elapsedMs += Date.now() - timerStartedAt;
    timerId = null;
  }
}

function togglePause() {
  if (gameOver) return;
  paused = !paused;
  if (paused) {
    stopTimer();
    if (tickId) { clearInterval(tickId); tickId = null; }
    statusEl.textContent = T().snake.paused;
    statusEl.className = 'status';
    btnPause.textContent = T().snake.btnResume;
  } else {
    everStarted = true;
    startTimer();
    if (!tickId) tickId = setInterval(tick, TICK_MS);
    statusEl.textContent = T().snake.play;
    statusEl.className = 'status';
    btnPause.textContent = T().snake.btnPause;
  }
}

function startRound() {
  if (tickId) { clearInterval(tickId); tickId = null; }
  stopTimer();
  buildBoard();
  snake = [{ r: 7, c: 4 }, { r: 7, c: 3 }, { r: 7, c: 2 }, { r: 7, c: 1 }];
  dir = { dr: 0, dc: 1 };
  nextDir = dir;
  score = 0;
  gameOver = false;
  paused = true;
  everStarted = false;
  elapsedMs = 0;
  changeBackground();
  spawnFood();
  paint();
  statusEl.textContent = T().snake.ready;
  statusEl.className = 'status';
  scoreEl.textContent = 0;
  timeEl.textContent = '00:00';
  const stored = parseInt(localStorage.getItem('snake-best') || '0', 10);
  best = stored > 0 ? stored : null;
  bestEl.textContent = best ?? '–';
  btnPause.textContent = T().snake.btnResume;
}

function onKey(e) {
  if (gameOver) return;
  let d = null;
  switch (e.key) {
    case 'ArrowUp': case 'w': case 'W': d = { dr: -1, dc: 0 }; break;
    case 'ArrowDown': case 's': case 'S': d = { dr: 1, dc: 0 }; break;
    case 'ArrowLeft': case 'a': case 'A': d = { dr: 0, dc: -1 }; break;
    case 'ArrowRight': case 'd': case 'D': d = { dr: 0, dc: 1 }; break;
    case ' ': e.preventDefault(); togglePause(); return;
    default: return;
  }
  if (d.dr === -dir.dr && d.dc === -dir.dc) return;
  e.preventDefault();
  nextDir = d;
  if (paused) togglePause();
}

let touchStart = null;
function onTouchStart(e) {
  const t = e.touches[0];
  touchStart = { x: t.clientX, y: t.clientY };
}
function onTouchEnd(e) {
  if (!touchStart || gameOver) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
  let d;
  if (Math.abs(dx) > Math.abs(dy)) d = dx > 0 ? { dr: 0, dc: 1 } : { dr: 0, dc: -1 };
  else d = dy > 0 ? { dr: 1, dc: 0 } : { dr: -1, dc: 0 };
  if (d.dr === -dir.dr && d.dc === -dir.dc) return;
  nextDir = d;
  if (paused) togglePause();
}

function refreshText() {
  const t = T().snake;
  subtitleEl.textContent = t.subtitle;
  btnNew.textContent = t.btnNew;
  btnPause.textContent = paused ? t.btnResume : t.btnPause;
  document.getElementById('lbl-snake-score').textContent = t.statScore;
  document.getElementById('lbl-snake-time').textContent = t.statTime;
  document.getElementById('lbl-snake-best').textContent = t.statBest;
  footerEl.textContent = t.footer;
  if (!gameOver) statusEl.textContent = paused ? (everStarted ? t.paused : t.ready) : t.play;
}

function resetStats() {
  score = 0;
  scoreEl.textContent = 0;
  stopTimer();
  elapsedMs = 0;
  timeEl.textContent = '00:00';
}

function init() {
  subtitleEl = document.getElementById('snake-subtitle');
  statusEl = document.getElementById('snake-status');
  boardEl = document.getElementById('snake-board');
  scoreEl = document.getElementById('snake-score');
  timeEl = document.getElementById('snake-time');
  bestEl = document.getElementById('snake-best');
  btnNew = document.getElementById('snake-new');
  btnPause = document.getElementById('snake-pause');
  footerEl = document.getElementById('snake-footer');

  btnNew.addEventListener('click', () => startRound());
  btnPause.addEventListener('click', () => togglePause());
  document.addEventListener('keydown', onKey);
  boardEl.addEventListener('touchstart', onTouchStart, { passive: true });
  boardEl.addEventListener('touchend', onTouchEnd);

  onLanguageChange(() => { refreshText(); });

  startRound();
}

export default { init, refreshText, resetStats };
