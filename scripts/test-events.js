const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const translationsContext = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/localization/translations.js'), 'utf8'), translationsContext);
const translations = translationsContext.window.STUDENTHUB_TRANSLATIONS;
const dataContext = { window: {} };
dataContext.window.StudentHubI18n = {
  t: (_key, params) => `${params.start} – ${params.end}`,
};
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/data/events.js'), 'utf8'), dataContext);
const events = dataContext.window.eventsData;
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/shared/events.js'), 'utf8'), dataContext);
const eventTools = dataContext.window.StudentHubEvents;

const categories = ['conferences', 'exhibitions', 'university', 'competitions', 'sports', 'workshops', 'volunteering'];
assert.equal(events.length, 10, 'event catalog includes demo records and two poster-based listings');
assert.deepEqual([...new Set(events.map((event) => event.category))].sort(), [...categories].sort(), 'all event categories are represented');
for (const event of events) {
  assert.ok(event.id && event.date && event.image, `${event.id} has a stable ID, date, and cover`);
  assert.ok(event.endDate || (event.startTime && event.endTime), `${event.id} has a complete date or time range`);
  assert.equal(event.registrationUrl, '', `${event.id} does not advertise an unverified registration URL`);
  assert.ok(event.image.startsWith('assets/'), `${event.id} uses a local event cover`);
  assert.ok(event.status === 'upcoming' || event.status === 'past', `${event.id} has an initial status derived from its demo date`);
  for (const field of ['title', 'organizer', 'description', 'location', 'requirements']) {
    const copy = translations.data.events[event.id]?.[field];
    for (const language of ['ar', 'en', 'ku']) {
      assert.ok(copy?.[language], `${event.id}.${field} has ${language} copy`);
    }
  }
}
for (const category of categories) {
  assert.ok(translations.ui[`events.category.${category}`]?.ar, `${category} has an Arabic category label`);
  assert.ok(translations.ui[`events.category.${category}`]?.en, `${category} has an English category label`);
}

const conference = events.find((event) => event.id === 'demo-tech-conference');
assert.equal(eventTools.status(conference, new Date(2026, 11, 1)), 'upcoming', 'future event status is upcoming');
assert.equal(eventTools.status(conference, new Date(2026, 11, 10, 12)), 'ongoing', 'event status is ongoing during its scheduled time');
assert.equal(eventTools.status(conference, new Date(2026, 11, 11)), 'past', 'completed event status becomes past');
assert.equal(conference.status, 'past', 'computed status is stored on the record');
const bookFair = events.find((event) => event.id === 'poster-zakho-book-fair-2026');
const tradeFair = events.find((event) => event.id === 'poster-zakho-trade-fair-2026');
assert.equal(eventTools.status(bookFair, new Date(2026, 10, 17)), 'ongoing', 'poster date ranges remain ongoing through their final day');
assert.equal(eventTools.status(tradeFair, new Date(2026, 8, 24, 12)), 'ongoing', 'past poster date ranges include their final day');
assert.equal(eventTools.dateTime(bookFair, 'en'), 'November 15, 2026 – November 20, 2026', 'poster date ranges render without invented times');

const eventsPage = fs.readFileSync(path.join(root, 'events.html'), 'utf8');
const detailPage = fs.readFileSync(path.join(root, 'detail.html'), 'utf8');
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const detailRenderer = fs.readFileSync(path.join(root, 'js/shared/catalog-pages.js'), 'utf8');
assert.match(eventsPage, /js\/data\/events\.js/, 'Events page loads the event catalog');
assert.doesNotMatch(eventsPage, /id="eventsFilters"/, 'Events page does not render category filter chips');
assert.doesNotMatch(fs.readFileSync(path.join(root, 'js/pages/events/events.js'), 'utf8'), /data-event-category|activeCategory/, 'Events renderer has no category chip filtering');
assert.match(detailPage, /js\/data\/events\.js/, 'shared detail page loads the event catalog');
assert.match(homepage, /data-home-upcoming-events/, 'homepage includes the upcoming event preview');
assert.ok(homepage.indexOf('data-home-upcoming-events') < homepage.indexOf('خدمات الطلاب'), 'homepage upcoming events appear before student services');
assert.match(fs.readFileSync(path.join(root, 'js/pages/events/events.js'), 'utf8'), /\.slice\(0,\s*1\)/, 'homepage preview is limited to one event');
const navigation = fs.readFileSync(path.join(root, 'js/shared/navigation.js'), 'utf8');
assert.match(navigation, /pageLinks\.splice\(benefitsIndex, 0, pageLinks\.splice\(eventsIndex, 1\)\[0\]\)/, 'navigation places Events above Benefits');
assert.match(detailRenderer, /events:\s*\{\s*data:\s*window\.eventsData/, 'events use the shared URL-based detail renderer');
assert.ok(fs.existsSync(path.join(root, 'assets/images/event-demo-cover.svg')), 'the fictional event cover asset exists');
for (const image of ['book_event.png', 'ZAKHO INTERNATIONAL FAIR.png', 'Eyes.jfif', 'dental.jfif', 'glasess.jfif', 'gym1.jfif', 'gym2.jfif', 'evar_cafe.png', 'nin_cafe.png', 'friet_zone.png', 'bookstore.png']) {
  assert.ok(fs.existsSync(path.join(root, 'assets/images', image)), `${image} is available for its listing`);
}

console.log('Events behavior checks passed: category data, localization, date statuses, routes, and demo links.');
