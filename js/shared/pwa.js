(() => {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker || window.__studentHubPwaRegistration) return;

  const scriptUrl = document.currentScript?.src;
  if (!scriptUrl) {
    console.error('[StudentHub PWA] Unable to determine the PWA script URL.');
    return;
  }

  const workerUrl = new URL('../../service-worker.js', scriptUrl);
  const scopeUrl = new URL('../../', scriptUrl);

  window.__studentHubPwaRegistration = navigator.serviceWorker
    .getRegistration(scopeUrl.href)
    .then((registration) => {
      if (registration?.active?.scriptURL === workerUrl.href) return registration;
      return navigator.serviceWorker.register(workerUrl.href, { scope: scopeUrl.pathname });
    })
    .catch((error) => {
      console.error('[StudentHub PWA] Service worker registration failed.', error);
    });
})();
