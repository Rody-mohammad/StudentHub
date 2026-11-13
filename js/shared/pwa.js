(() => {
  if ('serviceWorker' in navigator && navigator.serviceWorker && !window.__studentHubPwaRegistration) {
    const scriptUrl = document.currentScript?.src;
    if (!scriptUrl) {
      console.error('[StudentHub PWA] Unable to determine the PWA script URL.');
    } else {
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
    }
  }

  const initOfflineNotice = () => {
    let showingCachedPage = false;
    let notice = document.querySelector('.pwa-offline-notice');
    if (!notice) {
      notice = document.createElement('aside');
      notice.className = 'pwa-offline-notice';
      notice.setAttribute('role', 'status');
      notice.setAttribute('aria-live', 'polite');
      document.body.prepend(notice);
    }

    const updateNotice = () => {
      const i18n = window.StudentHubI18n;
      notice.textContent = i18n
        ? i18n.t(navigator.onLine ? 'pwa.staleMessage' : 'pwa.offlineMessage')
        : 'You are offline. Saved information may be outdated.';
      notice.hidden = navigator.onLine && !showingCachedPage;
    };

    navigator.serviceWorker?.addEventListener('message', (event) => {
      if (event.data?.type !== 'STUDENTHUB_STALE_RESPONSE') return;
      showingCachedPage = true;
      updateNotice();
    });
    window.addEventListener('online', updateNotice);
    window.addEventListener('offline', updateNotice);
    window.StudentHubI18n?.onChange(updateNotice);
    updateNotice();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOfflineNotice, { once: true });
  } else {
    initOfflineNotice();
  }
})();
