import { applyLanguage, currentLang, SUPPORTED_LANGS, T } from './i18n.js';

const LANG_LABELS = { it: 'Italiano', en: 'English' };

export function renderHeader({ mount = document.getElementById('app-header'), backHref = null, showLangSelect = false } = {}) {
  if (!mount) return;
  const back = backHref
    ? `<a class="back-link" href="${backHref}" data-i18n="menu.backToMenu">← Menu</a>`
    : '';
  const langRow = showLangSelect
    ? (() => {
        const options = SUPPORTED_LANGS
          .map(l => `<option value="${l}"${l === currentLang ? ' selected' : ''}>${LANG_LABELS[l] || l}</option>`)
          .join('');
        return `
          <div class="header-lang-row">
            <div class="lang-menu">
              <label for="lang-select" id="lang-label">${T().langLabel}</label>
              <select id="lang-select">${options}</select>
            </div>
          </div>`;
      })()
    : '';
  mount.innerHTML = `
    <div class="header-row">
      ${back}
      <h1 id="title">${T().title}</h1>
    </div>
    ${langRow}
  `;
  const sel = mount.querySelector('#lang-select');
  if (sel) sel.addEventListener('change', e => applyLanguage(e.target.value));
}
