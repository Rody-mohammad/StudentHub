(() => {
  try {
    document.documentElement.dataset.theme = window.localStorage.getItem('studenthubTheme') === 'dark' ? 'dark' : 'light';
  } catch {
    document.documentElement.dataset.theme = 'light';
  }

  const translations = window.STUDENTHUB_TRANSLATIONS || { ui: {}, data: {} };
  const storageKey = 'studenthubLanguage';
  const aboutLanguageStorageKey = 'studenthubAboutLanguage';
  const isAboutPage = window.location.pathname.split('/').pop() === 'about.html';
  const aliases = new Map();
  const staticText = new Map();
  const staticAttributes = new Map();
  const subscribers = new Set();
  const dynamicContentSelector = [
    '#siteNavDrawer', '#cardContainer', '#housingResults', '#universityCategories', '#housingCount',
    '[data-benefit-filters]', '[data-benefit-types]', '[data-benefit-results]',
    '[data-home-local-offer]', '[data-home-offers-carousel]', '[data-home-service-showcase]',
    '[data-home-upcoming-events]', '#eventsFeatured', '#eventsResults', '#eventsCount', '.home-gemini-offer'
  ].join(', ');
  const pageTitleKeys = {
    'index.html': 'pageTitle.home', 'about.html': 'pageTitle.about', 'deals.html': 'pageTitle.deals',
    'benefits.html': 'pageTitle.benefits', 'housing.html': 'pageTitle.housing',
    'transportation.html': 'pageTitle.transportation', 'detail.html': 'pageTitle.detail',
    'events.html': 'pageTitle.events',
    'gym-offers.html': 'pageTitle.gymOffers', 'restaurant-offers.html': 'pageTitle.restaurantOffers',
    'housing-details.html': 'pageTitle.housingDetails', 'transport-zakho.html': 'pageTitle.transportZakho',
    'transport-external.html': 'pageTitle.transportExternal', 'book-discounts.html': 'pageTitle.bookDiscounts',
    'digital-offers.html': 'pageTitle.digitalOffers', 'software-guides.html': 'pageTitle.softwareGuides'
  };

  Object.entries(translations.ui).forEach(([key, value]) => {
    if (value.ar) aliases.set(value.ar.trim(), key);
    if (value.en) aliases.set(value.en.trim(), key);
    if (value.ku) aliases.set(value.ku.trim(), key);
  });

  let language = 'ar';
  try {
    const saved = window.localStorage.getItem(storageKey);
    const savedAboutLanguage = window.localStorage.getItem(aboutLanguageStorageKey);
    if (isAboutPage && savedAboutLanguage === 'ku' && saved !== 'ku') {
      language = 'ku';
      window.localStorage.setItem(storageKey, language);
      window.localStorage.removeItem(aboutLanguageStorageKey);
    } else if (saved === 'ar' || saved === 'en' || saved === 'ku') language = saved;
  } catch { /* Keep Arabic as the default when storage is unavailable. */ }

  function keyValue(key, lang = language, fallback = '') {
    const pair = translations.ui[key];
    if (pair && typeof pair[lang] === 'string' && pair[lang]) return pair[lang];
    if (lang === 'ku' && pair && typeof pair.en === 'string' && pair.en) return pair.en;
    if (pair && typeof pair.ar === 'string' && pair.ar) return pair.ar;
    if (fallback) return fallback;
    console.warn(`[i18n] Missing translation key: ${key}`);
    return '';
  }

  function interpolate(value, params) {
    return value.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? ''));
  }

  function t(key, params = {}, fallback = '') {
    const value = keyValue(key, language, fallback);
    return interpolate(value, params);
  }

  function data(section, item, field, index) {
    const itemTranslations = translations.data?.[section]?.[item.id];
    const value = itemTranslations?.[field];
    if (Array.isArray(value)) {
      const translated = value[index];
      if (translated && typeof translated === 'object') return translated[language] ?? translated.en ?? item[field]?.[index] ?? '';
      if (language === 'ar') return translated ?? item[field]?.[index] ?? '';
      return item[field]?.[index] ?? '';
    }
    if (value && typeof value === 'object') return value[language] ?? value.en ?? '';
    if (language === 'ar' && typeof value === 'string') return value;
    const original = item[field];
    if (Array.isArray(original)) return original[index] ?? '';
    if (typeof original === 'string' || typeof original === 'number') return String(original);
    return '';
  }

  const categoryKeys = {
    All: 'filters.all', restaurant: 'category.restaurant', cafe: 'category.cafe',
    gym: 'category.gym', shop: 'category.shop', other: 'category.other',
    'health-medical': 'category.healthMedical',
    'AI tools': 'category.aiTools', Development: 'category.development', Cloud: 'category.cloud',
    Productivity: 'category.productivity', Design: 'category.design', Single: 'category.single',
    Shared: 'category.shared', Apartment: 'category.apartment', Bus: 'category.bus',
    Taxi: 'category.taxi', Shuttle: 'category.shuttle', Free: 'benefit.free',
    Minibus: 'category.minibus', 'Shared taxi': 'category.sharedTaxi',
    deals: 'category.deals', benefits: 'category.benefits', housing: 'category.housing',
    transportation: 'category.transportation',
    events: 'pageTitle.events',
    conferences: 'events.category.conferences', exhibitions: 'events.category.exhibitions',
    university: 'events.category.university', competitions: 'events.category.competitions',
    sports: 'events.category.sports', workshops: 'events.category.workshops',
    volunteering: 'events.category.volunteering',
    'Free plan': 'benefit.freePlan', 'Student discount': 'benefit.studentDiscount', Trial: 'benefit.trial',
    Internet: 'home.categoryConnectivity'
  };

  function category(value) {
    const key = categoryKeys[value];
    return key ? t(key) : value;
  }

  function rememberStaticContent() {
    if (!document.body) return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || /^(SCRIPT|STYLE|NOSCRIPT|SVG)$/i.test(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (parent.closest(dynamicContentSelector)) return NodeFilter.FILTER_REJECT;
        return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    let node;
    while ((node = walker.nextNode())) {
      const source = node.nodeValue.trim();
      const key = aliases.get(source);
      if (key) staticText.set(node, { key, leading: node.nodeValue.slice(0, node.nodeValue.indexOf(source)), trailing: node.nodeValue.slice(node.nodeValue.indexOf(source) + source.length) });
      else if (/\p{Script=Arabic}/u.test(source)) console.warn(`[i18n] Unmapped Arabic text: ${source}`);
    }

    document.querySelectorAll('body *, meta[name="description"]').forEach((element) => {
      if (element.closest?.(dynamicContentSelector)) return;
      ['aria-label', 'alt', 'title', 'placeholder', 'content'].forEach((attribute) => {
        if (!element.hasAttribute(attribute)) return;
        const source = element.getAttribute(attribute).trim();
        const key = aliases.get(source);
        if (key) {
          if (!staticAttributes.has(attribute)) staticAttributes.set(attribute, new Map());
          staticAttributes.get(attribute).set(element, { key });
        }
        else if (/\p{Script=Arabic}/u.test(source)) console.warn(`[i18n] Unmapped ${attribute}: ${source}`);
      });
    });
  }

  function applyStaticContent() {
    staticText.forEach(({ key, leading, trailing }, node) => {
      if (!node.isConnected) return;
      node.nodeValue = `${leading}${keyValue(key)}${trailing}`;
    });
    staticAttributes.forEach((elements, attribute) => elements.forEach(({ key }, element) => {
      if (element.isConnected) element.setAttribute(attribute, keyValue(key));
    }));
  }

  function updatePageTitle() {
    const file = window.location.pathname.split('/').pop() || 'index.html';
    const key = pageTitleKeys[file] || 'pageTitle.home';
    document.title = `StudentHub - ${t(key)}`;
  }

  function updateRootLanguage() {
    document.documentElement.lang = language === 'ku' ? 'ku-Arab' : language;
    document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
  }

  function applyLanguage() {
    updateRootLanguage();
    applyStaticContent();
    updatePageTitle();
  }

  function setLanguage(nextLanguage) {
    if (!['ar', 'en', 'ku'].includes(nextLanguage)) return;
    language = nextLanguage;
    try {
      window.localStorage.setItem(storageKey, language);
      window.localStorage.removeItem(aboutLanguageStorageKey);
    } catch { /* The current page still updates. */ }
    applyLanguage();
    subscribers.forEach((callback) => callback(language));
    document.dispatchEvent(new CustomEvent('studenthub:languagechange', { detail: { language } }));
  }

  function onChange(callback) {
    if (typeof callback === 'function') subscribers.add(callback);
    return () => subscribers.delete(callback);
  }

  updateRootLanguage();
  document.addEventListener('DOMContentLoaded', () => {
    rememberStaticContent();
    applyLanguage();
  }, { once: true });

  window.StudentHubI18n = { t, data, category, setLanguage, onChange, getLanguage: () => language, dictionary: translations };
})();
