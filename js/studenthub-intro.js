(() => {
  const page = window.location.pathname.split('/').pop();
  if (page && page !== 'index.html') return;

  const storageKey = 'studenthubIntroShown';
  const replayForLanguageChange = new URLSearchParams(window.location.search).get('welcome') === '1';
  if (replayForLanguageChange) {
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('welcome');
    window.history.replaceState(window.history.state, '', cleanUrl.href);
  }
  let session;
  try {
    session = window.sessionStorage;
    if (!replayForLanguageChange && session.getItem(storageKey) === 'true') return;
  } catch {
    // Continue without session tracking when storage is unavailable.
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const overlay = document.createElement('div');
  overlay.className = 'studenthub-intro';
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'studenthub-intro__close';
  closeButton.setAttribute('aria-label', window.StudentHubI18n?.t('intro.close') || 'Close welcome message');
  closeButton.innerHTML = '<span class="lucide-icon lucide-icon--x" aria-hidden="true"></span>';

  const content = document.createElement('div');
  content.className = 'studenthub-intro__content';

  const brand = document.createElement('span');
  brand.className = 'studenthub-intro__brand';

  const headline = document.createElement('h1');
  headline.className = 'studenthub-intro__headline';

  const supporting = document.createElement('p');
  supporting.className = 'studenthub-intro__supporting';

  content.append(brand, headline, supporting);
  overlay.append(closeButton, content);

  let fadeTimer;
  let removeTimer;
  closeButton.addEventListener('click', () => {
    window.clearTimeout(fadeTimer);
    window.clearTimeout(removeTimer);
    overlay.remove();
  });

  function updateIntroLanguage() {
    const i18n = window.StudentHubI18n;
    if (!i18n) return;
    const currentLanguage = i18n.getLanguage();
    [brand, headline, supporting].forEach((element) => {
      element.lang = currentLanguage;
      element.dir = 'auto';
    });
    brand.textContent = i18n.t('intro.brand');
    headline.textContent = i18n.t('intro.headline');
    supporting.textContent = i18n.t('intro.supporting');
  }
  updateIntroLanguage();
  window.StudentHubI18n?.onChange(updateIntroLanguage);

  try { session?.setItem(storageKey, 'true'); } catch { /* Show the intro without session tracking. */ }
  document.body.append(overlay);

  window.requestAnimationFrame(() => overlay.classList.add('is-visible'));
  fadeTimer = window.setTimeout(() => overlay.classList.remove('is-visible'), 3550);
  removeTimer = window.setTimeout(() => overlay.remove(), 4000);
})();
