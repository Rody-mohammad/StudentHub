const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const catalogContext = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/benefits-data.js'), 'utf8'), catalogContext);
const catalog = catalogContext.window.STUDENTHUB_BENEFITS;
const translationContext = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/translations.js'), 'utf8'), translationContext);
const dictionary = translationContext.window.STUDENTHUB_TRANSLATIONS.ui;
const overviewHtml = fs.readFileSync(path.join(root, 'benefits.html'), 'utf8');
const homepageHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const dealsSource = fs.readFileSync(path.join(root, 'js/data.js'), 'utf8');
assert.doesNotMatch(homepageHtml, /<h[1-6][^>]*>\s*Offers\s*<\/h[1-6]>/i, 'the standalone Offers heading is removed from the cafe section');
assert.match(homepageHtml, /data-home-local-offer data-home-offer-id="7"/, 'the third homepage card uses the restaurant offer record');
assert.match(homepageHtml, /assets\/images\/image\.JB\.png/, 'the third homepage card uses the requested restaurant image');
assert.match(dealsSource, /id:\s*7,\s*business_name:\s*"Demo Restaurant Offer",\s*category:\s*"restaurant",\s*discount:\s*"20% OFF"/, 'the homepage restaurant offer is a 20% restaurant deal');
assert.match(fs.readFileSync(path.join(root, 'detail.html'), 'utf8'), /js\/benefits-data\.js/, 'the shared detail page loads student benefits records');
assert.match(fs.readFileSync(path.join(root, 'js/main.js'), 'utf8'), /section === 'books'/, 'book and study cards have a shared detail renderer');
for (const [file, section] of [['book-discounts.html', 'books'], ['digital-offers.html', 'offers'], ['software-guides.html', 'software']]) {
  assert.match(overviewHtml, new RegExp(`href="${file}"`), `${file} is linked from the overview`);
  assert.match(homepageHtml, new RegExp(`<a class="benefit-tile" href="${file}">`), `${file} is linked from the homepage benefits shortcut`);
  const pageHtml = fs.readFileSync(path.join(root, file), 'utf8');
  assert.match(pageHtml, new RegExp(`data-benefit-page="${section}"`), `${file} opens its own category directly`);
  assert.match(pageHtml, /href="benefits\.html"/, `${file} has a back link`);
  assert.match(pageHtml, /js\/navigation\.js/, `${file} loads shared navigation`);
  assert.ok(fs.existsSync(path.join(root, 'assets/images/-5370780119330398362_121.jpg')), `${file} logo image exists`);
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
