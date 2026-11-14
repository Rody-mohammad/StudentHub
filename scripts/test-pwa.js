const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class Element {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.listeners = {};
    this.attributes = {};
    this.hidden = false;
    this.className = '';
    this.textContent = '';
  }

  addEventListener(type, listener) {
    this.listeners[type] = listener;
  }

  appendChild(child) {
    this.children.push(child);
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  querySelector(selector) {
    if (selector === 'span') return this.children.find((child) => child.tagName === 'SPAN');
    return this.children.find((child) => child.className === selector.slice(1));
  }

  dispatch(type, event = {}) {
    this.listeners[type]?.(event);
  }
}

async function flushPromises() {
  await new Promise((resolve) => setImmediate(resolve));
}

async function main() {
  const updateWorker = { messages: [], postMessage(message) { this.messages.push(message); } };
  const installingWorker = new Element('worker');
  installingWorker.state = 'installing';
  const registrationListeners = {};
  const serviceWorkerListeners = {};
  const registration = {
    active: { scriptURL: 'https://example.test/app/service-worker.js' },
    installing: installingWorker,
    waiting: null,
    addEventListener(type, listener) { registrationListeners[type] = listener; },
  };
  const serviceWorker = {
    controller: {},
    async getRegistration() { return registration; },
    addEventListener(type, listener) { serviceWorkerListeners[type] = listener; },
  };
  const domListeners = {};
  const noticeParents = [];
  const document = {
    currentScript: { src: 'https://example.test/app/js/shared/pwa.js' },
    readyState: 'loading',
    body: { prepend(element) { noticeParents.push(element); } },
    querySelector() { return null; },
    createElement(tagName) {
      return new Element(tagName);
    },
    addEventListener(type, listener) { domListeners[type] = listener; },
  };
  let reloadCount = 0;
  const window = {
    StudentHubI18n: { t: (key) => key, onChange() {} },
    location: { reload() { reloadCount += 1; } },
    addEventListener() {},
  };
  const context = {
    URL,
    console,
    document,
    navigator: { serviceWorker, onLine: true },
    window,
  };
  const translationsContext = { window: {} };
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, '..', 'js/localization/translations.js'), 'utf8'),
    translationsContext,
  );
  for (const key of ['pwa.updateAvailable', 'pwa.updateAction']) {
    for (const language of ['ar', 'en', 'ku']) {
      assert.ok(translationsContext.window.STUDENTHUB_TRANSLATIONS.ui[key][language], `${key} has ${language} copy`);
    }
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'manifest.webmanifest'), 'utf8'));
  const expectedIcons = new Map([
    ['assets/icons/app-icon-192.png', 192],
    ['assets/icons/app-icon-512.png', 512],
    ['assets/icons/app-icon-maskable-512.png', 512],
    ['assets/icons/apple-touch-icon.png', 180],
  ]);
  for (const [file, size] of expectedIcons) {
    const png = fs.readFileSync(path.join(__dirname, '..', file));
    assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a', `${file} is a PNG`);
    assert.equal(png.readUInt32BE(16), size, `${file} has the expected width`);
    assert.equal(png.readUInt32BE(20), size, `${file} has the expected height`);
  }
  const maskableIcon = manifest.icons.find((icon) => icon.src === 'assets/icons/app-icon-maskable-512.png');
  assert.equal(maskableIcon?.purpose, 'maskable', 'the 512px maskable icon is declared correctly');
  const htmlPages = fs.readdirSync(path.join(__dirname, '..')).filter((name) => name.endsWith('.html'));
  assert.equal(htmlPages.filter((name) => name !== 'offline.html').length, 16, 'all application pages are included');
  for (const name of htmlPages) {
    const html = fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
    assert.match(html, /<link rel="apple-touch-icon"[^>]+href="assets\/icons\/apple-touch-icon\.png"/i, `${name} links the Apple icon`);
    assert.match(html, /<meta name="apple-mobile-web-app-capable" content="yes"\s*\/?>/i, `${name} supports standalone mode on iOS`);
    assert.match(html, /<meta name="apple-mobile-web-app-title" content="StudentHub"\s*\/?>/i, `${name} declares the iOS app title`);
    assert.match(html, /<meta name="apple-mobile-web-app-status-bar-style" content="default"\s*\/?>/i, `${name} declares the default status bar`);
  }
  const source = fs.readFileSync(path.join(__dirname, '..', 'js/shared/pwa.js'), 'utf8');
  vm.runInNewContext(source, context);
  await flushPromises();
  domListeners.DOMContentLoaded();

  const notice = noticeParents[0];
  const updateButton = notice.querySelector('.pwa-update-button');
  assert.equal(notice.attributes.role, 'status', 'the notice remains exposed to assistive technology');
  assert.equal(notice.hidden, true, 'the update notice stays hidden before a worker is waiting');

  registration.waiting = updateWorker;
  registrationListeners.updatefound();
  installingWorker.state = 'installed';
  installingWorker.dispatch('statechange');
  assert.equal(notice.hidden, false, 'a completed update becomes visible');
  assert.equal(notice.querySelector('span').textContent, 'pwa.updateAvailable');
  assert.equal(updateButton.hidden, false, 'the available update has an action');

  updateButton.dispatch('click');
  assert.equal(updateWorker.messages.length, 1);
  assert.equal(updateWorker.messages[0].type, 'STUDENTHUB_SKIP_WAITING');
  serviceWorkerListeners.controllerchange();
  assert.equal(reloadCount, 1, 'the page reloads only after the user applies the update');

  const workerListeners = {};
  let skipWaitingCalled = false;
  const serviceWorkerContext = {
    URL,
    Request,
    console,
    fetch,
    caches: {},
    self: {
      registration: { scope: 'https://example.test/app/' },
      addEventListener(type, listener) { workerListeners[type] = listener; },
      skipWaiting() { skipWaitingCalled = true; return Promise.resolve(); },
    },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'service-worker.js'), 'utf8'), serviceWorkerContext);
  let waitedForActivation = false;
  workerListeners.message({
    data: { type: 'STUDENTHUB_SKIP_WAITING' },
    waitUntil() { waitedForActivation = true; },
  });
  assert.equal(skipWaitingCalled, true, 'the worker activates when the user requests the update');
  assert.equal(waitedForActivation, true, 'the activation promise extends the message event');
  console.log('PWA update checks passed: waiting prompt, user-confirmed activation, and reload.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
