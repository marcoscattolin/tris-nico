import { T, onLanguageChange } from '../../shared/i18n.js';
import { changeBackground } from '../../shared/backgrounds.js';

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const CORNERS = [0,2,6,8];
const SIDES = [1,3,5,7];
const OPPOSITE_CORNER = { 0:8, 2:6, 6:2, 8:0 };

let board, currentPlayer, humanMark, aiMark, gameOver, humanStarts;
let autoRestartTimer = null;
const score = { you: 0, ai: 0, draws: 0 };

let cells, statusEl, btnHumanFirst, btnAiFirst, btnReset;

function start(humanFirst) {
  if (autoRestartTimer !== null) { clearTimeout(autoRestartTimer); autoRestartTimer = null; }
  humanStarts = humanFirst;
  board = Array(9).fill('');
  gameOver = false;
  changeBackground();
  if (humanFirst) {
    humanMark = 'X'; aiMark = 'O'; currentPlayer = humanMark;
    statusEl.textContent = T().tris.yourTurn(humanMark);
  } else {
    humanMark = 'O'; aiMark = 'X'; currentPlayer = aiMark;
    statusEl.textContent = T().tris.aiThinking;
  }
  statusEl.className = 'status';
  cells.forEach(c => { c.textContent = ''; c.disabled = false; c.classList.remove('x','o','win-line'); });
  if (!humanFirst) setTimeout(aiMove, 250);
}

function checkWinner(b) {
  for (const line of LINES) {
    const [a,c,d] = line;
    if (b[a] && b[a] === b[c] && b[c] === b[d]) return { winner: b[a], line };
  }
  if (b.every(v => v !== '')) return { winner: 'draw' };
  return null;
}

function placeMark(i, mark) {
  board[i] = mark;
  const cell = cells[i];
  cell.textContent = mark;
  cell.classList.add(mark.toLowerCase());
  cell.disabled = true;
}

function endGame(result) {
  gameOver = true;
  cells.forEach(c => c.disabled = true);
  if (result.winner === 'draw') {
    statusEl.textContent = T().tris.draw;
    statusEl.className = 'status draw';
    score.draws++;
  } else if (result.winner === humanMark) {
    statusEl.textContent = T().tris.youWon;
    statusEl.className = 'status win';
    score.you++;
  } else {
    statusEl.textContent = T().tris.aiWon;
    statusEl.className = 'status lose';
    score.ai++;
  }
  if (result.line) result.line.forEach(i => cells[i].classList.add('win-line'));
  document.getElementById('score-you').textContent = score.you;
  document.getElementById('score-ai').textContent = score.ai;
  document.getElementById('score-draws').textContent = score.draws;
  autoRestartTimer = setTimeout(() => { autoRestartTimer = null; start(humanStarts); }, 1000);
}

function onCellClick(e) {
  if (gameOver) return;
  const i = Number(e.currentTarget.dataset.i);
  if (board[i] !== '' || currentPlayer !== humanMark) return;
  placeMark(i, humanMark);
  const result = checkWinner(board);
  if (result) return endGame(result);
  currentPlayer = aiMark;
  statusEl.textContent = T().tris.aiThinking;
  setTimeout(aiMove, 280);
}

function aiMove() {
  if (gameOver) return;
  const i = chooseAiMove();
  placeMark(i, aiMark);
  const result = checkWinner(board);
  if (result) return endGame(result);
  currentPlayer = humanMark;
  statusEl.textContent = T().tris.yourTurn(humanMark);
}

function findWinningMove(b, player) {
  for (const [a,c,d] of LINES) {
    const arr = [b[a], b[c], b[d]];
    const p = arr.filter(x => x === player).length;
    const e = arr.filter(x => x === '').length;
    if (p === 2 && e === 1) return [a,c,d].find(idx => b[idx] === '');
  }
  return null;
}

function countOpenTwos(b, player) {
  let n = 0;
  for (const [a,c,d] of LINES) {
    const arr = [b[a], b[c], b[d]];
    const p = arr.filter(x => x === player).length;
    const o = arr.filter(x => x !== '' && x !== player).length;
    if (p === 2 && o === 0) n++;
  }
  return n;
}

function findForkMoves(b, player) {
  const moves = [];
  for (let i = 0; i < 9; i++) {
    if (b[i] !== '') continue;
    const copy = b.slice(); copy[i] = player;
    if (countOpenTwos(copy, player) >= 2) moves.push(i);
  }
  return moves;
}

function findThreatMoves(b, player) {
  const out = [];
  for (let i = 0; i < 9; i++) {
    if (b[i] !== '') continue;
    const copy = b.slice(); copy[i] = player;
    const blocks = [];
    for (const [a,c,d] of LINES) {
      const arr = [copy[a], copy[c], copy[d]];
      const p = arr.filter(x => x === player).length;
      const e = arr.filter(x => x === '').length;
      if (p === 2 && e === 1) blocks.push([a,c,d].find(idx => copy[idx] === ''));
    }
    if (blocks.length === 1) out.push({ move: i, forcedBlock: blocks[0] });
  }
  return out;
}

function chooseAiMove() {
  const me = aiMark, opp = humanMark;
  let m = findWinningMove(board, me);
  if (m !== null) return m;
  m = findWinningMove(board, opp);
  if (m !== null) return m;
  const myForks = findForkMoves(board, me);
  if (myForks.length > 0) return myForks[0];
  const oppForks = findForkMoves(board, opp);
  if (oppForks.length === 1) return oppForks[0];
  if (oppForks.length > 1) {
    const threats = findThreatMoves(board, me);
    for (const { move, forcedBlock } of threats) {
      if (!oppForks.includes(forcedBlock)) return move;
    }
    return oppForks[0];
  }
  if (board[4] === '') return 4;
  for (const c of CORNERS) {
    if (board[c] === opp && board[OPPOSITE_CORNER[c]] === '') return OPPOSITE_CORNER[c];
  }
  for (const c of CORNERS) if (board[c] === '') return c;
  for (const s of SIDES) if (board[s] === '') return s;
  return -1;
}

function refreshText() {
  const t = T().tris;
  document.getElementById('tris-subtitle').textContent = t.subtitle;
  btnHumanFirst.textContent = t.btnHumanFirst;
  btnAiFirst.textContent = t.btnAiFirst;
  btnReset.textContent = t.btnReset;
  document.getElementById('lbl-score-you').textContent = t.scoreYou;
  document.getElementById('lbl-score-draws').textContent = t.scoreDraws;
  document.getElementById('lbl-score-ai').textContent = t.scoreAi;
  document.getElementById('tris-footer').textContent = t.footer;
  if (gameOver) return;
  statusEl.textContent = (currentPlayer === humanMark) ? t.yourTurn(humanMark) : t.aiThinking;
}

function resetScores() {
  score.you = 0; score.ai = 0; score.draws = 0;
  document.getElementById('score-you').textContent = 0;
  document.getElementById('score-ai').textContent = 0;
  document.getElementById('score-draws').textContent = 0;
}

function init() {
  cells = [...document.querySelectorAll('#game-tris .cell')];
  statusEl = document.getElementById('status');
  btnHumanFirst = document.getElementById('btn-human-first');
  btnAiFirst = document.getElementById('btn-ai-first');
  btnReset = document.getElementById('btn-reset');

  cells.forEach(c => c.addEventListener('click', onCellClick));
  btnHumanFirst.addEventListener('click', () => {
    btnHumanFirst.classList.add('active');
    btnAiFirst.classList.remove('active');
    start(true);
  });
  btnAiFirst.addEventListener('click', () => {
    btnAiFirst.classList.add('active');
    btnHumanFirst.classList.remove('active');
    start(false);
  });
  btnReset.addEventListener('click', () => start(humanStarts));

  onLanguageChange(() => {
    resetScores();
    refreshText();
  });

  start(true);
}

export default { init, refreshText, resetScores, resetStats: resetScores };
