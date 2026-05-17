import { T, onLanguageChange } from '../../shared/i18n.js';
import { changeBackground } from '../../shared/backgrounds.js';

const SIZE = 4;
const ANIM_MS = 160;
let grid;
let tiles;
let nextTileId, score, best, maxTile, gameOver, won, moving;

let subtitleEl, statusEl, boardEl, scoreEl, bestEl, maxEl, btnNew;
let bgEl, tilesLayerEl;

function setupBoard() {
  boardEl.innerHTML = '';
  bgEl = document.createElement('div');
  bgEl.className = 't2048-bg';
  for (let i = 0; i < SIZE * SIZE; i++) {
    const c = document.createElement('div');
    c.className = 't2048-bg-cell';
    bgEl.appendChild(c);
  }
  boardEl.appendChild(bgEl);
  tilesLayerEl = document.createElement('div');
  tilesLayerEl.className = 't2048-tiles';
  boardEl.appendChild(tilesLayerEl);
}

function emptyGrid() { return Array.from({ length: SIZE }, () => Array(SIZE).fill(null)); }

function positionTileEl(tile) {
  tile.el.style.setProperty('--r', tile.r);
  tile.el.style.setProperty('--c', tile.c);
}

function createTile(value, r, c, animate = true) {
  const el = document.createElement('div');
  el.className = 't2048-tile';
  el.dataset.v = value;
  el.textContent = value;
  el.style.setProperty('--r', r);
  el.style.setProperty('--c', c);
  if (animate) {
    el.classList.add('spawning');
    setTimeout(() => el.classList.remove('spawning'), 220);
  }
  tilesLayerEl.appendChild(el);
  const tile = { id: nextTileId++, value, r, c, el };
  tiles.push(tile);
  grid[r][c] = tile;
  return tile;
}

function spawnTile() {
  const empties = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (!grid[r][c]) empties.push([r, c]);
  if (!empties.length) return null;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  return createTile(Math.random() < 0.9 ? 2 : 4, r, c);
}

function move(dir) {
  if (gameOver || moving) return false;
  const dirVec = [[0,-1],[-1,0],[0,1],[1,0]][dir];
  const rs = (dir === 3) ? [3,2,1,0] : [0,1,2,3];
  const cs = (dir === 2) ? [3,2,1,0] : [0,1,2,3];

  tiles.forEach(t => { t.mergedThisTurn = false; });

  let moved = false;
  let gained = 0;
  const consumed = [];
  const pendingMerges = [];

  for (const r of rs) {
    for (const c of cs) {
      const tile = grid[r][c];
      if (!tile) continue;
      let nr = r, nc = c;
      let mergeWith = null;
      while (true) {
        const tr = nr + dirVec[0], tc = nc + dirVec[1];
        if (tr < 0 || tr >= SIZE || tc < 0 || tc >= SIZE) break;
        const target = grid[tr][tc];
        if (!target) { nr = tr; nc = tc; }
        else if (target.value === tile.value && !target.mergedThisTurn) {
          mergeWith = target;
          nr = tr; nc = tc;
          break;
        } else break;
      }
      if (mergeWith) {
        grid[r][c] = null;
        mergeWith.mergedThisTurn = true;
        const newValue = mergeWith.value * 2;
        gained += newValue;
        tile.r = nr; tile.c = nc;
        tile.consumed = true;
        consumed.push(tile);
        pendingMerges.push({ survivor: mergeWith, newValue });
        moved = true;
      } else if (nr !== r || nc !== c) {
        grid[r][c] = null;
        grid[nr][nc] = tile;
        tile.r = nr; tile.c = nc;
        moved = true;
      }
    }
  }

  if (!moved) return false;

  score += gained;
  if (score > best) { best = score; localStorage.setItem('t2048-best', best); }
  scoreEl.textContent = score;
  bestEl.textContent = best;

  tiles.forEach(t => positionTileEl(t));

  moving = true;
  setTimeout(() => {
    pendingMerges.forEach(({ survivor, newValue }) => {
      survivor.value = newValue;
      if (survivor.el) {
        survivor.el.dataset.v = newValue;
        survivor.el.textContent = newValue;
        survivor.el.classList.remove('merged');
        void survivor.el.offsetWidth;
        survivor.el.classList.add('merged');
      }
      if (newValue > maxTile) maxTile = newValue;
    });
    maxEl.textContent = maxTile;

    consumed.forEach(t => { if (t.el) t.el.remove(); });
    tiles = tiles.filter(t => !t.consumed);

    spawnTile();

    if (!won && maxTile >= 2048) { won = true; statusEl.textContent = T().t2048.won; statusEl.className = 'status win'; }
    else if (!canMove()) { gameOver = true; statusEl.textContent = T().t2048.lost; statusEl.className = 'status lose'; }

    moving = false;
  }, ANIM_MS);

  return true;
}

function canMove() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!grid[r][c]) return true;
      const v = grid[r][c].value;
      if (r + 1 < SIZE && grid[r+1][c] && grid[r+1][c].value === v) return true;
      if (c + 1 < SIZE && grid[r][c+1] && grid[r][c+1].value === v) return true;
    }
  }
  return false;
}

function startRound() {
  setupBoard();
  grid = emptyGrid();
  tiles = [];
  nextTileId = 1;
  score = 0;
  maxTile = 2;
  gameOver = false;
  won = false;
  moving = false;
  best = parseInt(localStorage.getItem('t2048-best') || '0', 10);
  changeBackground();
  spawnTile();
  spawnTile();
  statusEl.textContent = T().t2048.play;
  statusEl.className = 'status';
  scoreEl.textContent = 0;
  bestEl.textContent = best;
  maxEl.textContent = maxTile;
}

function refreshText() {
  const t = T().t2048;
  subtitleEl.textContent = t.subtitle;
  btnNew.textContent = t.btnNew;
  document.getElementById('lbl-t2048-score').textContent = t.statScore;
  document.getElementById('lbl-t2048-best').textContent = t.statBest;
  document.getElementById('lbl-t2048-max').textContent = t.statMax;
  document.getElementById('t2048-footer').textContent = t.footer;
  if (!gameOver && !won) statusEl.textContent = t.play;
}

function resetStats() {
  score = 0;
  scoreEl.textContent = 0;
}

function init() {
  subtitleEl = document.getElementById('t2048-subtitle');
  statusEl = document.getElementById('t2048-status');
  boardEl = document.getElementById('t2048-board');
  scoreEl = document.getElementById('t2048-score');
  bestEl = document.getElementById('t2048-best');
  maxEl = document.getElementById('t2048-max');
  btnNew = document.getElementById('t2048-new');

  document.addEventListener('keydown', (e) => {
    let dir = -1;
    if (e.key === 'ArrowLeft') dir = 0;
    else if (e.key === 'ArrowUp') dir = 1;
    else if (e.key === 'ArrowRight') dir = 2;
    else if (e.key === 'ArrowDown') dir = 3;
    if (dir >= 0) { e.preventDefault(); move(dir); }
  });

  let touchStart = null;
  boardEl.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  }, { passive: true });
  boardEl.addEventListener('touchend', (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    const absX = Math.abs(dx), absY = Math.abs(dy);
    touchStart = null;
    if (Math.max(absX, absY) < 20) return;
    let dir;
    if (absX > absY) dir = dx > 0 ? 2 : 0;
    else dir = dy > 0 ? 3 : 1;
    move(dir);
  }, { passive: true });

  btnNew.addEventListener('click', () => startRound());

  onLanguageChange(() => {
    resetStats();
    refreshText();
  });

  startRound();
}

export default { init, refreshText, resetStats };
