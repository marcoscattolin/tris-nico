import { T, onLanguageChange } from '../../shared/i18n.js';
import { changeBackground } from '../../shared/backgrounds.js';

const SIZE = 4;
const ANIM_MS = 160;
const WIN_K = 10;             // arriva a N×10 = tabellina completa
const N_CHOICES = [2, 3, 4, 5, 6, 7, 8, 9];
// Spawn pesato: prevalentemente k bassi, qualche k medio-alto per evitare blocchi.
// Pesi cumulativi (somma = 30).
const SPAWN_WEIGHTS = [
  { k: 1, w: 8 },
  { k: 2, w: 7 },
  { k: 3, w: 5 },
  { k: 4, w: 4 },
  { k: 5, w: 3 },
  { k: 6, w: 2 },
  { k: 7, w: 1 }
];
const SPAWN_TOTAL = SPAWN_WEIGHTS.reduce((s, x) => s + x.w, 0);

function pickSpawnK() {
  let r = Math.random() * SPAWN_TOTAL;
  for (const { k, w } of SPAWN_WEIGHTS) {
    r -= w;
    if (r <= 0) return k;
  }
  return 1;
}

let N = 7;
let grid, tiles;
let nextTileId, score, best, maxMult, gameOver, won, moving;

let subtitleEl, statusEl, boardEl, scoreEl, bestEl, maxEl, btnNew, chipsEl, footerEl;
let bgEl, tilesLayerEl;

function bestKey() { return 'tabelline-best-' + N; }
function loadBest() { return parseInt(localStorage.getItem(bestKey()) || '0', 10); }

function setupBoard() {
  boardEl.innerHTML = '';
  bgEl = document.createElement('div');
  bgEl.className = 'tab-bg';
  for (let i = 0; i < SIZE * SIZE; i++) {
    const c = document.createElement('div');
    c.className = 'tab-bg-cell';
    bgEl.appendChild(c);
  }
  boardEl.appendChild(bgEl);
  tilesLayerEl = document.createElement('div');
  tilesLayerEl.className = 'tab-tiles';
  boardEl.appendChild(tilesLayerEl);
}

function emptyGrid() { return Array.from({ length: SIZE }, () => Array(SIZE).fill(null)); }

function positionTileEl(tile) {
  tile.el.style.setProperty('--r', tile.r);
  tile.el.style.setProperty('--c', tile.c);
}

function setTileContent(el, mult) {
  el.dataset.m = mult;
  el.innerHTML = `<span class="tab-tile-eq">${N}×${mult}</span><span class="tab-tile-val">${N * mult}</span>`;
}

function createTile(mult, r, c, animate = true) {
  const el = document.createElement('div');
  el.className = 'tab-tile';
  setTileContent(el, mult);
  el.style.setProperty('--r', r);
  el.style.setProperty('--c', c);
  if (animate) {
    el.classList.add('spawning');
    setTimeout(() => el.classList.remove('spawning'), 220);
  }
  tilesLayerEl.appendChild(el);
  const tile = { id: nextTileId++, mult, r, c, el };
  tiles.push(tile);
  grid[r][c] = tile;
  if (mult > maxMult) {
    maxMult = mult;
    if (maxEl) maxEl.textContent = N * maxMult;
  }
  return tile;
}

function spawnTile() {
  const empties = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (!grid[r][c]) empties.push([r, c]);
  if (!empties.length) return null;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  return createTile(pickSpawnK(), r, c);
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
        else if (target.mult === tile.mult && !target.mergedThisTurn) {
          mergeWith = target;
          nr = tr; nc = tc;
          break;
        } else break;
      }
      if (mergeWith) {
        grid[r][c] = null;
        mergeWith.mergedThisTurn = true;
        const newMult = mergeWith.mult + 1;
        gained += N * newMult;
        tile.r = nr; tile.c = nc;
        tile.consumed = true;
        consumed.push(tile);
        pendingMerges.push({ survivor: mergeWith, newMult });
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
  if (score > best) { best = score; localStorage.setItem(bestKey(), best); }
  scoreEl.textContent = score;
  bestEl.textContent = best;

  tiles.forEach(t => positionTileEl(t));

  moving = true;
  setTimeout(() => {
    pendingMerges.forEach(({ survivor, newMult }) => {
      survivor.mult = newMult;
      if (survivor.el) {
        setTileContent(survivor.el, newMult);
        survivor.el.classList.remove('merged');
        void survivor.el.offsetWidth;
        survivor.el.classList.add('merged');
      }
      if (newMult > maxMult) maxMult = newMult;
    });
    maxEl.textContent = N * maxMult;

    consumed.forEach(t => { if (t.el) t.el.remove(); });
    tiles = tiles.filter(t => !t.consumed);

    spawnTile();

    if (!won && maxMult >= WIN_K) {
      won = true;
      statusEl.textContent = T().tabelline.won(N, WIN_K, N * WIN_K);
      statusEl.className = 'status win';
    } else if (!canMove()) {
      gameOver = true;
      statusEl.textContent = T().tabelline.lost;
      statusEl.className = 'status lose';
    }

    moving = false;
  }, ANIM_MS);

  return true;
}

function canMove() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!grid[r][c]) return true;
      const m = grid[r][c].mult;
      if (r + 1 < SIZE && grid[r+1][c] && grid[r+1][c].mult === m) return true;
      if (c + 1 < SIZE && grid[r][c+1] && grid[r][c+1].mult === m) return true;
    }
  }
  return false;
}

function renderChips() {
  chipsEl.innerHTML = '';
  for (const n of N_CHOICES) {
    const b = document.createElement('button');
    b.className = 'tab-chip' + (n === N ? ' active' : '');
    b.textContent = '×' + n;
    b.addEventListener('click', () => {
      if (n === N) return;
      N = n;
      renderChips();
      startRound();
    });
    chipsEl.appendChild(b);
  }
}

function startRound() {
  setupBoard();
  grid = emptyGrid();
  tiles = [];
  nextTileId = 1;
  score = 0;
  maxMult = 1;
  gameOver = false;
  won = false;
  moving = false;
  best = loadBest();
  changeBackground();
  spawnTile();
  spawnTile();
  statusEl.textContent = T().tabelline.play(N);
  statusEl.className = 'status';
  scoreEl.textContent = 0;
  bestEl.textContent = best;
  maxEl.textContent = N * maxMult;
}

function refreshText() {
  const t = T().tabelline;
  subtitleEl.textContent = t.subtitle;
  btnNew.textContent = t.btnNew;
  document.getElementById('lbl-tab-score').textContent = t.statScore;
  document.getElementById('lbl-tab-best').textContent = t.statBest;
  document.getElementById('lbl-tab-max').textContent = t.statMax;
  footerEl.textContent = t.footer;
  if (!gameOver && !won) statusEl.textContent = t.play(N);
}

function resetStats() {
  score = 0;
  scoreEl.textContent = 0;
}

function init() {
  subtitleEl = document.getElementById('tab-subtitle');
  statusEl = document.getElementById('tab-status');
  boardEl = document.getElementById('tab-board');
  scoreEl = document.getElementById('tab-score');
  bestEl = document.getElementById('tab-best');
  maxEl = document.getElementById('tab-max');
  btnNew = document.getElementById('tab-new');
  chipsEl = document.getElementById('tab-chips');
  footerEl = document.getElementById('tab-footer');

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
    refreshText();
  });

  renderChips();
  startRound();
}

export default { init, refreshText, resetStats };
