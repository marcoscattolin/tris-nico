import { currentLang, T, onLanguageChange } from '../../shared/i18n.js';
import { changeBackground } from '../../shared/backgrounds.js';

const NUMS = 4;
const OPS = ['+', '-', '*', '/'];
const SYMBOL = { '+': '+', '-': '−', '*': '×', '/': '÷' };

const stats = { wins: 0, losses: 0, streak: 0, best: 0 };
let numbers = [];
let target = 0;
let slots = [];           // array di operatori scelti, lunghezza NUMS-1; null = vuoto
let selectedSlot = null;  // indice slot evidenziato (o null)
let gameOver = false;
let autoRestartTimer = null;

let subtitleEl, statusEl, exprEl, keysEl,
    clearBtn, newBtn, winsEl, lossesEl, bestEl, footerEl;

// Valuta a op1 b op2 c op3 d con precedenza standard (×÷ prima di +−).
// Ritorna null se c'è divisione per zero o per non-divisibile.
function evaluate(nums, ops) {
  const n = [...nums];
  const o = [...ops];
  for (let i = 0; i < o.length; ) {
    if (o[i] === '*' || o[i] === '/') {
      let r;
      if (o[i] === '*') r = n[i] * n[i + 1];
      else {
        if (n[i + 1] === 0) return null;
        if (n[i] % n[i + 1] !== 0) return null;
        r = n[i] / n[i + 1];
      }
      n.splice(i, 2, r);
      o.splice(i, 1);
    } else i++;
  }
  let res = n[0];
  for (let i = 0; i < o.length; i++) {
    res = o[i] === '+' ? res + n[i + 1] : res - n[i + 1];
  }
  return res;
}

function generatePuzzle() {
  for (let attempt = 0; attempt < 300; attempt++) {
    const nums = Array.from({ length: NUMS }, () => 1 + Math.floor(Math.random() * 9));
    const valid = [];
    for (const a of OPS) for (const b of OPS) for (const c of OPS) {
      const r = evaluate(nums, [a, b, c]);
      if (r !== null && Number.isInteger(r) && r >= 1 && r <= 99) {
        valid.push({ ops: [a, b, c], target: r });
      }
    }
    if (valid.length === 0) continue;
    // preferisci target raggiungibili da poche combinazioni (più sfida) ma non unico (frustrante).
    const groups = new Map();
    for (const v of valid) groups.set(v.target, (groups.get(v.target) || 0) + 1);
    const interesting = valid.filter(v => groups.get(v.target) >= 1 && groups.get(v.target) <= 6);
    const pool = interesting.length ? interesting : valid;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    // evita banalità: la soluzione contenga almeno un × o ÷, se possibile
    const richer = pool.filter(v => v.ops.includes('*') || v.ops.includes('/'));
    const finalPick = (richer.length && Math.random() < 0.7)
      ? richer[Math.floor(Math.random() * richer.length)]
      : chosen;
    numbers = nums;
    target = finalPick.target;
    return;
  }
  // fallback
  numbers = [2, 3, 4, 5];
  target = 14;
}

function renderExpression() {
  exprEl.innerHTML = '';
  exprEl.classList.remove('wrong', 'correct');
  for (let i = 0; i < numbers.length; i++) {
    const num = document.createElement('div');
    num.className = 'ops-num';
    num.textContent = numbers[i];
    exprEl.appendChild(num);
    if (i < numbers.length - 1) {
      const slot = document.createElement('div');
      slot.className = 'ops-slot' + (slots[i] ? ' filled' : '') + (selectedSlot === i ? ' selected' : '');
      slot.textContent = slots[i] ? SYMBOL[slots[i]] : '?';
      slot.addEventListener('click', () => onSlotClick(i));
      exprEl.appendChild(slot);
    }
  }
  const eq = document.createElement('div');
  eq.className = 'ops-eq';
  eq.textContent = '=';
  exprEl.appendChild(eq);
  const tgt = document.createElement('div');
  tgt.className = 'ops-target';
  tgt.textContent = target;
  exprEl.appendChild(tgt);
}

function renderKeys() {
  keysEl.innerHTML = '';
  for (const op of OPS) {
    const btn = document.createElement('button');
    btn.className = 'ops-key';
    btn.textContent = SYMBOL[op];
    btn.disabled = gameOver;
    btn.addEventListener('click', () => onKeyClick(op));
    keysEl.appendChild(btn);
  }
}

function onSlotClick(i) {
  if (gameOver) return;
  if (slots[i]) {
    // svuota e seleziona quello slot
    slots[i] = null;
    selectedSlot = i;
  } else {
    selectedSlot = (selectedSlot === i) ? null : i;
  }
  renderExpression();
}

function onKeyClick(op) {
  if (gameOver) return;
  let idx;
  if (selectedSlot !== null) {
    idx = selectedSlot;
  } else {
    idx = slots.findIndex(s => s === null);
    if (idx === -1) return;
  }
  slots[idx] = op;
  selectedSlot = null;
  renderExpression();
  if (slots.every(s => s !== null)) verify();
}

function verify() {
  const r = evaluate(numbers, slots);
  if (r === target) {
    gameOver = true;
    exprEl.classList.add('correct');
    stats.wins++;
    stats.streak++;
    if (stats.streak > stats.best) {
      stats.best = stats.streak;
      localStorage.setItem('ops-best', stats.best);
    }
    winsEl.textContent = stats.wins;
    bestEl.textContent = stats.best;
    showStatus(T().ops.won(slots.map(s => SYMBOL[s]).join(' ')), 'win');
    autoRestartTimer = setTimeout(() => { autoRestartTimer = null; startRound(); }, 1700);
  } else {
    exprEl.classList.add('wrong');
    const msg = r === null ? T().ops.divByZero : T().ops.notYet(r);
    showStatus(msg, 'lose');
    setTimeout(() => {
      if (gameOver) return;
      exprEl.classList.remove('wrong');
      showStatus(T().ops.play);
    }, 1100);
  }
}

function showStatus(text, cls) {
  statusEl.textContent = text;
  statusEl.className = 'status' + (cls ? ' ' + cls : '');
}

function clearAll() {
  if (gameOver) return;
  slots = new Array(NUMS - 1).fill(null);
  selectedSlot = null;
  exprEl.classList.remove('wrong', 'correct');
  renderExpression();
  showStatus(T().ops.play);
}

function skip() {
  if (autoRestartTimer !== null) { clearTimeout(autoRestartTimer); autoRestartTimer = null; }
  if (!gameOver) {
    stats.losses++;
    stats.streak = 0;
    lossesEl.textContent = stats.losses;
  }
  startRound();
}

function startRound() {
  if (autoRestartTimer !== null) { clearTimeout(autoRestartTimer); autoRestartTimer = null; }
  generatePuzzle();
  slots = new Array(NUMS - 1).fill(null);
  selectedSlot = null;
  gameOver = false;
  changeBackground();
  renderExpression();
  renderKeys();
  showStatus(T().ops.play);
}

function refreshText() {
  const t = T().ops;
  subtitleEl.textContent = t.subtitle;
  clearBtn.textContent = t.btnClear;
  newBtn.textContent = t.btnNew;
  document.getElementById('lbl-ops-wins').textContent = t.statWins;
  document.getElementById('lbl-ops-losses').textContent = t.statLosses;
  document.getElementById('lbl-ops-best').textContent = t.statBest;
  footerEl.textContent = t.footer;
  if (!gameOver) showStatus(t.play);
}

function resetStats() {
  stats.wins = 0; stats.losses = 0; stats.streak = 0;
  winsEl.textContent = 0; lossesEl.textContent = 0;
  stats.best = parseInt(localStorage.getItem('ops-best') || '0', 10);
  bestEl.textContent = stats.best;
}

function init() {
  subtitleEl = document.getElementById('ops-subtitle');
  statusEl = document.getElementById('ops-status');
  exprEl = document.getElementById('ops-expr');
  keysEl = document.getElementById('ops-keys');
  clearBtn = document.getElementById('ops-clear');
  newBtn = document.getElementById('ops-new');
  winsEl = document.getElementById('ops-wins');
  lossesEl = document.getElementById('ops-losses');
  bestEl = document.getElementById('ops-best');
  footerEl = document.getElementById('ops-footer');

  clearBtn.addEventListener('click', clearAll);
  newBtn.addEventListener('click', skip);

  onLanguageChange(() => {
    refreshText();
  });

  resetStats();
  startRound();
}

export default { init, refreshText, resetStats };
