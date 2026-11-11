const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const translationsContext = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/localization/translations.js'), 'utf8'), translationsContext);
const translations = translationsContext.window.STUDENTHUB_TRANSLATIONS;
const dataContext = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/data/events.js'), 'utf8'), dataContext);
const events = dataContext.window.eventsData;
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/shared/events.js'), 'utf8'), dataContext);
const eventTools = dataContext.window.StudentHubEvents;

const categories = ['conferences', 'exhibitions', 'university', 'competitions', 'sports', 'workshops', 'volunteering'];
assert.equal(events.length, 8, 'event catalog includes seven upcoming demo events and one past demo event');
assert.deepEqual([...new Set(events.map((event) => event.category))].sort(), [...categories].sort(), 'all event categories are represented');
for (const event of events) {
  assert.ok(event.id && event.date && event.startTime && event.endTime && event.image, `${event.id} has a stable ID, schedule, and cover`);
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

const eventsPage = fs.readFileSync(path.join(root, 'events.html'), 'utf8');
const detailPage = fs.readFileSync(path.join(root, 'detail.html'), 'utf8');
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const detailRenderer = fs.readFileSync(path.join(root, 'js/shared/catalog-pages.js'), 'utf8');
assert.match(eventsPage, /js\/data\/events\.js/, 'Events page loads the event catalog');
assert.match(detailPage, /js\/data\/events\.js/, 'shared detail page loads the event catalog');
assert.match(homepage, /data-home-upcoming-events/, 'homepage includes the upcoming event preview');
assert.match(detailRenderer, /events:\s*\{\s*data:\s*window\.eventsData/, 'events use the shared URL-based detail renderer');
assert.ok(fs.existsSync(path.join(root, 'assets/images/event-demo-cover.svg')), 'the fictional event cover asset exists');

console.log('Events behavior checks passed: category data, localization, date statuses, routes, and demo links.');
