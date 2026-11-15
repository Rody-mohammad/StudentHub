/* Shared card entrance and hover motion. Loaded site-wide; all targets are optional. */
(() => {
  const cardSelector = [
    '.card-grid > .card', '.housing-listing-grid > .housing-listing',
    '.transport-grid > .transport-route', '.benefits-grid > .benefit-card',
    '[data-benefit-results] > .benefit-card', '.events-grid > .events-card',
    '[data-home-offers-track] > .featured-card', '.home-gemini-offer',
    '.home-service-track > .home-service-card', '.home-service-track > .home-service-offer',
    '.home-event-card', '.home-transport-card', '.housing-card', '.benefit-tile'
  ].join(',');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const gsap = window.gsap;
  if (!gsap || reducedMotion.matches) return;

  const animated = new WeakSet();
  const animateNew = (root) => {
    const cards = [];
    if (root.matches?.(cardSelector) && !animated.has(root)) cards.push(root);
    root.querySelectorAll?.(cardSelector).forEach((card) => {
      if (!animated.has(card)) cards.push(card);
    });
    if (!cards.length) return;
    cards.forEach((card) => animated.add(card));
    gsap.fromTo(cards,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out', clearProps: 'transform,opacity,visibility' }
    );
  };

  // Animate existing cards once and only respond to additions inside card collections.
  animateNew(document);
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(({ addedNodes }) => addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) animateNew(node);
    }));
  });
  const collectionSelector = '.card-grid, .housing-listing-grid, .transport-grid, .benefits-grid, [data-benefit-results], .events-grid, [data-home-offers-track], .home-service-track';
  document.querySelectorAll(collectionSelector).forEach((collection) => {
    observer.observe(collection, { childList: true });
  });

  // Pointer delegation covers dynamically rendered cards without per-card listeners.
  document.addEventListener('pointerover', (event) => {
    if (event.pointerType === 'touch' || reducedMotion.matches) return;
    const card = event.target.closest(cardSelector);
    if (!card || card.contains(event.relatedTarget)) return;
    gsap.to(card, { y: -5, duration: 0.18, ease: 'power2.out', overwrite: true });
    const image = card.querySelector('.card__photo, .housing-listing__image, .events-card__cover img, .home-event-card__image, .featured-card__image, .home-service-offer__image');
    if (image) gsap.to(image, { scale: 1.03, duration: 0.24, ease: 'power2.out', overwrite: true, transformOrigin: '50% 50%' });
  });
  document.addEventListener('pointerout', (event) => {
    if (event.pointerType === 'touch') return;
    const card = event.target.closest(cardSelector);
    if (!card || card.contains(event.relatedTarget)) return;
    gsap.to(card, { y: 0, duration: 0.2, ease: 'power2.out', overwrite: true });
    const image = card.querySelector('.card__photo, .housing-listing__image, .events-card__cover img, .home-event-card__image, .featured-card__image, .home-service-offer__image');
    if (image) gsap.to(image, { scale: 1, duration: 0.24, ease: 'power2.out', overwrite: true });
  });

  // Stop active tweens when reduced motion is enabled while the page is open.
  reducedMotion.addEventListener?.('change', (event) => {
    if (event.matches) gsap.globalTimeline.clear();
  });
})();
