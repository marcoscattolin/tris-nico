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
  if (window.googlefc && typeof window.googlefc.showRevocationMessage === 'function') {
    window.googlefc.showRevocationMessage();
    return;
  }
  if (window.googlefc) {
    window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
    window.googlefc.callbackQueue.push({
      CONSENT_API_READY: () => {
        if (window.googlefc && typeof window.googlefc.showRevocationMessage === 'function') {
          window.googlefc.showRevocationMessage();
        }
      }
    });
    return;
  }
  console.warn('[footer] Google Funding Choices CMP non caricato: window.googlefc è undefined. Su localhost il banner non viene servito; in produzione assicurati di aver pubblicato il messaggio GDPR in AdSense → Privacy & messaging.');
  const t = (T() && T().legal) || {};
  alert(t.cmpUnavailable || 'Il sistema di gestione consensi non è ancora caricato. Riprova tra qualche secondo o ricarica la pagina.');
}
