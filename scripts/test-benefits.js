const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const catalogContext = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/benefits-data.js'), 'utf8'), catalogContext);
const catalog = catalogContext.window.STUDENTHUB_BENEFITS;
function assertBahdiniVariants(value, location = 'STUDENTHUB_BENEFITS') {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertBahdiniVariants(entry, `${location}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;
  if (Object.hasOwn(value, 'ar') && Object.hasOwn(value, 'en')) {
    assert.ok(value.ku, `${location} has Bahdini Kurdish copy`);
    return;
  }
  Object.entries(value).forEach(([key, entry]) => assertBahdiniVariants(entry, `${location}.${key}`));
}
assertBahdiniVariants(catalog);
const translationContext = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/translations.js'), 'utf8'), translationContext);
const allTranslations = translationContext.window.STUDENTHUB_TRANSLATIONS;
assertBahdiniVariants(allTranslations.data, 'translations.data');
const dictionary = translationContext.window.STUDENTHUB_TRANSLATIONS.ui;
for (const [section, records] of Object.entries(allTranslations.data || {})) {
  for (const [id, fields] of Object.entries(records)) {
    for (const [field, value] of Object.entries(fields)) {
      const entries = Array.isArray(value) ? value : [value];
      for (const [index, entry] of entries.entries()) {
        if (entry === '') continue;
        assert.ok(entry && typeof entry === 'object' && entry.ku, `translations.data.${section}.${id}.${field}${Array.isArray(value) ? `[${index}]` : ''} has a Bahdini variant`);
      }
    }
  }
}
const i18nRuntimeSource = fs.readFileSync(path.join(root, 'js/i18n.js'), 'utf8');
function loadI18nRuntime(pathname, initialStorage = {}) {
  const values = new Map(Object.entries(initialStorage));
  const document = {
    documentElement: { dataset: {} },
    addEventListener() {},
    dispatchEvent() {},
    title: ''
  };
  const window = {
    STUDENTHUB_TRANSLATIONS: translationContext.window.STUDENTHUB_TRANSLATIONS,
    location: { pathname },
    localStorage: {
      getItem(key) { return values.get(key) ?? null; },
      setItem(key, value) { values.set(key, value); },
      removeItem(key) { values.delete(key); }
    }
  };
  vm.runInNewContext(i18nRuntimeSource, {
    window,
    document,
    CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init.detail; } }
  });
  return { i18n: window.StudentHubI18n, document, values };
}
const aboutI18n = loadI18nRuntime('/about.html', { studenthubLanguage: 'en' });
aboutI18n.i18n.setLanguage('ku');
assert.equal(aboutI18n.document.documentElement.lang, 'ku-Arab', 'Bahdini uses its Arabic-based language tag');
assert.equal(aboutI18n.document.documentElement.dir, 'rtl', 'Bahdini displays right to left');
assert.equal(aboutI18n.i18n.t('about.heroTitle'), dictionary['about.heroTitle'].ku, 'Bahdini About copy resolves at runtime');
assert.equal(aboutI18n.document.title, `StudentHub - ${dictionary['pageTitle.about'].ku}`, 'the About page title switches to Bahdini');
assert.equal(aboutI18n.values.get('studenthubLanguage'), 'ku', 'Bahdini is saved as the site-wide language');
assert.equal(aboutI18n.values.has('studenthubAboutLanguage'), false, 'the former About-only language preference is removed');
aboutI18n.i18n.setLanguage('ar');
assert.equal(aboutI18n.values.get('studenthubLanguage'), 'ar', 'switching back updates the site-wide language');
const homeI18n = loadI18nRuntime('/index.html', { studenthubLanguage: 'en' });
homeI18n.i18n.setLanguage('ku');
assert.equal(homeI18n.i18n.getLanguage(), 'ku', 'Bahdini can be selected on the homepage');
assert.equal(homeI18n.document.documentElement.dir, 'rtl', 'the homepage uses RTL in Bahdini');
assert.equal(homeI18n.values.get('studenthubLanguage'), 'ku', 'Bahdini persists globally from the homepage');
const persistedHomeI18n = loadI18nRuntime('/transportation.html', { studenthubLanguage: 'ku' });
assert.equal(persistedHomeI18n.i18n.getLanguage(), 'ku', 'Bahdini is restored on another page from the global language preference');
assert.equal(persistedHomeI18n.document.documentElement.lang, 'ku-Arab', 'every page exposes the Bahdini Arabic-script language tag');
const migratedAboutI18n = loadI18nRuntime('/about.html', { studenthubLanguage: 'en', studenthubAboutLanguage: 'ku' });
assert.equal(migratedAboutI18n.i18n.getLanguage(), 'ku', 'a previously saved About-page Kurdish choice is migrated to global language preference');
assert.equal(migratedAboutI18n.values.get('studenthubLanguage'), 'ku', 'the migrated Kurdish choice persists globally');
assert.equal(migratedAboutI18n.values.has('studenthubAboutLanguage'), false, 'the legacy About-only language setting is removed after migration');
const overviewHtml = fs.readFileSync(path.join(root, 'benefits.html'), 'utf8');
const homepageHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const dealsSource = fs.readFileSync(path.join(root, 'js/data.js'), 'utf8');
const homepageServicesSource = fs.readFileSync(path.join(root, 'js/home-offers.js'), 'utf8');
const detailSource = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');
const navigationSource = fs.readFileSync(path.join(root, 'js/navigation.js'), 'utf8');
const i18nSource = fs.readFileSync(path.join(root, 'js/i18n.js'), 'utf8');
const aboutHtml = fs.readFileSync(path.join(root, 'about.html'), 'utf8');
assert.doesNotMatch(homepageHtml, /<h[1-6][^>]*>\s*Offers\s*<\/h[1-6]>/i, 'the standalone Offers heading is removed from the cafe section');
assert.match(homepageHtml, /data-home-local-offer data-home-offer-id="7"/, 'the third homepage card uses the restaurant offer record');
assert.match(homepageHtml, /data-home-local-offer data-home-offer-id="8"[\s\S]*?assets\/images\/Y5cafe\.png/, 'the fourth homepage offer card uses the Y5 cafe image');
assert.match(homepageHtml, /class="housing-card housing-card__link home-transport-card" href="transportation\.html"[\s\S]*?assets\/images\/unibus\.png/, 'the homepage has a matching transportation card linking to its directory');
for (const key of ['home.transportHeading', 'home.transportDescription', 'home.transportAction']) {
  assert.ok(dictionary[key]?.ar && dictionary[key]?.en, `${key} has Arabic and English copy`);
}
assert.equal(dictionary['home.housingHeading']?.en, 'Student services', 'the homepage housing-and-transport section is titled Student services');
assert.equal(dictionary['home.housingHeading']?.ar, 'خدمات الطلاب', 'the homepage services heading is translated into Arabic');
assert.match(homepageHtml, /assets\/images\/image\.JB\.png/, 'the third homepage card uses the requested restaurant image');
assert.match(dealsSource, /id:\s*7,\s*business_name:\s*"Demo Restaurant Offer",\s*category:\s*"restaurant",\s*image:\s*"assets\/images\/image\.JB\.png",\s*discount:\s*"20% OFF"/, 'the homepage restaurant offer is a 20% restaurant deal with its detail image');
assert.match(dealsSource, /id:\s*2,\s*business_name:\s*"Demo Cafe Aroma",\s*category:\s*"cafe",\s*image:\s*"assets\/images\/golverdi\.png"/, 'the cafe offer record uses its updated detail image');
assert.match(dealsSource, /id:\s*8,\s*business_name:\s*"Y5 coffee shop",\s*category:\s*"cafe",\s*image:\s*"assets\/images\/Y5cafe\.png",\s*discount:\s*"Special offer"/, 'the Y5 drinks offer uses the supplied image without inventing a discount value');
assert.match(fs.readFileSync(path.join(root, 'detail.html'), 'utf8'), /js\/benefits-data\.js/, 'the shared detail page loads student benefits records');
assert.match(fs.readFileSync(path.join(root, 'js/main.js'), 'utf8'), /section === 'books'/, 'book and study cards have a shared detail renderer');
for (const [file, section] of [['book-discounts.html', 'books'], ['digital-offers.html', 'offers'], ['software-guides.html', 'software']]) {
  assert.match(overviewHtml, new RegExp(`href="${file}"`), `${file} is linked from the overview`);
  assert.match(homepageHtml, new RegExp(`<a class="benefit-tile" href="${file}">`), `${file} is linked from the homepage benefits shortcut`);
  const pageHtml = fs.readFileSync(path.join(root, file), 'utf8');
  assert.match(pageHtml, new RegExp(`data-benefit-page="${section}"`), `${file} opens its own category directly`);
  assert.match(pageHtml, /href="benefits\.html"/, `${file} has a back link`);
  assert.match(pageHtml, /js\/navigation\.js/, `${file} loads shared navigation`);
  assert.ok(fs.existsSync(path.join(root, 'assets/images/StudentHubLogo.png')), `${file} logo image exists`);
}
const requiredOfferFields = ['id', 'name', 'provider', 'category', 'offerType', 'description', 'price', 'duration', 'expiration', 'eligibility', 'activation', 'information', 'lastVerified', 'verificationStatus'];
for (const offer of catalog.offers) {
  for (const field of requiredOfferFields) assert.ok(Object.hasOwn(offer, field), `${offer.id} includes ${field}`);
  assert.match(offer.activation, /^https:\/\//);
  assert.match(offer.information, /^https:\/\//);
}
const geminiOffer = catalog.offers.find((offer) => offer.id === 'google-ai-student-2026');
assert.ok(geminiOffer, 'Gemini student offer is present in the digital offers catalog');
assert.equal(geminiOffer.expiration, '2026-12-31');
assert.equal(geminiOffer.duration.en, '12 months.');
const fastlinkService = catalog.homeServices.find((service) => service.id === 'fastlink-student-internet');
assert.ok(fastlinkService, 'the illustrative Fastlink service has a dedicated detail record');
assert.equal(fastlinkService.verificationStatus, 'demo', 'the unverified Fastlink example is visibly marked as demo data');
assert.match(fastlinkService.price.en, /\$5/);
assert.match(homepageServicesSource, /assets\/images\/image\.fastLink\.png/);
assert.match(homepageServicesSource, /assets\/images\/image\.Visual\.png/);
assert.match(homepageServicesSource, /assets\/images\/imagegemeni\.png/);
assert.match(detailSource, /homeServices:\s*\{\s*data:\s*window\.STUDENTHUB_BENEFITS\?\.homeServices/);
assert.match(detailSource, /function serviceImage\(item\)/);
assert.match(navigationSource, /header\.append\(menuButton\)/, 'the language switch is no longer appended to the page header');
assert.match(navigationSource, /brandGroup\.append\(brand,\s*brandName,\s*languageSwitch\)/, 'the language switch sits beside the StudentHub name in the menu');
assert.match(navigationSource, /const kurdishOption = document\.createElement\('button'\)/, 'Bahdini is offered from the shared language menu');
assert.match(navigationSource, /kurdishOption\??\.addEventListener\('click',\s*\(\)\s*=>\s*chooseLanguage\('ku'\)\)/, 'the shared language control can select Bahdini');
assert.match(navigationSource, /site-nav__theme-switch/, 'the navigation drawer includes a night mode switch');
assert.match(navigationSource, /drawer\.append\(drawerHeader,\s*themeRow,\s*nav/, 'night mode is placed before the drawer navigation links');
assert.doesNotMatch(navigationSource, /site-nav__contact|navigation\.contact|navigation\.developedBy/, 'the menu does not include contact or developer text');
assert.equal(dictionary['navigation.contact'], undefined, 'the unused menu contact translation is removed');
assert.equal(dictionary['navigation.developedBy'], undefined, 'the unused menu developer translation is removed');
assert.match(navigationSource, /localStorage\.setItem\(themeStorageKey/, 'the selected theme is saved between visits');
assert.match(i18nSource, /localStorage\.getItem\('studenthubTheme'\)/, 'the saved theme is restored before the stylesheet is loaded');
assert.ok(dictionary['navigation.nightMode']?.ar && dictionary['navigation.nightMode']?.en, 'the night mode label is translated in Arabic and English');
const sharedCss = fs.readFileSync(path.join(root, 'css/style.css'), 'utf8');
const allKurdishKeys = [
  'pageDescription.about', 'pageTitle.about',
  'navigation.home', 'navigation.deals', 'navigation.benefits', 'navigation.transportation', 'navigation.housing',
  'navigation.about', 'navigation.label', 'navigation.open', 'navigation.close', 'navigation.drawer',
  'navigation.languageSelect', 'navigation.languageArabic', 'navigation.languageEnglish',
  'navigation.languageKurdish', 'navigation.nightMode',
  'about.heroEyebrow', 'about.heroTitle', 'about.heroText', 'about.aboutTitle', 'about.aboutText',
  'about.missionTitle', 'about.missionText', 'about.whyTitle', 'about.whyText', 'about.whyText2',
  'about.valuesTitle', 'about.valuesText', 'about.visionTitle', 'about.visionText', 'about.closing',
  'about.developmentTeamTitle', 'about.developmentTeamYoussefRole',
  'about.developmentTeamJoanRole', 'about.developmentTeamGulistanRole', 'about.developmentTeamRudyRole',
  'about.partnershipTitle',
  'about.partnershipSubtitle', 'about.partnershipIntro', 'about.partnershipDescription',
  'about.partnershipClosing', 'about.partnershipCta', 'about.partnershipReviewNote',
  'about.partnershipTypesLabel', 'about.partnerBookstores', 'about.partnerRestaurants',
  'about.partnerRetail', 'about.partnerGyms', 'about.partnerTraining', 'about.partnerOther'
];
for (const [key, pair] of Object.entries(dictionary)) {
  assert.ok(pair.ku, `${key} has Bahdini Kurdish copy`);
  const placeholders = (value) => [...String(value || '').matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
  assert.deepEqual(placeholders(pair.ku), placeholders(pair.en), `${key} preserves interpolation placeholders in Bahdini`);
}
for (const key of allKurdishKeys) {
  assert.ok(dictionary[key]?.ku, `${key} has Bahdini Kurdish copy`);
}
assert.match(aboutHtml, /<h2 id="developmentTeamHeading">فريق التطوير<\/h2>/, 'the About page names the development team section');
assert.match(sharedCss, /\.app-bar\s*\{[^}]*min-height:\s*calc\(64px \+ env\(safe-area-inset-top, 0px\)\)/s, 'the shared header expands into the device top safe area');
for (const page of fs.readdirSync(root).filter((file) => file.endsWith('.html'))) {
  assert.match(fs.readFileSync(path.join(root, page), 'utf8'), /<meta name="viewport" content="[^"]*viewport-fit=cover/, `${page} enables safe-area viewport layout`);
}
assert.match(sharedCss, /\.site-nav__theme-switch\[aria-checked="true"\]\s*>\s*span\s*\{\s*left:\s*23px/);
assert.match(sharedCss, /\[dir="rtl"\]\s+\.site-nav__theme-switch\s*>\s*span\s*\{\s*left:\s*23px/);
assert.match(sharedCss, /\[dir="rtl"\]\s+\.site-nav__theme-switch\[aria-checked="true"\]\s*>\s*span\s*\{\s*left:\s*3px/);
assert.match(aboutHtml, /class="about-acknowledgements"/, 'the About page includes an acknowledgements section');
for (const key of ['about.developmentTeamTitle', 'about.developmentTeamYoussefRole', 'about.developmentTeamJoanRole', 'about.developmentTeamGulistanRole', 'about.developmentTeamRudyRole']) {
  assert.ok(dictionary[key]?.ar && dictionary[key]?.en, `${key} has Arabic and English copy`);
}
assert.match(aboutHtml, /<strong>Youssef<\/strong> — <span>تجربة المستخدم \(UX\)<\/span>/, 'the development team lists Youssef with the UX role');
assert.match(aboutHtml, /<strong>Joan<\/strong> — <span>أفكار الميزات وتخطيط الأقسام<\/span>/, 'the development team lists Joan with feature and planning roles');
assert.match(aboutHtml, /<strong>Gulistan<\/strong> — <span>الشعار وتصميم الموقع<\/span>/, 'the development team lists Gulistan with logo and website design roles');
assert.match(aboutHtml, /<strong>Rudy<\/strong> — <span>تطوير الموقع وإدارة المشروع<\/span>/, 'the development team lists Rudy with website development and project management roles');
assert.match(homepageHtml, /class="home-more-card"/, 'the homepage includes a more-to-come card');
assert.match(homepageHtml, /<h2 id="homeMoreHeading">المزيد قادم قريبًا\s*<\/h2>/, 'the homepage more-to-come heading matches its Arabic translation key');
assert.match(homepageHtml, /<p>هناك المزيد قريبًا\. إذا أردت إضافة شيء هنا أو كانت لديك فكرة، فلا تتردد في التواصل معنا\.<\/p>/, 'the homepage more-to-come message matches its Arabic translation key');
assert.match(homepageHtml, /href="about\.html">عن StudentHub<\/a>/, 'the homepage closing card links to About StudentHub');
assert.match(homepageHtml, /href="mailto:rodi123ehmed@gmail\.com\?subject=StudentHub%20idea"/, 'the homepage closing card provides a personal email contact link');
assert.match(aboutHtml, /href="mailto:rodi123ehmed@gmail\.com\?subject=StudentHub%20business%20listing%20inquiry"/, 'the About page business contact link uses the personal email');
assert.match(aboutHtml, /class="about-partnership__email"><a href="mailto:rodi123ehmed@gmail\.com">rodi123ehmed@gmail\.com<\/a><\/p>/, 'the personal email is displayed under the partnership contact button');
for (const key of ['home.moreHeading', 'home.moreDescription', 'home.aboutLink', 'home.contactIdea']) {
  assert.ok(dictionary[key]?.ar && dictionary[key]?.en, `${key} has Arabic and English copy`);
}
assert.doesNotMatch(aboutHtml, /about-developer-credit|Developed by Rudy Mohammed Saleh/, 'the About page does not display the separate developer credit');
assert.match(sharedCss, /html\[data-theme="dark"\]/, 'dark mode styles are defined for shared pages');
const requiredSoftwareFields = ['id', 'mark', 'name', 'category', 'description', 'systems', 'license', 'student', 'download', 'guide'];
for (const software of catalog.software) {
  for (const field of requiredSoftwareFields) assert.ok(Object.hasOwn(software, field), `${software.id} includes ${field}`);
  assert.match(software.download, /^https:\/\//);
  assert.match(software.guide, /^https:\/\//);
}
assert.ok(catalog.books.every((item) => item.id.startsWith('demo-')), 'all local book and study listings are visibly demo records');
for (const category of ['ai', 'productivity', 'cloud', 'developer', 'learning', 'design']) {
  assert.ok(catalog.offers.some((offer) => offer.categories.includes(category)), `digital offers cover ${category}`);
}
for (const category of ['programming', 'engineering', 'database', 'dataScience', 'multimedia', 'office', 'networking']) {
  assert.ok(catalog.software.some((software) => software.category === category), `software catalog covers ${category}`);
}
const benefitsCss = fs.readFileSync(path.join(root, 'css/style.css'), 'utf8');
assert.match(benefitsCss, /\.deals-directory__filters\s+\.chip\s*\{[\s\S]*?border-radius:\s*999px/);
assert.match(benefitsCss, /\.deals-directory__filters\s+\.chip\[aria-pressed="true"\]/, 'selected offer categories have a distinct active style');
assert.match(benefitsCss, /@media \(max-width:\s*600px\)\s*\{[\s\S]*?\.deals-directory__filters\s*\{[\s\S]*?flex-wrap:\s*nowrap[\s\S]*?overflow-x:\s*auto/);
assert.match(benefitsCss, /@media \(max-width: 479px\)[\s\S]*?\.benefit-results\s*\{\s*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
assert.match(benefitsCss, /@media \(min-width: 600px\)/);
assert.match(benefitsCss, /@media \(min-width: 900px\)/);
assert.match(benefitsCss, /\.benefit-card\s*\{[\s\S]*?min-width:\s*0/);

class Element {
  constructor() { this.dataset = {}; this.listeners = {}; this.value = ''; this.textContent = ''; this.attributes = {}; }
  addEventListener(type, callback) { this.listeners[type] = callback; }
  setAttribute(name, value) { this.attributes[name] = value; }
  set innerHTML(value) {
    this.html = value;
    this.buttons = [...value.matchAll(/data-filter="([^"]+)"/g)].map(([, filter]) => {
      const button = new Element();
      button.dataset.filter = filter;
      return button;
    });
  }
  get innerHTML() { return this.html || ''; }
  querySelectorAll(selector) {
    if (selector !== '[data-filter]') return [];
    return this.buttons || [];
  }
  clickFilter(filter) {
    const button = this.querySelectorAll('[data-filter]').find((item) => item.dataset.filter === filter);
    assert.ok(button, `Expected filter ${filter}`);
    button.listeners.click();
  }
}

function mount(section) {
  const elements = Object.fromEntries(['search', 'title', 'intro', 'searchLabel', 'filters', 'results', 'back'].map((key) => [key, new Element()]));
  elements.search.id = 'benefitSearch';
  const page = {
    dataset: { benefitPage: section },
    querySelector(selector) {
      return ({ '[data-benefit-title]': elements.title, '[data-benefit-intro]': elements.intro, '[data-benefit-search-label]': elements.searchLabel,
        '[data-benefit-filters]': elements.filters, '[data-benefit-results]': elements.results, '.benefit-back': elements.back })[selector] || null;
    }
  };
  const callbacks = [];
  let language = 'ar';
  const i18n = {
    t(key) { return dictionary[key]?.[language] || key; },
    getLanguage() { return language; },
    onChange(callback) { callbacks.push(callback); }
  };
  const document = { querySelector: () => page, getElementById: () => elements.search, addEventListener() {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'js/benefits.js'), 'utf8'), { document, window: { StudentHubI18n: i18n, STUDENTHUB_BENEFITS: catalog }, URL, console });
  return { elements, i18n, callbacks, setLanguage(next) { language = next; callbacks.forEach((callback) => callback()); } };
}

function cardCount(html) { return (html.match(/class="benefit-card"/g) || []).length; }

const books = mount('books');
assert.equal(cardCount(books.elements.results.innerHTML), catalog.books.length);
books.elements.filters.clickFilter('study');
assert.equal(cardCount(books.elements.results.innerHTML), 1);
assert.match(books.elements.results.innerHTML, /مكتبة ومساحة دراسة/);

const offers = mount('offers');
offers.elements.filters.clickFilter('cloud');
assert.equal(cardCount(offers.elements.results.innerHTML), 2);
offers.elements.filters.clickFilter('learning');
assert.equal(cardCount(offers.elements.results.innerHTML), 2);
offers.elements.search.value = 'Educative';
offers.elements.search.listeners.input();
assert.equal(cardCount(offers.elements.results.innerHTML), 1);
assert.match(offers.elements.results.innerHTML, /Educative/);

const software = mount('software');
assert.equal(cardCount(software.elements.results.innerHTML), catalog.software.length);
software.elements.filters.clickFilter('engineering');
assert.equal(cardCount(software.elements.results.innerHTML), 1);
assert.match(software.elements.results.innerHTML, /AutoCAD/);
software.elements.search.value = 'not a real program';
software.elements.search.listeners.input();
assert.equal(cardCount(software.elements.results.innerHTML), 0);
assert.match(software.elements.results.innerHTML, /لم يتم العثور على نتائج/);
software.elements.search.value = 'general-purpose';
software.elements.filters.clickFilter('all');
assert.equal(cardCount(software.elements.results.innerHTML), 1);
software.elements.search.value = '';
software.elements.search.listeners.input();
software.elements.filters.clickFilter('dataScience');
assert.equal(cardCount(software.elements.results.innerHTML), 1);
assert.match(software.elements.results.innerHTML, /JupyterLab/);
software.setLanguage('en');
assert.equal(software.elements.title.textContent, 'Software download guides');
software.setLanguage('ar');
assert.equal(software.elements.title.textContent, 'أدلة تنزيل البرامج');

console.log('Benefits behavior checks passed: book, offer and software filters; search; empty state; Arabic/English rerender.');
