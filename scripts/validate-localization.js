const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/translations.js'), 'utf8'), context);
const translations = context.window.STUDENTHUB_TRANSLATIONS;
const aliases = new Map();
const aliasConflicts = [];
for (const [key, pair] of Object.entries(translations.ui)) {
  for (const lang of ['ar', 'en']) {
    const value = pair[lang];
    if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing ${lang} translation: ${key}`);
    if (aliases.has(value) && aliases.get(value).key !== key) {
      const previous = aliases.get(value);
      if (previous.en !== pair.en || previous.ar !== pair.ar) aliasConflicts.push({ value, keys: [previous.key, key] });
    } else aliases.set(value, { key, ar: pair.ar, en: pair.en });
  }
}

const pageFiles = fs.readdirSync(root).filter((file) => file.endsWith('.html')).sort();
const requiredPages = ['index.html', 'about.html', 'deals.html', 'benefits.html', 'book-discounts.html', 'digital-offers.html', 'software-guides.html', 'housing.html', 'detail.html', 'gym-offers.html', 'restaurant-offers.html', 'transportation.html', 'transport-zakho.html', 'transport-external.html', 'housing-details.html'];
const missingPages = requiredPages.filter((file) => !pageFiles.includes(file));
const missingI18nScripts = pageFiles.filter((file) => {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  return !html.includes('js/translations.js') || !html.includes('js/i18n.js');
});
const missingTranslationKeyReferences = [];
for (const file of ['js/main.js', 'js/navigation.js', 'js/studenthub-intro.js', 'js/benefits.js']) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of source.matchAll(/(?:\bt|\.t)\s*\(\s*['"]([^'"]+)['"]/g)) {
    if (!translations.ui[match[1]]) missingTranslationKeyReferences.push(`${file}:${match[1]}`);
  }
}
const requiredPageTitleKeys = ['pageTitle.home', 'pageTitle.about', 'pageTitle.deals', 'pageTitle.benefits', 'pageTitle.bookDiscounts', 'pageTitle.digitalOffers', 'pageTitle.softwareGuides', 'pageTitle.housing', 'pageTitle.transportation', 'pageTitle.detail', 'pageTitle.gymOffers', 'pageTitle.restaurantOffers', 'pageTitle.housingDetails', 'pageTitle.transportZakho', 'pageTitle.transportExternal'];
for (const key of requiredPageTitleKeys) if (!translations.ui[key]) missingTranslationKeyReferences.push(`page-title:${key}`);

const properNames = new Set(['Student', 'Hub', 'StudentHub', 'KFC', 'Subway', "McDonald's", 'Zakho', 'Zakho Fitness', 'Rody', 'Logo', '🎓', '%']);
const unmappedStatic = [];
const allStatic = [];
for (const file of pageFiles) {
  let html = fs.readFileSync(path.join(root, file), 'utf8');
  html = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  const body = (html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i) || [null, ''])[1]
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '');
  for (const match of body.matchAll(/>([^<>]+)</g)) {
    const phrase = match[1].trim();
    if (!phrase || /^[\d\s%.,:;–—-]+$/.test(phrase) || properNames.has(phrase)) continue;
    allStatic.push({ file, phrase });
    if (!aliases.has(phrase)) unmappedStatic.push({ file, phrase });
  }
  for (const match of html.matchAll(/\b(?:alt|aria-label|placeholder|title)="([^"]+)"/g)) {
    const phrase = match[1].trim();
    if (phrase && !properNames.has(phrase) && !aliases.has(phrase)) unmappedStatic.push({ file, attribute: phrase });
  }
}

const contentRequirements = {
  deals: { count: 6, fields: ['discount', 'description', 'terms', 'valid_until', 'location', 'how_to_use'] },
  benefits: { count: 6, fields: ['category', 'benefit_type', 'description', 'eligibility', 'how_to_activate', 'restrictions', 'last_verified'] },
  housing: { count: 6, fields: ['title', 'neighborhood', 'room_type', 'facilities', 'description', 'contact'] },
  transportation: { count: 6, fields: ['type', 'route_name', 'pickup_point', 'dropoff_point', 'schedule_note', 'fare', 'contact', 'notes'] }
};
const dataTranslations = translations.data;
const dataContext = {};
vm.runInNewContext(`${fs.readFileSync(path.join(root, 'js/data.js'), 'utf8')}\nglobalThis.__records = { dealsData, benefitsData, housingData, transportationData };`, dataContext);
const records = dataContext.__records;
const categoryKeyMap = {
  All: 'filters.all', restaurant: 'category.restaurant', cafe: 'category.cafe', gym: 'category.gym',
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
for (const [section, requirement] of Object.entries(contentRequirements)) {
  for (let id = 1; id <= requirement.count; id += 1) {
    for (const field of requirement.fields) {
      expectedDataTranslations += Array.isArray(dataTranslations[section]?.[id]?.[field])
        ? dataTranslations[section][id][field].length : 1;
      const value = dataTranslations[section]?.[id]?.[field];
      const original = records[`${section}Data`]?.find((item) => item.id === id)?.[field];
      const malformedArray = Array.isArray(original) && (!Array.isArray(value) || value.length !== original.length || value.some((entry) => typeof entry !== 'string' || !entry.trim()));
      if (value == null || malformedArray || (typeof value === 'string' && !value.trim()) || (typeof original === 'string' && typeof value !== 'string')) {
        missingData.push(`${section}.${id}.${field}`);
      }
      if (original == null || (Array.isArray(original) && (!original.length || original.some((entry) => typeof entry !== 'string' || !entry.trim()))) || (typeof original === 'string' && !original.trim())) {
        missingEnglishData.push(`${section}.${id}.${field}`);
      }
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
  expectedDynamicArabicValues: expectedDataTranslations,
  missingDynamicArabicValues: missingData,
  missingDynamicEnglishValues: missingEnglishData,
  staticTextNodesFound: allStatic.length,
  unmappedStaticStrings: unmappedStatic,
  untranslatedHardcodedInterfaceStrings: unmappedStatic,
  conflictingStaticAliases: aliasConflicts,
  duplicateOrConflictingKeys: aliasConflicts,
  manualReviewItems: [],
  missingPages,
  pagesMissingLocalizationScripts: missingI18nScripts,
  missingTranslationKeyReferences,
  missingCategoryKeys
};
const passed = !missingPages.length && !missingI18nScripts.length && !missingData.length && !missingEnglishData.length && !unmappedStatic.length && !aliasConflicts.length && !missingTranslationKeyReferences.length && !missingCategoryKeys.length;
report.passed = passed;
fs.writeFileSync(path.join(root, 'localization-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
if (!passed) process.exitCode = 1;
