import { T, onLanguageChange } from './i18n.js';

const OWNER = 'Marco Scattolin';

export function renderFooter({ mount = document.getElementById('app-footer') } = {}) {
  if (!mount) return;
  function render() {
    const year = new Date().getFullYear();
    const t = T().legal || {};
    mount.innerHTML = `
      <div class="app-footer">
        <nav class="footer-links">
          <a href="/legal/privacy/" data-i18n="legal.privacyLink">${t.privacyLink || 'Privacy'}</a>
          <span class="footer-sep">·</span>
          <button type="button" class="footer-link-btn" id="manage-consent" data-i18n="legal.manageConsent">${t.manageConsent || 'Manage cookie preferences'}</button>
        </nav>
        <div class="footer-copy">© ${year} ${OWNER}</div>
      </div>
    `;
    const btn = mount.querySelector('#manage-consent');
    if (btn) btn.addEventListener('click', openConsentDialog);
  }
  render();
  onLanguageChange(render);
}

function openConsentDialog() {
  if (window.googlefc && window.googlefc.callbackQueue) {
    window.googlefc.callbackQueue.push({
      'CONSENT_DATA_READY': () => {
        if (window.googlefc.showRevocationMessage) {
          window.googlefc.showRevocationMessage();
        }
      }
    });
  }
}
