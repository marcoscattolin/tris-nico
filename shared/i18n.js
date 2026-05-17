import it from './lang/it.js';
import en from './lang/en.js';

export const I18N = { it, en };
export const SUPPORTED_LANGS = Object.keys(I18N);

const stored = localStorage.getItem('lang');
export let currentLang = stored && stored in I18N ? stored : 'it';

export function T() {
  return I18N[currentLang];
}

const listeners = new Set();

export function onLanguageChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function applyLanguage(lang) {
  if (!(lang in I18N)) lang = 'it';
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;
  const t = T();
  const titleEl = document.getElementById('title');
  if (titleEl) titleEl.textContent = t.title;
  const langLabelEl = document.getElementById('lang-label');
  if (langLabelEl) langLabelEl.textContent = t.langLabel;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const parts = key.split('.');
    let val = t;
    for (const p of parts) val = val?.[p];
    if (typeof val === 'string') el.textContent = val;
  });
  for (const fn of listeners) fn(lang);
}
