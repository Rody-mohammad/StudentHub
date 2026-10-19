/* === FEATURE: home skeleton loading === */
(() => {
  function initHomeSkeletons() {
    const root = document.documentElement;
    if (!root.classList.contains('home-skeleton-pending')) return;
    let cleared = false;
    const clearSkeletons = () => {
      if (cleared) return;
      cleared = true;
      root.classList.remove('home-skeleton-pending');
      document.querySelectorAll('.home-skeleton').forEach((skeleton) => skeleton.remove());
      document.querySelectorAll('[data-home-skeleton-scope]').forEach((section) => section.removeAttribute('aria-busy'));
    };
    window.addEventListener('load', clearSkeletons, { once: true });
    window.setTimeout(clearSkeletons, 6000);
    if (document.readyState === 'complete') window.requestAnimationFrame(clearSkeletons);
  }

  /* === FEATURE: usable home offer details === */
  function initHomeOfferDetails() {
    if (typeof dealsData === 'undefined' || !window.StudentHubI18n) return;
    const i18n = window.StudentHubI18n;
    const scopes = [...document.querySelectorAll('[data-home-local-offer]')];
    const localize = (item, field) => i18n.data('deals', item, field) || item[field] || '';
    const translate = (key) => i18n.t(key);
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    const expiryDate = (value) => {
      const normalized = String(value || '').replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
      const iso = normalized.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (iso) return new Date(Number(iso[1]), Number(iso[2]), 0, 23, 59, 59, 999);
      const found = normalized.match(/([a-z]+)\s+(\d{4})/i);
      if (!found) return null;
      const months = { jan:0,january:0,feb:1,february:1,mar:2,march:2,apr:3,april:3,may:4,jun:5,june:5,jul:6,july:6,aug:7,august:7,sep:8,sept:8,september:8,oct:9,october:9,nov:10,november:10,dec:11,december:11 };
      const month = months[found[1].toLowerCase()];
      return month === undefined ? null : new Date(Number(found[2]), month + 1, 0, 23, 59, 59, 999);
    };
    const ordered = scopes.map((scope, index) => {
      const item = scope.dataset.homeOfferId
        ? dealsData.find((deal) => String(deal.id) === scope.dataset.homeOfferId)
        : dealsData[index];
      return item ? { scope, item, expiry: expiryDate(item.valid_until) } : null;
    }).filter(Boolean);
    function makeOfferCardLink(card, item) {
      const body = card.querySelector('.featured-card__body');
      if (!body) return;
      const badge = body.querySelector('.featured-card__badge-pct');
      const imageFrame = document.createElement('div');
      imageFrame.className = 'home-offer-image-frame';
      const image = document.createElement('img');
      image.className = 'home-offer-image';
      image.src = Number(item.id) === 7 ? 'assets/images/image.JB.png'
        : Number(item.id) === 1 ? 'assets/images/image.4B.png'
        : Number(item.id) === 2 ? 'assets/images/golverdi.png'
          : ({ restaurant: 'assets/images/image1.png', cafe: 'assets/images/image1.png', gym: 'assets/images/image.png', shop: 'assets/images/image1.png', other: 'assets/images/image1.png' })[item.category] || 'assets/images/image1.png';
      image.alt = i18n.data('deals', item, 'business_name') || item.business_name;
      image.loading = 'lazy';
      imageFrame.append(image);
      if (badge) {
        badge.classList.add('home-offer-discount-badge');
        imageFrame.append(badge);
      }
      const link = document.createElement('a');
      link.href = `detail.html?section=deals&id=${encodeURIComponent(item.id)}`;
      link.className = 'home-offer-detail-link';
      const linkBody = document.createElement('div');
      linkBody.className = 'featured-card__body';
      while (body.firstChild) linkBody.append(body.firstChild);
      linkBody.insertAdjacentHTML('beforeend', `<span class="home-offer-link-cue">${escapeHtml(translate('common.viewDetails'))}</span>`);
      link.append(linkBody);
      link.prepend(imageFrame);
      card.prepend(link);
      body.remove();
    }
    const render = () => ordered.forEach(({ scope, item, expiry }) => {
      const card = scope?.querySelector('.featured-card');
      if (!card) return;
      const name = i18n.data('deals', item, 'business_name') || item.business_name || '';
      const discount = localize(item, 'discount');
      const description = localize(item, 'description');
      const validity = localize(item, 'valid_until');
      const expired = Boolean(expiry && expiry < new Date());
      const discountBadge = discount.match(/\d+(?:\.\d+)?%/)?.[0] || discount;
      const brief = description.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || description;
      card.classList.add('home-usable-offer');
      const status = validity ? `${expired ? `${translate('offers.expired')}: ` : `${translate('common.valid')} `}${validity.replace(/^(?:Demo Date|تاريخ تجريبي)\s*[–—-]\s*/i, '')}` : translate('offers.statusUnknown');
      card.innerHTML = `<div class="featured-card__body"><div class="featured-card__top">${discount ? `<span class="featured-card__badge-pct">${escapeHtml(discountBadge)}</span>` : ''}<div class="featured-card__text">${name ? `<h2 class="featured-card__main" dir="auto">${escapeHtml(name)}</h2>` : ''}${brief ? `<p class="featured-card__sub">${escapeHtml(brief)}</p>` : ''}</div></div><p class="home-offer-validity${expired ? ' is-expired' : ''}">${escapeHtml(status)}</p></div>`;
      card.dataset.offerId = String(item.id);
      makeOfferCardLink(card, item);
    });
    render();
    i18n.onChange(render);
  }
  /* === END FEATURE: usable home offer details === */

  function initHomeStudentOfferDetails() {
    const card = document.querySelector('.home-gemini-offer');
    const item = window.STUDENTHUB_BENEFITS?.offers?.find((offer) => offer.id === 'google-ai-student-2026');
    const i18n = window.StudentHubI18n;
    if (!card || !item || !i18n) return;
    const localize = (value) => typeof value === 'string' ? value : value?.[i18n.getLanguage()] || value?.en || '';
    const render = () => {
      const description = localize(item.description);
      const expiry = /^\d{4}-\d{2}-\d{2}$/.test(item.expiration || '') ? new Date(`${item.expiration}T23:59:59`) : null;
      const expired = Boolean(expiry && expiry < new Date());
      const status = expiry
        ? `${i18n.t(expired ? 'offers.expired' : 'common.valid')} ${item.expiration}`
        : i18n.t('offers.statusUnknown');
      const summary = description.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || description;
      card.href = `detail.html?section=studentOffers&id=${encodeURIComponent(item.id)}`;
      card.querySelector('.featured-card__main')?.replaceChildren(document.createTextNode(item.name));
      const sub = card.querySelector('.featured-card__sub');
      if (sub) sub.textContent = summary;
      const condition = card.querySelector('.home-gemini-offer__condition');
      if (condition) {
        condition.textContent = status;
        condition.classList.toggle('is-expired', expired);
      }
      const action = card.querySelector('.featured-card__btn');
      if (action) action.textContent = i18n.t('common.viewDetails');
    };
    render();
    i18n.onChange(render);
  }

  /* === FEATURE: home offers carousel === */
  function initHomeOffersCarousel() {
    const region = document.querySelector('[data-home-offers-carousel]');
    const track = region?.querySelector('[data-home-offers-track]');
    const dots = region?.querySelector('[data-offer-dots]');
    const previous = region?.querySelector('[data-offer-prev]');
    const next = region?.querySelector('[data-offer-next]');
    const cards = track ? [...track.children] : [];
    const i18n = window.StudentHubI18n;
    if (!region || !track || !dots || !previous || !next || !cards.length || !i18n) return;
    let activeIndex = 0;
    let frame = 0;
    dots.innerHTML = cards.map((_, index) => `<button class="home-offers-carousel__dot" type="button" data-offer-dot="${index}" aria-label=""></button>`).join('');
    const dotButtons = [...dots.querySelectorAll('[data-offer-dot]')];
    const language = () => i18n.getLanguage();
    const translate = (key, values) => i18n.t(key, values);
    const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function renderLabels() {
      region.setAttribute('aria-label', translate('home.offersCarouselLabel'));
      track.setAttribute('aria-label', translate('home.offersCarouselLabel'));
      previous.setAttribute('aria-label', translate('home.offerPrevious'));
      next.setAttribute('aria-label', translate('home.offerNext'));
      dotButtons.forEach((dot, index) => dot.setAttribute('aria-label', translate('home.offerSlide', { current: index + 1, total: cards.length })));
    }
    function nearestCard() {
      const rtl = getComputedStyle(track).direction === 'rtl';
      const bounds = track.getBoundingClientRect();
      let nearest = 0;
      let nearestDistance = Infinity;
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const distance = Math.abs(rtl ? bounds.right - rect.right : rect.left - bounds.left);
        if (distance < nearestDistance) { nearestDistance = distance; nearest = index; }
      });
      return nearest;
    }
    function sync(index = activeIndex) {
      activeIndex = Math.max(0, Math.min(cards.length - 1, index));
      dotButtons.forEach((dot, dotIndex) => {
        dot.setAttribute('aria-current', dotIndex === activeIndex ? 'true' : 'false');
      });
      previous.disabled = activeIndex === 0;
      next.disabled = activeIndex === cards.length - 1;
    }
    function goTo(index) {
      const target = Math.max(0, Math.min(cards.length - 1, index));
      const rtl = getComputedStyle(track).direction === 'rtl';
      const trackBounds = track.getBoundingClientRect();
      const cardBounds = cards[target].getBoundingClientRect();
      const offset = rtl ? cardBounds.right - trackBounds.right : cardBounds.left - trackBounds.left;
      track.scrollBy({ left: offset, behavior: reducedMotion() ? 'auto' : 'smooth' });
      sync(target);
    }
    previous.addEventListener('click', () => goTo(activeIndex - 1));
    next.addEventListener('click', () => goTo(activeIndex + 1));
    dotButtons.forEach((dot) => dot.addEventListener('click', () => goTo(Number(dot.dataset.offerDot))));
    track.addEventListener('scroll', () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { frame = 0; sync(nearestCard()); });
    }, { passive: true });
    track.addEventListener('keydown', (event) => {
      const rtl = getComputedStyle(track).direction === 'rtl';
      if (event.key === 'Home') { event.preventDefault(); goTo(0); }
      else if (event.key === 'End') { event.preventDefault(); goTo(cards.length - 1); }
      else if (event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) { event.preventDefault(); goTo(activeIndex + 1); }
      else if (event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) { event.preventDefault(); goTo(activeIndex - 1); }
    });
    renderLabels();
    sync(0);
    i18n.onChange(renderLabels);
  }
  /* === END FEATURE: home offers carousel === */

  /* === FEATURE: home offers four-second autoplay === */
  function initHomeOffersAutoplay() {
    const region = document.querySelector('[data-home-offers-carousel]');
    const track = region?.querySelector('[data-home-offers-track]');
    const dots = [...(region?.querySelectorAll('[data-offer-dot]') || [])];
    if (!region || !track || dots.length < 2) return;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let intervalId = 0;
    let resumeId = 0;
    let pointerInside = false;
    let focusInside = false;
    let touching = false;
    function stop() {
      window.clearInterval(intervalId);
      intervalId = 0;
    }
    function start() {
      if (intervalId || motionPreference.matches || document.hidden || pointerInside || focusInside || touching) return;
      intervalId = window.setInterval(() => {
        const current = dots.findIndex((dot) => dot.getAttribute('aria-current') === 'true');
        dots[(current + 1) % dots.length].click();
      }, 4000);
    }
    function pauseUntilResume() {
      stop();
      window.clearTimeout(resumeId);
      resumeId = window.setTimeout(start, 4000);
    }
    region.addEventListener('pointerenter', () => { pointerInside = true; stop(); });
    region.addEventListener('pointerleave', () => { pointerInside = false; start(); });
    region.addEventListener('focusin', () => { focusInside = true; stop(); });
    region.addEventListener('focusout', (event) => {
      if (!region.contains(event.relatedTarget)) { focusInside = false; start(); }
    });
    track.addEventListener('touchstart', () => { touching = true; stop(); }, { passive: true });
    track.addEventListener('touchend', () => { touching = false; pauseUntilResume(); }, { passive: true });
    track.addEventListener('touchcancel', () => { touching = false; pauseUntilResume(); }, { passive: true });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    motionPreference.addEventListener?.('change', () => motionPreference.matches ? stop() : start());
    start();
  }
  /* === END FEATURE: home offers four-second autoplay === */

  /* === FEATURE: rotating student services === */
  function initHomeServiceShowcase() {
    const region = document.querySelector('[data-home-service-showcase]');
    const track = region?.querySelector('[data-home-service-track]');
    const heading = region?.querySelector('[data-home-service-heading]');
    const dotsContainer = region?.querySelector('[data-home-service-dots]');
    const previous = region?.querySelector('[data-home-service-prev]');
    const next = region?.querySelector('[data-home-service-next]');
    const i18n = window.StudentHubI18n;
    if (!region || !track || !heading || !dotsContainer || !previous || !next || !i18n) return;
    const catalog = window.STUDENTHUB_BENEFITS;
    if (!catalog) return;
    // Keep local business data intact; this carousel reads the separate Benefits catalog.
    const technologyOffers = [
      ...(catalog.software || []).filter((item) => ['vscode', 'visual-studio-community'].includes(item.id)).map((item) => ({ item, kind: 'software', source: item.download, value: item.license, guide: item.guide })),
      ...(catalog.offers || []).filter((item) => ['github-pack', 'jetbrains-students', 'google-ai-student-2026'].includes(item.id)).map((item) => ({ item, kind: 'offer', source: item.information, value: item.price }))
    ];
    const useTechnologyOffers = true; // Set to false to restore the preserved local-business carousel.
    const offers = useTechnologyOffers ? technologyOffers : (typeof dealsData === 'undefined' ? [] : dealsData.map((item) => ({ item, kind: 'local' })));
    if (!offers.length) return;
    const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    let currentIndex = 0;
    let frame = 0;
    let intervalId = 0;
    let resumeId = 0;
    let pointerInside = false;
    let focusInside = false;
    let touching = false;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let cards = [];
    let dots = [];
    function render() {
      heading.textContent = i18n.t('home.servicesHeading');
      region.setAttribute('aria-label', i18n.t('home.servicesCarousel'));
      track.setAttribute('aria-label', i18n.t('home.servicesCarousel'));
      previous.setAttribute('aria-label', i18n.t('home.servicesPrevious'));
      next.setAttribute('aria-label', i18n.t('home.servicesNext'));
      track.innerHTML = offers.map(({ item, kind, source, value, guide }) => {
        if (kind === 'local') {
          const name = item.business_name || '';
          const discount = i18n.data('deals', item, 'discount') || item.discount || '';
          const description = i18n.data('deals', item, 'description') || item.description || '';
          const validity = i18n.data('deals', item, 'valid_until') || item.valid_until || '';
          const howTo = i18n.data('deals', item, 'how_to_use') || item.how_to_use || '';
          const badge = discount.match(/\d+(?:\.\d+)?%/)?.[0] || discount;
          const share = `https://wa.me/?text=${encodeURIComponent(`${name}\n${window.location.href}`)}`;
          return `<article class="featured-card home-service-offer"><a class="home-service-offer__link" href="deals.html"><div class="featured-card__body"><div class="featured-card__top">${badge ? `<span class="featured-card__badge-pct home-service-offer__badge">${escapeHtml(badge)}</span>` : ''}<span class="featured-card__text"><strong class="featured-card__main" dir="auto">${escapeHtml(name)}</strong>${description ? `<span class="featured-card__sub">${escapeHtml(description)}</span>` : ''}</span></div>${validity ? `<span class="home-service-offer__validity"><strong>${escapeHtml(i18n.t('home.validUntil'))}:</strong> ${escapeHtml(validity)}</span>` : ''}${howTo ? `<span class="home-service-offer__redeem"><span aria-hidden="true">✓</span><span><strong>${escapeHtml(i18n.t('home.howToRedeem'))}:</strong> ${escapeHtml(howTo)}</span></span>` : ''}<span class="home-service-offer__cta">${escapeHtml(i18n.t('home.viewOffer'))}<span class="home-service-offer__arrow" aria-hidden="true">→</span></span></div></a><div class="home-service-offer__actions"><a class="home-offer-action home-offer-action--share" href="${share}" target="_blank" rel="noopener noreferrer">${escapeHtml(i18n.t('home.shareOffer'))}</a></div></article>`;
        }
        const localize = (entry) => typeof entry === 'string' ? entry : entry?.[i18n.getLanguage()] || entry?.en || '';
        const name = localize(item.name);
        const provider = localize(item.provider);
        const description = localize(item.description);
        const valueLine = localize(value);
        const categoryKey = kind === 'software' ? 'home.categorySoftware' : item.category === 'ai' ? 'home.categoryAI' : item.category === 'cloud' ? 'home.categoryCloud' : 'home.categoryDeveloper';
        const categoryName = i18n.t(categoryKey);
        const categoryClass = kind === 'software' ? 'software' : item.category === 'ai' ? 'ai' : 'developer';
        const categoryIcon = kind === 'software' ? '&lt;/&gt;' : item.category === 'ai' ? '&#9733;' : '&#9729;';
        const badgeText = item.id === 'vscode' ? i18n.t('home.valueDownload') : item.id === 'visual-studio-community' ? i18n.t('home.valueTerms') : item.id === 'github-pack' ? i18n.t('home.valueVaries') : item.id === 'jetbrains-students' ? i18n.t('home.valueFree') : item.id === 'google-ai-student-2026' ? i18n.t('home.valueNoCost') : '';
        const validity = item.expiration || '';
        const howTo = item.howToRedeem || '';
        const safeLink = (url) => { try { const parsed = new URL(url); return parsed.protocol === 'https:' ? parsed.href : ''; } catch { return ''; } };
        const officialUrl = safeLink(source);
        const guideUrl = kind === 'software' && guide ? 'software-guides.html' : '';
        const logo = item.id === 'vscode' ? 'assets/images/vs.logo.png' : item.id === 'visual-studio-community' ? 'assets/images/image.Visual.png' : item.id === 'google-ai-student-2026' ? 'assets/images/imagegemeni.png' : '';
        const share = `https://wa.me/?text=${encodeURIComponent(`${name}\n${window.location.href}`)}`;
        const image = logo ? `<img class="home-service-offer__logo" src="${logo}" alt="" loading="lazy">` : '';
        const providerLine = provider ? `<span class="home-service-offer__provider">${escapeHtml(provider)}</span>` : '';
        const validityLine = validity ? `<span class="home-service-offer__validity"><strong>${escapeHtml(i18n.t('home.validUntil'))}:</strong> ${escapeHtml(validity)}</span>` : '';
        const reviewedLine = item.lastVerified ? `<span class="home-service-offer__reviewed"><strong>${escapeHtml(i18n.t('common.lastVerified'))}:</strong> ${escapeHtml(item.lastVerified)}</span>` : '';
        const redeemLine = howTo ? `<span class="home-service-offer__redeem"><span aria-hidden="true">✓</span><span><strong>${escapeHtml(i18n.t('home.howToRedeem'))}:</strong> ${escapeHtml(howTo)}</span></span>` : '';
        return `<article class="featured-card home-service-offer"><div class="home-service-offer__topline"><span class="home-service-offer__category home-service-offer__category--${categoryClass}"><span aria-hidden="true">${categoryIcon}</span>${escapeHtml(categoryName)}</span><span class="home-service-offer__demo">${escapeHtml(i18n.t('home.demoData'))}</span></div><a class="home-service-offer__link" href="${officialUrl || '#'}"${officialUrl ? ' target="_blank" rel="noopener noreferrer"' : ''}><div class="featured-card__body"><div class="featured-card__top">${badgeText ? `<span class="featured-card__badge-pct home-service-offer__badge">${escapeHtml(badgeText)}</span>` : ''}<span class="featured-card__text">${image}${name ? `<strong class="featured-card__main" dir="auto">${escapeHtml(name)}</strong>` : ''}${providerLine}${description ? `<span class="featured-card__sub">${escapeHtml(description)}</span>` : ''}</span></div>${validityLine}${redeemLine}${reviewedLine}<span class="home-service-offer__cta">${escapeHtml(i18n.t('common.viewDetails'))}<span class="home-service-offer__arrow" aria-hidden="true">→</span></span></div></a><div class="home-service-offer__actions">${guideUrl ? `<a class="home-offer-action" href="${guideUrl}">${escapeHtml(i18n.t('benefits.installGuide'))}</a>` : ''}${officialUrl ? `<a class="home-offer-action" href="${officialUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(i18n.t('benefits.source'))}</a>` : ''}<a class="home-offer-action home-offer-action--share" href="${share}" target="_blank" rel="noopener noreferrer">${escapeHtml(i18n.t('home.shareOffer'))}</a></div></article>`;
      }).join('');
      cards = [...track.children];
      dotsContainer.innerHTML = offers.map((_, index) => `<button type="button" class="home-service-dot" data-home-service-dot="${index}"></button>`).join('');
      dots = [...dotsContainer.querySelectorAll('[data-home-service-dot]')];
      dots.forEach((dot, index) => dot.setAttribute('aria-label', i18n.t('home.serviceSlide', { current: index + 1, total: cards.length })));
      sync(currentIndex);
    }
    function sync(index) {
      currentIndex = Math.max(0, Math.min(cards.length - 1, index));
      dots.forEach((dot, dotIndex) => dot.setAttribute('aria-current', dotIndex === currentIndex ? 'true' : 'false'));
    }
    function goTo(index) {
      const target = (index + cards.length) % cards.length;
      const rtl = getComputedStyle(track).direction === 'rtl';
      const trackBounds = track.getBoundingClientRect();
      const cardBounds = cards[target].getBoundingClientRect();
      const offset = rtl ? cardBounds.right - trackBounds.right : cardBounds.left - trackBounds.left;
      track.scrollBy({ left: offset, behavior: motionPreference.matches ? 'auto' : 'smooth' });
      sync(target);
    }
    function nearestCard() {
      const rtl = getComputedStyle(track).direction === 'rtl';
      const bounds = track.getBoundingClientRect();
      let nearest = 0;
      let distance = Infinity;
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const nextDistance = Math.abs(rtl ? bounds.right - rect.right : rect.left - bounds.left);
        if (nextDistance < distance) { distance = nextDistance; nearest = index; }
      });
      return nearest;
    }
    function stop() { window.clearInterval(intervalId); intervalId = 0; }
    function start() {
      if (intervalId || motionPreference.matches || document.hidden || pointerInside || focusInside || touching) return;
      intervalId = window.setInterval(() => goTo((currentIndex + 1) % cards.length), 6000);
    }
    function resumeAfterInteraction() {
      stop();
      window.clearTimeout(resumeId);
      resumeId = window.setTimeout(start, 6000);
    }
    previous.addEventListener('click', () => goTo(currentIndex - 1));
    next.addEventListener('click', () => goTo(currentIndex + 1));
    dotsContainer.addEventListener('click', (event) => {
      const dot = event.target.closest('[data-home-service-dot]');
      if (dot) goTo(Number(dot.dataset.homeServiceDot));
    });
    track.addEventListener('scroll', () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { frame = 0; sync(nearestCard()); });
    }, { passive: true });
    track.addEventListener('keydown', (event) => {
      const rtl = getComputedStyle(track).direction === 'rtl';
      if (event.key === 'Home') { event.preventDefault(); goTo(0); }
      else if (event.key === 'End') { event.preventDefault(); goTo(cards.length - 1); }
      else if (event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) { event.preventDefault(); goTo(currentIndex + 1); }
      else if (event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) { event.preventDefault(); goTo(currentIndex - 1); }
    });
    region.addEventListener('pointerenter', () => { pointerInside = true; stop(); });
    region.addEventListener('pointerleave', () => { pointerInside = false; start(); });
    region.addEventListener('focusin', () => { focusInside = true; stop(); });
    region.addEventListener('focusout', (event) => { if (!region.contains(event.relatedTarget)) { focusInside = false; start(); } });
    track.addEventListener('touchstart', () => { touching = true; stop(); }, { passive: true });
    track.addEventListener('touchend', () => { touching = false; resumeAfterInteraction(); }, { passive: true });
    track.addEventListener('touchcancel', () => { touching = false; resumeAfterInteraction(); }, { passive: true });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    motionPreference.addEventListener?.('change', () => motionPreference.matches ? stop() : start());
    render();
    i18n.onChange(render);
    start();
  }
  /* === END FEATURE: rotating student services === */

  initHomeSkeletons();
  initHomeOfferDetails();
  initHomeStudentOfferDetails();
  initHomeOffersCarousel();
  initHomeOffersAutoplay();
  initHomeServiceShowcase();
})();
/* === END FEATURE: home skeleton loading === */
