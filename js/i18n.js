(() => {
  const translations = window.STUDENTHUB_TRANSLATIONS || { ui: {}, data: {} };
  const storageKey = 'studenthubLanguage';
  const aliases = new Map();
  const staticText = new Map();
  const staticAttributes = new Map();
  const subscribers = new Set();
  const pageTitleKeys = {
    'index.html': 'pageTitle.home', 'about.html': 'pageTitle.about', 'deals.html': 'pageTitle.deals',
    'benefits.html': 'pageTitle.benefits', 'housing.html': 'pageTitle.housing',
    'transportation.html': 'pageTitle.transportation', 'detail.html': 'pageTitle.detail',
    'gym-offers.html': 'pageTitle.gymOffers', 'restaurant-offers.html': 'pageTitle.restaurantOffers',
    'housing-details.html': 'pageTitle.housingDetails', 'transport-zakho.html': 'pageTitle.transportZakho',
    'transport-external.html': 'pageTitle.transportExternal', 'book-discounts.html': 'pageTitle.bookDiscounts',
    'digital-offers.html': 'pageTitle.digitalOffers', 'software-guides.html': 'pageTitle.softwareGuides'
  };

  Object.entries(translations.ui).forEach(([key, value]) => {
    if (value.ar) aliases.set(value.ar.trim(), key);
    if (value.en) aliases.set(value.en.trim(), key);
  });

  let language = 'ar';
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === 'ar' || saved === 'en') language = saved;
  } catch { /* Keep Arabic as the default when storage is unavailable. */ }

  function keyValue(key, lang = language, fallback = '') {
    const pair = translations.ui[key];
    if (pair && typeof pair[lang] === 'string' && pair[lang]) return pair[lang];
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
    if (language === 'ar' && Array.isArray(value)) return value[index] ?? item[field]?.[index] ?? '';
    if (language === 'ar' && typeof value === 'string') return value;
    const original = item[field];
    if (Array.isArray(original)) return original[index] ?? '';
    if (typeof original === 'string' || typeof original === 'number') return String(original);
    return '';
  }

  const categoryKeys = {
    All: 'filters.all', restaurant: 'category.restaurant', cafe: 'category.cafe',
    gym: 'category.gym', shop: 'category.shop', other: 'category.other',
    'AI tools': 'category.aiTools', Development: 'category.development', Cloud: 'category.cloud',
    Productivity: 'category.productivity', Design: 'category.design', Single: 'category.single',
    Shared: 'category.shared', Apartment: 'category.apartment', Bus: 'category.bus',
    Taxi: 'category.taxi', Shuttle: 'category.shuttle', Free: 'benefit.free',
    Minibus: 'category.minibus', 'Shared taxi': 'category.sharedTaxi',
    deals: 'category.deals', benefits: 'category.benefits', housing: 'category.housing',
    transportation: 'category.transportation',
    'Free plan': 'benefit.freePlan', 'Student discount': 'benefit.studentDiscount', Trial: 'benefit.trial'
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
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }

  function applyLanguage() {
    updateRootLanguage();
    applyStaticContent();
    updatePageTitle();
  }

  function setLanguage(nextLanguage) {
    if (nextLanguage !== 'ar' && nextLanguage !== 'en') return;
    language = nextLanguage;
    try { window.localStorage.setItem(storageKey, language); } catch { /* The current page still updates. */ }
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
