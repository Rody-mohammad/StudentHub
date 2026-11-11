/** Shared StudentHub navigation drawer and language control. */
(() => {
  const themeStorageKey = 'studenthubTheme';
  let darkMode = document.documentElement.dataset.theme === 'dark';

  const fallbackLinks = [
    ['index.html', 'الرئيسية'], ['deals.html', 'العروض'], ['benefits.html', 'المزايا'],
    ['transportation.html', 'النقل'], ['housing.html', 'السكن']
  ];
  const linkKeys = {
    'index.html': 'navigation.home', 'deals.html': 'navigation.deals',
    'benefits.html': 'navigation.benefits', 'transportation.html': 'navigation.transportation',
    'housing.html': 'navigation.housing', 'about.html': 'navigation.about'
  };
  const iconFiles = {
    'index.html': 'house', 'deals.html': 'badge-percent', 'benefits.html': 'graduation-cap',
    'transportation.html': 'bus', 'housing.html': 'building-2', 'about.html': 'info'
  };
  const icon = (name) => `<span class="lucide-icon lucide-icon--${name}" aria-hidden="true"></span>`;

  function initNavigation() {
    const header = document.querySelector('.app-bar');
    if (!header) return;

    const logoWrap = header.querySelector('.app-bar__logo-wrap');
    let homeLink = logoWrap?.parentElement?.matches('a.app-bar__home-link') ? logoWrap.parentElement : null;
    if (logoWrap && !homeLink) {
      homeLink = document.createElement('a');
      homeLink.className = 'app-bar__home-link';
      homeLink.href = 'index.html';
      homeLink.append(logoWrap);
      header.prepend(homeLink);
    }
    const oldNav = document.querySelector('.bottom-nav');
    const pageLinks = oldNav
      ? Array.from(oldNav.querySelectorAll('a[href]')).map((link) => link.cloneNode(true))
      : fallbackLinks.map(([href, label]) => {
          const link = document.createElement('a');
          link.href = href;
          const text = document.createElement('span');
          text.textContent = label;
          link.append(text);
          return link;
        });
    if (!pageLinks.some((link) => link.getAttribute('href') === 'about.html')) {
      const aboutLink = document.createElement('a');
      aboutLink.href = 'about.html';
      const aboutLabel = document.createElement('span');
      aboutLabel.textContent = window.StudentHubI18n?.t('navigation.about') || 'About StudentHub';
      aboutLink.append(aboutLabel);
      pageLinks.push(aboutLink);
    }

    const menuButton = document.createElement('button');
    menuButton.type = 'button';
    menuButton.className = 'app-bar__menu-button';
    menuButton.setAttribute('aria-label', window.StudentHubI18n?.t('navigation.open') || 'فتح قائمة التنقل');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-controls', 'siteNavDrawer');
    menuButton.innerHTML = icon('menu');

    const languageSwitch = document.createElement('div');
    languageSwitch.className = 'app-bar__language';
    languageSwitch.setAttribute('role', 'group');
    const kurdishOption = document.createElement('button');
    languageSwitch.setAttribute('aria-label', window.StudentHubI18n?.t('navigation.languageSelect') || 'Language');
    const englishOption = document.createElement('button');
    englishOption.type = 'button';
    englishOption.className = 'app-bar__language-option';
    englishOption.lang = 'en';
    englishOption.textContent = 'EN';
    const divider = document.createElement('span');
    divider.className = 'app-bar__language-divider';
    divider.setAttribute('aria-hidden', 'true');
    const arabicOption = document.createElement('button');
    arabicOption.type = 'button';
    arabicOption.className = 'app-bar__language-option';
    arabicOption.lang = 'ar';
    arabicOption.textContent = 'عربي';
    const kurdishDivider = document.createElement('span');
    kurdishDivider.className = 'app-bar__language-divider';
    kurdishDivider.setAttribute('aria-hidden', 'true');
    kurdishOption.type = 'button';
    kurdishOption.className = 'app-bar__language-option';
    kurdishOption.lang = 'ku-Arab';
    kurdishOption.textContent = 'کوردی';
    languageSwitch.append(englishOption, divider, arabicOption, kurdishDivider, kurdishOption);
    function chooseLanguage(language) {
      const i18n = window.StudentHubI18n;
      if (!i18n) return;
      homeLink?.setAttribute('aria-label', i18n.t('navigation.home'));
      i18n.setLanguage(language);
      const homepage = new URL('index.html', window.location.href);
      homepage.searchParams.set('welcome', '1');
      window.location.assign(homepage.href);
    }
    englishOption.addEventListener('click', () => chooseLanguage('en'));
    arabicOption.addEventListener('click', () => chooseLanguage('ar'));
    kurdishOption?.addEventListener('click', () => chooseLanguage('ku'));
    header.append(menuButton);

    const overlay = document.createElement('div');
    overlay.className = 'site-nav-overlay';
    overlay.id = 'siteNavOverlay';
    overlay.hidden = true;
    const drawer = document.createElement('div');
    drawer.className = 'site-nav-drawer';
    drawer.id = 'siteNavDrawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', window.StudentHubI18n?.t('navigation.drawer') || 'قائمة StudentHub');
    drawer.setAttribute('aria-hidden', 'true');

    const themeRow = document.createElement('div');
    themeRow.className = 'site-nav__theme';
    const themeLabel = document.createElement('span');
    themeLabel.className = 'site-nav__theme-label';
    themeLabel.id = 'siteNavThemeLabel';
    const themeIcon = document.createElement('span');
    themeIcon.className = 'site-nav__theme-icon';
    themeIcon.setAttribute('aria-hidden', 'true');
    themeIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z"/></svg>';
    const themeText = document.createElement('span');
    themeText.className = 'site-nav__theme-text';
    themeLabel.append(themeIcon, themeText);
    const themeButton = document.createElement('button');
    themeButton.type = 'button';
    themeButton.className = 'site-nav__theme-switch';
    themeButton.setAttribute('role', 'switch');
    themeButton.setAttribute('aria-labelledby', themeLabel.id);
    themeButton.setAttribute('aria-checked', String(darkMode));
    themeButton.innerHTML = '<span></span>';
    themeRow.append(themeLabel, themeButton);
    themeButton.addEventListener('click', () => {
      darkMode = !darkMode;
      document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
      themeButton.setAttribute('aria-checked', String(darkMode));
      try {
        window.localStorage.setItem(themeStorageKey, darkMode ? 'dark' : 'light');
      } catch { /* Theme still applies for this page when storage is unavailable. */ }
    });

    const drawerHeader = document.createElement('div');
    drawerHeader.className = 'site-nav__header';
    const brand = document.createElement('img');
    brand.className = 'site-nav__brand';
    brand.src = 'assets/images/StudentHubLogo.png';
    brand.alt = 'StudentHub';
    const brandName = document.createElement('span');
    brandName.className = 'site-nav__brand-name';
    brandName.textContent = 'StudentHub';
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'site-nav__close';
    closeButton.setAttribute('aria-label', window.StudentHubI18n?.t('navigation.close') || 'إغلاق قائمة التنقل');
    closeButton.innerHTML = icon('x');
    const brandGroup = document.createElement('div');
    brandGroup.className = 'site-nav__brand-group';
    languageSwitch.classList.add('site-nav__language');
    brandGroup.append(brand, brandName, languageSwitch);
    drawerHeader.append(brandGroup, closeButton);

    const nav = document.createElement('nav');
    nav.className = 'site-nav__items';
    nav.setAttribute('aria-label', window.StudentHubI18n?.t('navigation.label') || 'التنقل الرئيسي');
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    const section = new URLSearchParams(location.search).get('section');
    const benefitPages = ['book-discounts.html', 'digital-offers.html', 'software-guides.html'];
    const currentTarget = benefitPages.includes(currentPage) ? 'benefits.html'
      : currentPage === 'detail.html' && section === 'studentOffers' ? 'benefits.html'
        : currentPage === 'detail.html' && section === 'books' ? 'benefits.html'
          : currentPage === 'detail.html' && section === 'software' ? 'benefits.html'
            : currentPage === 'detail.html' && section ? `${section}.html` : currentPage;
    pageLinks.forEach((link) => {
      link.classList.remove('nav-item');
      link.classList.add('site-nav__link');
      const image = link.querySelector('svg, img, .lucide-icon');
      const iconName = iconFiles[link.getAttribute('href')];
      if (iconName) {
        const fragment = document.createRange().createContextualFragment(icon(iconName));
        if (image) image.replaceWith(fragment);
        else link.prepend(fragment);
      }
      const active = link.getAttribute('href') === currentTarget;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
      nav.append(link);
    });

    drawer.append(drawerHeader, themeRow, nav);
    overlay.append(drawer);
    document.body.append(overlay);

    function updateNavigationText() {
      const i18n = window.StudentHubI18n;
      if (!i18n) return;
      pageLinks.forEach((link) => {
        const key = linkKeys[link.getAttribute('href')];
        const label = link.querySelector('span:not(.lucide-icon)');
        if (key && label) label.textContent = i18n.t(key);
        else if (key && !link.querySelector('.lucide-icon')) link.textContent = i18n.t(key);
      });
      menuButton.setAttribute('aria-label', i18n.t(menuButton.getAttribute('aria-expanded') === 'true' ? 'navigation.close' : 'navigation.open'));
      closeButton.setAttribute('aria-label', i18n.t('navigation.close'));
      drawer.setAttribute('aria-label', i18n.t('navigation.drawer'));
      nav.setAttribute('aria-label', i18n.t('navigation.label'));
      themeText.textContent = i18n.t('navigation.nightMode');
      languageSwitch.setAttribute('aria-label', i18n.t('navigation.languageSelect'));
      const language = i18n.getLanguage();
      const en = language === 'en';
      const ku = language === 'ku';
      englishOption.classList.toggle('is-current', en);
      arabicOption.classList.toggle('is-current', !en && !ku);
      englishOption.setAttribute('aria-pressed', String(en));
      arabicOption.setAttribute('aria-pressed', String(!en && !ku));
      englishOption.setAttribute('aria-label', i18n.t('navigation.languageEnglish'));
      arabicOption.setAttribute('aria-label', i18n.t('navigation.languageArabic'));
      kurdishOption.classList.toggle('is-current', ku);
      kurdishOption.setAttribute('aria-pressed', String(ku));
      kurdishOption.setAttribute('aria-label', i18n.t('navigation.languageKurdish'));
    }
    updateNavigationText();
    window.StudentHubI18n?.onChange(updateNavigationText);
    if (oldNav) oldNav.remove();
    document.body.classList.add('nav-ready');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const navigationDelay = reducedMotion ? 0 : 180;
    document.body.classList.add('page-enter');
    let previousBodyOverflow = '';
    let previousHtmlOverflow = '';
    function closeDrawer({ restoreFocus = true } = {}) {
      if (overlay.hidden) return;
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', window.StudentHubI18n?.t('navigation.open') || 'فتح قائمة التنقل');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('nav-open');
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      overlay.classList.remove('is-open');
      window.setTimeout(() => { if (!overlay.classList.contains('is-open')) overlay.hidden = true; }, reducedMotion ? 0 : 200);
      if (restoreFocus) menuButton.focus();
    }
    function openDrawer() {
      overlay.hidden = false;
      window.requestAnimationFrame(() => overlay.classList.add('is-open'));
      previousBodyOverflow = document.body.style.overflow;
      previousHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.add('nav-open');
      menuButton.setAttribute('aria-expanded', 'true');
      menuButton.setAttribute('aria-label', window.StudentHubI18n?.t('navigation.close') || 'إغلاق قائمة التنقل');
      drawer.setAttribute('aria-hidden', 'false');
      closeButton.focus();
    }
    menuButton.addEventListener('click', () => menuButton.getAttribute('aria-expanded') === 'true' ? closeDrawer() : openDrawer());
    closeButton.addEventListener('click', () => closeDrawer());
    overlay.addEventListener('click', (event) => { if (event.target === overlay) closeDrawer(); });
    nav.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link) return;
      closeDrawer({ restoreFocus: false });
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
          (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      event.preventDefault();
      if (navigationDelay === 0) { window.location.assign(destination.href); return; }
      document.body.classList.remove('page-enter');
      document.body.classList.add('page-leaving');
      window.setTimeout(() => window.location.assign(destination.href), navigationDelay);
    });
    document.addEventListener('keydown', (event) => {
      if (overlay.hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); closeDrawer(); return; }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(drawer.querySelectorAll('a[href], button:not([disabled])'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!drawer.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initNavigation, { once: true });
  else initNavigation();
})();
