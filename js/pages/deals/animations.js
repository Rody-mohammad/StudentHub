/* Deals page GSAP pilot: animate only cards and category controls on deals.html. */
(() => {
  const container = document.getElementById('cardContainer');
  const filters = document.getElementById('filterChips');
  if (!container || !document.querySelector('.deals-directory')) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!window.gsap || reducedMotion.matches) return;

  const animateCards = (cards) => {
    if (!cards.length) return;
    window.gsap.fromTo(cards,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.48, stagger: 0.07, ease: 'power2.out', clearProps: 'transform,opacity,visibility' }
    );
  };

  // The initial catalog render completes before this deferred script executes.
  animateCards(Array.from(container.querySelectorAll('.card--compact')));

  // Filtering replaces the grid; animate only the newly inserted deal cards.
  const observer = new MutationObserver(() => {
    animateCards(Array.from(container.querySelectorAll('.card--compact')));
  });
  observer.observe(container, { childList: true });

  // Keep hover motion on the outer card so its contents move as one unit.
  container.addEventListener('pointerover', (event) => {
    const card = event.target.closest('.card--compact');
    if (!card || !container.contains(card) || card.contains(event.relatedTarget)) return;
    window.gsap.to(card, { y: -3, duration: 0.18, ease: 'power2.out', overwrite: true });
  });

  container.addEventListener('pointerout', (event) => {
    const card = event.target.closest('.card--compact');
    if (!card || card.contains(event.relatedTarget)) return;
    window.gsap.to(card, { y: 0, duration: 0.2, ease: 'power2.out', overwrite: true });
  });

  // Category chips are the Deals page's action buttons; add restrained press feedback.
  filters?.addEventListener('pointerdown', (event) => {
    const chip = event.target.closest('.chip');
    if (chip) window.gsap.to(chip, { y: 1, duration: 0.1, ease: 'power1.out', overwrite: true });
  });

  const restoreChip = (event) => {
    const chip = event.target.closest('.chip');
    if (chip) window.gsap.to(chip, { y: 0, duration: 0.14, ease: 'power1.out', overwrite: true });
  };
  filters?.addEventListener('pointerup', restoreChip);
  filters?.addEventListener('pointercancel', restoreChip);
  filters?.addEventListener('pointerleave', restoreChip);

  // If the user changes this preference while the page is open, stop motion cleanly.
  reducedMotion.addEventListener?.('change', (event) => {
    if (event.matches) window.gsap.globalTimeline.clear();
  });
})();
