'use strict';

const CACHE_VERSION = 1;
const CACHE_NAME = `studenthub-static-v${CACHE_VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
