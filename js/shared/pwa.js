(() => {
  let updateAvailableWorker = null;
  let updateRequested = false;
  let updateNotice;

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
        .then((registration) => {
          if (!registration) return;

          const checkForWaitingWorker = () => {
            if (!registration.waiting || !navigator.serviceWorker.controller) return;
            updateAvailableWorker = registration.waiting;
            updateNotice?.();
          };

          const watchInstallingWorker = () => {
            const installingWorker = registration.installing;
            installingWorker?.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed') checkForWaitingWorker();
            });
          };
          registration.addEventListener('updatefound', watchInstallingWorker);
          watchInstallingWorker();
          checkForWaitingWorker();
        })
        .catch((error) => {
          console.error('[StudentHub PWA] Service worker registration failed.', error);
        });
    }
  }

  navigator.serviceWorker?.addEventListener('controllerchange', () => {
    if (!updateRequested) return;
    updateRequested = false;
    window.location.reload();
  });

  const initOfflineNotice = () => {
    let showingCachedPage = false;
    let notice = document.querySelector('.pwa-offline-notice');
    if (!notice) {
      notice = document.createElement('aside');
      notice.className = 'pwa-offline-notice';
      notice.setAttribute('role', 'status');
      notice.setAttribute('aria-live', 'polite');
      const message = document.createElement('span');
      const updateButton = document.createElement('button');
      updateButton.className = 'pwa-update-button';
      updateButton.type = 'button';
      updateButton.hidden = true;
      updateButton.addEventListener('click', () => {
        if (!updateAvailableWorker) return;
        updateRequested = true;
        updateAvailableWorker.postMessage({ type: 'STUDENTHUB_SKIP_WAITING' });
      });
      notice.appendChild(message);
      notice.appendChild(updateButton);
      document.body.prepend(notice);
    }

    const message = notice.querySelector('span');
    const updateButton = notice.querySelector('.pwa-update-button');
    const renderNotice = () => {
      const i18n = window.StudentHubI18n;
      message.textContent = i18n
        ? i18n.t(!navigator.onLine
          ? 'pwa.offlineMessage'
          : showingCachedPage
            ? 'pwa.staleMessage'
            : 'pwa.updateAvailable')
        : !navigator.onLine
          ? 'You are offline. Saved information may be outdated.'
          : showingCachedPage
            ? 'This page is showing saved information that may be outdated.'
            : 'An app update is available.';
      updateButton.textContent = i18n ? i18n.t('pwa.updateAction') : 'Update now';
      updateButton.hidden = !updateAvailableWorker;
      notice.hidden = navigator.onLine && !showingCachedPage && !updateAvailableWorker;
    };
    updateNotice = renderNotice;

    navigator.serviceWorker?.addEventListener('message', (event) => {
      if (event.data?.type !== 'STUDENTHUB_STALE_RESPONSE') return;
      showingCachedPage = true;
      renderNotice();
    });
    window.addEventListener('online', renderNotice);
    window.addEventListener('offline', renderNotice);
    window.StudentHubI18n?.onChange(renderNotice);
    renderNotice();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOfflineNotice, { once: true });
  } else {
    initOfflineNotice();
  }
})();
