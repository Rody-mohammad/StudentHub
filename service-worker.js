'use strict';

const CACHE_VERSION = 7;
const CACHE_PREFIX = 'studenthub-';
const STATIC_CACHE = `${CACHE_PREFIX}static-v${CACHE_VERSION}`;
const PAGE_CACHE = `${CACHE_PREFIX}pages-v${CACHE_VERSION}`;
const IMAGE_CACHE_LIMIT = 24;
const PAGE_CACHE_LIMIT = 30;
const APP_SCOPE = self.registration.scope;
const CORE_ASSETS = [
  'offline.html',
  'css/style.css',
  'js/data/benefits-catalog.js',
  'js/data/events.js',
  'js/data/local-records.js',
  'js/localization/i18n.js',
  'js/localization/translations.js',
  'js/pages/benefits/benefits.js',
  'js/pages/events/events.js',
  'js/pages/home/intro.js',
  'js/pages/home/offers.js',
  'js/shared/catalog-pages.js',
  'js/shared/events.js',
  'js/shared/navigation.js',
  'js/shared/pwa.js',
  'manifest.webmanifest',
  'assets/icons/app-icon-192.png',
  'assets/icons/app-icon-512.png',
  'assets/icons/app-icon-maskable-512.png',
  'assets/icons/app-icon-full-192.png',
  'assets/icons/app-icon-full-512.png',
  'assets/icons/app-icon-full-maskable-512.png',
  'assets/icons/apple-touch-icon.png',
  'assets/images/StudentHubLogo.png',
  'assets/images/inter_face.webp',
];

function isSuccessfulSameOriginResponse(response, origin) {
  return response.status === 200 && response.type === 'basic' && new URL(response.url).origin === origin;
}

function pageCacheKey(requestUrl) {
  const key = new URL(requestUrl);
  key.search = '';
  key.hash = '';
  return new Request(key.href);
}

async function trimCache(cache, limit, isEligible) {
  const keys = await cache.keys();
  const eligible = keys.filter(isEligible);
  await Promise.all(eligible.slice(0, Math.max(0, eligible.length - limit)).map((key) => cache.delete(key)));
}

async function cacheCoreAssets() {
  const cache = await caches.open(STATIC_CACHE);
  const origin = new URL(APP_SCOPE).origin;
  await Promise.all(CORE_ASSETS.map(async (path) => {
    const url = new URL(path, APP_SCOPE);
    if (url.origin !== origin) throw new Error(`Refusing to precache a cross-origin asset: ${url.href}`);

    const response = await fetch(new Request(url.href, { cache: 'reload' }));
    if (!isSuccessfulSameOriginResponse(response, origin)) {
      throw new Error(`Unable to precache ${url.href} (HTTP ${response.status}).`);
    }
    await cache.put(url.href, response);
  }));
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheCoreAssets());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'STUDENTHUB_SKIP_WAITING') {
    event.waitUntil(self.skipWaiting());
  }
});

self.addEventListener('activate', (event) => {
  const currentCaches = new Set([STATIC_CACHE, PAGE_CACHE]);
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames
      .filter((name) => name.startsWith(CACHE_PREFIX) && !currentCaches.has(name))
      .map((name) => caches.delete(name)));
  })());
});

async function handleNavigation(request) {
  const url = new URL(request.url);
  const scopePath = new URL(APP_SCOPE).pathname;
  if (url.origin !== new URL(APP_SCOPE).origin || !url.pathname.startsWith(scopePath)
      || !url.pathname.toLowerCase().endsWith('.html')) {
    return { response: await fetch(request), offlineFallback: false };
  }

  const cache = await caches.open(PAGE_CACHE);
  const key = pageCacheKey(url.href);
  let response;
  try {
    response = await fetch(request);
  } catch (error) {
    const cachedPage = await cache.match(key);
    if (cachedPage) return { response: cachedPage, offlineFallback: true };

    const offlineUrl = new URL('offline.html', APP_SCOPE);
    const fallback = await caches.open(STATIC_CACHE).then((staticCache) => staticCache.match(offlineUrl.href));
    if (fallback) return { response: fallback, offlineFallback: true };
    throw error;
  }

  const contentType = response.headers.get('content-type') || '';
  if (isSuccessfulSameOriginResponse(response, url.origin) && contentType.includes('text/html')) {
    try {
      await cache.put(key, response.clone());
      await trimCache(cache, PAGE_CACHE_LIMIT, () => true);
    } catch (error) {
      console.error('[StudentHub PWA] Unable to update the offline page cache.', error);
    }
  }
  return { response, offlineFallback: false };
}

async function notifyOfflineClient(clientId) {
  if (!clientId) return;
  await new Promise((resolve) => setTimeout(resolve, 500));
  const client = await self.clients.get(clientId);
  client?.postMessage({ type: 'STUDENTHUB_STALE_RESPONSE' });
}

async function handleStaticAsset(request) {
  const url = new URL(request.url);
  const scopePath = new URL(APP_SCOPE).pathname;
  if (url.origin !== new URL(APP_SCOPE).origin || !url.pathname.startsWith(scopePath)) return fetch(request);

  const pathname = url.pathname.toLowerCase();
  const imageDirectory = `${scopePath}assets/images/`.toLowerCase();
  const iconDirectory = `${scopePath}assets/icons/`.toLowerCase();
  const isScriptOrStyle = /\.(?:css|js)$/.test(pathname);
  const isIcon = pathname.startsWith(iconDirectory);
  const isImage = pathname.startsWith(imageDirectory) && request.destination === 'image';
  if (!isScriptOrStyle && !isIcon && !isImage) return fetch(request);

  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;

  const response = await fetch(request);
  if (!isSuccessfulSameOriginResponse(response, url.origin)) return response;

  if (isImage) {
    const size = Number(response.headers.get('content-length'));
    if (!Number.isFinite(size) || size > 350 * 1024) return response;
  }

  try {
    await cache.put(request, response.clone());
    if (isImage) {
      await trimCache(cache, IMAGE_CACHE_LIMIT, (key) => {
        const keyUrl = new URL(key.url);
        return keyUrl.pathname.toLowerCase().startsWith(imageDirectory);
      });
    }
  } catch (error) {
    console.error('[StudentHub PWA] Unable to cache a static asset.', error);
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    const navigationResponse = handleNavigation(request);
    event.respondWith(navigationResponse.then((result) => result.response));
    event.waitUntil(navigationResponse.then((result) => (
      result.offlineFallback ? notifyOfflineClient(event.resultingClientId || event.clientId) : undefined
    )));
    return;
  }

  if (request.destination === 'script' || request.destination === 'style'
      || request.destination === 'image') {
    event.respondWith(handleStaticAsset(request));
  }
});
