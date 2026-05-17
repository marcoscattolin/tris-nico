import { currentLang, T, onLanguageChange } from '../../shared/i18n.js';
import { WORDS, ALPHABETS } from '../../shared/words.js';
import { changeBackground } from '../../shared/backgrounds.js';

const MAX_ERRORS = 9;
const stats = { wins: 0, losses: 0 };
let currentWord = '', guessed = new Set(), errors = 0, gameOver = false;
let autoRestartTimer = null, lastWord = '';

let statusEl, wordEl, keyboardEl, errorsEl, winsEl, lossesEl, partEls, btnNew;

function pickWord() {
  const pool = WORDS[currentLang] || WORDS.it;
  let w;
  do { w = pool[Math.floor(Math.random() * pool.length)]; } while (w === lastWord && pool.length > 1);
  lastWord = w;
  return w.toUpperCase();
}

function renderWord() {
  wordEl.innerHTML = '';
  for (const ch of currentWord) {
    const span = document.createElement('span');
    span.className = 'letter-slot';
    if (guessed.has(ch)) { span.textContent = ch; span.classList.add('revealed'); }
    else span.textContent = ' ';
    wordEl.appendChild(span);
  }
}

function renderKeyboard() {
  keyboardEl.innerHTML = '';
  const alphabet = ALPHABETS[currentLang] || ALPHABETS.it;
  for (const letter of alphabet) {
    const btn = document.createElement('button');
    btn.className = 'key';
    btn.textContent = letter;
    btn.dataset.letter = letter;
    btn.addEventListener('click', () => onGuess(letter));
    if (guessed.has(letter)) {
      btn.disabled = true;
      btn.classList.add(currentWord.includes(letter) ? 'correct' : 'wrong');
    }
    keyboardEl.appendChild(btn);
  }
}

function renderHangman() {
  partEls.forEach((el, i) => el.classList.toggle('shown', i < errors));
  errorsEl.textContent = `${errors}/${MAX_ERRORS}`;
}

function onGuess(letter) {
  if (gameOver || guessed.has(letter)) return;
  guessed.add(letter);
  const btn = keyboardEl.querySelector(`[data-letter="${letter}"]`);
  if (btn) btn.disabled = true;
  if (currentWord.includes(letter)) {
    if (btn) btn.classList.add('correct');
    renderWord();
    if ([...currentWord].every(ch => guessed.has(ch))) endGame(true);
  } else {
    if (btn) btn.classList.add('wrong');
    errors++;
    renderHangman();
    if (errors >= MAX_ERRORS) endGame(false);
  }
}

function endGame(won) {
  gameOver = true;
  if (won) {
    statusEl.textContent = T().imp.won(currentWord);
    statusEl.className = 'status win';
    stats.wins++;
  } else {
    statusEl.textContent = T().imp.lost(currentWord);
    statusEl.className = 'status lose';
    stats.losses++;
    [...wordEl.children].forEach((slot, i) => { slot.textContent = currentWord[i]; slot.classList.add('revealed'); });
  }
  winsEl.textContent = stats.wins;
  lossesEl.textContent = stats.losses;
  keyboardEl.querySelectorAll('.key').forEach(b => b.disabled = true);
  autoRestartTimer = setTimeout(() => { autoRestartTimer = null; startRound(); }, 1000);
}

function startRound() {
  if (autoRestartTimer !== null) { clearTimeout(autoRestartTimer); autoRestartTimer = null; }
  currentWord = pickWord();
  guessed = new Set([currentWord[0], currentWord[currentWord.length - 1]]);
  errors = 0;
  gameOver = false;
  changeBackground();
  statusEl.textContent = T().imp.guess;
  statusEl.className = 'status';
  renderWord();
  renderKeyboard();
  renderHangman();
  if ([...currentWord].every(ch => guessed.has(ch))) endGame(true);
}

function refreshText() {
  const t = T().imp;
  document.getElementById('imp-subtitle').textContent = t.subtitle;
  btnNew.textContent = t.btnNew;
  document.getElementById('lbl-hm-wins').textContent = t.statWins;
  document.getElementById('lbl-hm-errors').textContent = t.statErrors;
  document.getElementById('lbl-hm-losses').textContent = t.statLosses;
  const alphLen = (ALPHABETS[currentLang] || ALPHABETS.it).length;
  document.getElementById('imp-footer').textContent = t.footer(alphLen);
  if (!gameOver) statusEl.textContent = t.guess;
}

function resetStats() {
  stats.wins = 0; stats.losses = 0;
  winsEl.textContent = 0; lossesEl.textContent = 0;
}

function init() {
  statusEl = document.getElementById('hm-status');
  wordEl = document.getElementById('hm-word');
  keyboardEl = document.getElementById('hm-keyboard');
  errorsEl = document.getElementById('hm-errors');
  winsEl = document.getElementById('hm-wins');
  lossesEl = document.getElementById('hm-losses');
  partEls = [...document.querySelectorAll('#game-impiccato .part')];
  btnNew = document.getElementById('hm-new');

  document.addEventListener('keydown', (e) => {
    const ch = e.key.toUpperCase();
    const alphabet = ALPHABETS[currentLang] || ALPHABETS.it;
    if (alphabet.includes(ch)) onGuess(ch);
  });

  btnNew.addEventListener('click', () => startRound());

  onLanguageChange(() => {
    resetStats();
    refreshText();
    startRound();
  });

  startRound();
}

export default { init, refreshText, resetStats };
