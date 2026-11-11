const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/localization/translations.js'), 'utf8'), context);
const translations = context.window.STUDENTHUB_TRANSLATIONS;
const aliases = new Map();
const aliasConflicts = [];
for (const [key, pair] of Object.entries(translations.ui)) {
  for (const lang of ['ar', 'en', 'ku']) {
    const value = pair[lang];
    if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing ${lang} translation: ${key}`);
    if (lang === 'ku') continue;
    if (aliases.has(value) && aliases.get(value).key !== key) {
      const previous = aliases.get(value);
      if (previous.en !== pair.en || previous.ar !== pair.ar) aliasConflicts.push({ value, keys: [previous.key, key] });
    } else aliases.set(value, { key, ar: pair.ar, en: pair.en });
  }
}

const pageFiles = fs.readdirSync(root).filter((file) => file.endsWith('.html')).sort();
const requiredPages = ['index.html', 'about.html', 'deals.html', 'benefits.html', 'book-discounts.html', 'digital-offers.html', 'software-guides.html', 'housing.html', 'detail.html', 'gym-offers.html', 'restaurant-offers.html', 'transportation.html', 'transport-zakho.html', 'transport-external.html', 'housing-details.html', 'events.html'];
const missingPages = requiredPages.filter((file) => !pageFiles.includes(file));
const missingI18nScripts = pageFiles.filter((file) => {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  return !html.includes('js/localization/translations.js') || !html.includes('js/localization/i18n.js');
});
const missingTranslationKeyReferences = [];
for (const file of ['js/shared/catalog-pages.js', 'js/shared/navigation.js', 'js/pages/home/intro.js', 'js/pages/benefits/benefits.js', 'js/pages/events/events.js']) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of source.matchAll(/(?:\bt|\.t)\s*\(\s*['"]([^'"]+)['"]/g)) {
    if (!translations.ui[match[1]]) missingTranslationKeyReferences.push(`${file}:${match[1]}`);
  }
}
const requiredPageTitleKeys = ['pageTitle.home', 'pageTitle.about', 'pageTitle.deals', 'pageTitle.benefits', 'pageTitle.bookDiscounts', 'pageTitle.digitalOffers', 'pageTitle.softwareGuides', 'pageTitle.housing', 'pageTitle.transportation', 'pageTitle.detail', 'pageTitle.gymOffers', 'pageTitle.restaurantOffers', 'pageTitle.housingDetails', 'pageTitle.transportZakho', 'pageTitle.transportExternal', 'pageTitle.events'];
for (const key of requiredPageTitleKeys) if (!translations.ui[key]) missingTranslationKeyReferences.push(`page-title:${key}`);

const properNames = new Set(['Student', 'Hub', 'StudentHub', 'KFC', 'Subway', "McDonald's", 'Zakho', 'Zakho Fitness', 'Rody', 'Youssef', 'Joan', 'Gulistan', 'Rudy', 'rodi123ehmed@gmail.com', 'Logo', '🎓', '%']);
const unmappedStatic = [];
const allStatic = [];
for (const file of pageFiles) {
  let html = fs.readFileSync(path.join(root, file), 'utf8');
  html = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  const staticHtml = html.replace(/<section\b(?=[^>]*\bdata-home-local-offer\b)[^>]*>[\s\S]*?<\/section>/gi, '');
  const body = (staticHtml.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i) || [null, ''])[1]
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '');
  for (const match of body.matchAll(/>([^<>]+)</g)) {
    const phrase = match[1].trim();
    if (!phrase || /^[\d\s%.,:;–—-]+$/.test(phrase) || properNames.has(phrase)) continue;
    allStatic.push({ file, phrase });
    if (!aliases.has(phrase)) unmappedStatic.push({ file, phrase });
  }
  for (const match of staticHtml.matchAll(/\b(?:alt|aria-label|placeholder|title)="([^"]+)"/g)) {
    const phrase = match[1].trim();
    if (phrase && !properNames.has(phrase) && !aliases.has(phrase)) unmappedStatic.push({ file, attribute: phrase });
  }
}

const contentRequirements = {
  deals: ['discount', 'description', 'terms', 'valid_until', 'location', 'how_to_use'],
  events: ['title', 'organizer', 'description', 'location', 'requirements'],
  benefits: ['category', 'benefit_type', 'description', 'eligibility', 'how_to_activate', 'restrictions', 'last_verified'],
  housing: ['title', 'neighborhood', 'room_type', 'facilities', 'description', 'contact'],
  transportation: ['type', 'route_name', 'pickup_point', 'dropoff_point', 'schedule_note', 'fare', 'contact', 'notes']
};
const dataTranslations = translations.data;
const dataContext = { window: {} };
vm.runInNewContext(`${fs.readFileSync(path.join(root, 'js/data/local-records.js'), 'utf8')}\n${fs.readFileSync(path.join(root, 'js/data/events.js'), 'utf8')}\nglobalThis.__records = { dealsData, benefitsData, housingData, transportationData, eventsData: window.eventsData };`, dataContext);
const records = dataContext.__records;
const categoryKeyMap = {
  All: 'filters.all', restaurant: 'category.restaurant', cafe: 'category.cafe', gym: 'category.gym',
  'health-medical': 'category.healthMedical',
  conferences: 'events.category.conferences', exhibitions: 'events.category.exhibitions',
  university: 'events.category.university', competitions: 'events.category.competitions',
  sports: 'events.category.sports', workshops: 'events.category.workshops',
  volunteering: 'events.category.volunteering',
  shop: 'category.shop', other: 'category.other', 'AI tools': 'category.aiTools',
  Development: 'category.development', Cloud: 'category.cloud', Productivity: 'category.productivity',
  Design: 'category.design', Single: 'category.single', Shared: 'category.shared',
  Apartment: 'category.apartment', Bus: 'category.bus', Taxi: 'category.taxi', Shuttle: 'category.shuttle',
  Minibus: 'category.minibus', 'Shared taxi': 'category.sharedTaxi',
  Free: 'benefit.free', 'Free plan': 'benefit.freePlan', 'Student discount': 'benefit.studentDiscount',
  Trial: 'benefit.trial'
};
const usedCategories = new Set(['All']);
for (const section of Object.keys(records)) {
  for (const item of records[section]) {
    for (const field of ['category', 'benefit_type', 'room_type', 'type']) if (item[field]) usedCategories.add(item[field]);
  }
}
const missingCategoryKeys = [...usedCategories].filter((value) => !translations.ui[categoryKeyMap[value]]);
const missingData = [];
const missingEnglishData = [];
let expectedDataTranslations = 0;
const missingKurdishData = [];
function hasTranslation(value, language) {
  return Boolean(value && typeof value === 'object' && typeof value[language] === 'string' && value[language].trim());
}
for (const [section, fields] of Object.entries(contentRequirements)) {
  const sourceRecords = records[`${section}Data`] || [];
  const sectionTranslations = dataTranslations[section] || {};
  for (const item of sourceRecords) {
    for (const field of fields) {
      const original = item[field];
      const sourceValues = Array.isArray(original) ? original : [original];
      const hasSourceContent = sourceValues.some((value) => typeof value === 'string' ? value.trim() : value != null);
      if (!hasSourceContent) continue;

      const translated = sectionTranslations[item.id]?.[field];
      const translatedValues = Array.isArray(translated) ? translated : [translated];
      const expectedValues = sourceValues.filter((value) => typeof value === 'string' ? value.trim() : value != null);
      if (Array.isArray(original) && (!Array.isArray(translated) || translated.length !== original.length)) {
        missingData.push(`${section}.${item.id}.${field}`);
        expectedDataTranslations += expectedValues.length;
        continue;
      }

      expectedDataTranslations += expectedValues.length;
      expectedValues.forEach((_, index) => {
        const value = translatedValues[Array.isArray(original) ? index : 0];
        const key = `${section}.${item.id}.${field}${Array.isArray(original) ? `[${index}]` : ''}`;
        if (!hasTranslation(value, 'ar') || (Array.isArray(original) && typeof value === 'string')) missingData.push(key);
        if (!hasTranslation(value, 'en') || (Array.isArray(original) && typeof value === 'string')) missingEnglishData.push(key);
        if (!hasTranslation(value, 'ku') || (Array.isArray(original) && typeof value === 'string')) missingKurdishData.push(key);
      });
    }
  }
}

const report = {
  htmlPagesFound: pageFiles.length,
  requiredPagesFound: requiredPages.length - missingPages.length,
  uiTranslationKeys: Object.keys(translations.ui).length,
  dynamicTranslationKeys: expectedDataTranslations,
  translationKeys: Object.keys(translations.ui).length + expectedDataTranslations,
  completeArabicKeys: Object.values(translations.ui).filter((pair) => pair.ar?.trim()).length + expectedDataTranslations - missingData.length,
  completeEnglishKeys: Object.values(translations.ui).filter((pair) => pair.en?.trim()).length + expectedDataTranslations - missingEnglishData.length,
  completeKurdishKeys: Object.values(translations.ui).filter((pair) => pair.ku?.trim()).length + expectedDataTranslations - missingKurdishData.length,
  expectedDynamicArabicValues: expectedDataTranslations,
  missingDynamicArabicValues: missingData,
  missingDynamicEnglishValues: missingEnglishData,
  missingDynamicKurdishValues: missingKurdishData,
  staticTextNodesFound: allStatic.length,
  unmappedStaticStrings: unmappedStatic,
  untranslatedHardcodedInterfaceStrings: unmappedStatic,
  conflictingStaticAliases: aliasConflicts,
  duplicateOrConflictingKeys: aliasConflicts,
  manualReviewItems: aliasConflicts,
  missingPages,
  pagesMissingLocalizationScripts: missingI18nScripts,
  missingTranslationKeyReferences,
  missingCategoryKeys
};
const passed = !missingPages.length && !missingI18nScripts.length && !missingData.length && !missingEnglishData.length && !missingKurdishData.length && !unmappedStatic.length && !missingTranslationKeyReferences.length && !missingCategoryKeys.length;
report.passed = passed;
fs.writeFileSync(path.join(root, 'reports/localization-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
if (!passed) process.exitCode = 1;
