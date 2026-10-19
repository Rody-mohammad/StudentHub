/**
 * js/main.js
 * ============================================================
 * Handles:
 *  - List pages: card rendering, search, category filter chips
 *  - Detail page: reads ?section=&id= from URL, renders full detail
 *  - Back button functionality for detail page
 * ============================================================
 */

/* ══════════════════════════════════════════════════════════
   ICON HELPERS (inline SVG)
   ══════════════════════════════════════════════════════════ */

const sectionIcon = (name) => `<span class="lucide-icon lucide-icon--${name} section-icon" aria-hidden="true"></span>`;

const ICONS = {
  search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="2" stroke-linecap="round"
     stroke-linejoin="round" aria-hidden="true">
     <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
   </svg>`,

  arrowLeft: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
     stroke-linejoin="round" aria-hidden="true">
     <path d="M19 12H5"/><path d="m12 5-7 7 7 7"/>
   </svg>`,

  pin: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="2" stroke-linecap="round"
     stroke-linejoin="round" aria-hidden="true">
     <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
     <circle cx="12" cy="10" r="3"/>
   </svg>`,

  tag: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="2" stroke-linecap="round"
     stroke-linejoin="round" aria-hidden="true">
     <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
     <line x1="7" y1="7" x2="7.01" y2="7"/>
   </svg>`,

  img: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.4" stroke-linecap="round"
     stroke-linejoin="round" aria-hidden="true">
     <rect x="3" y="3" width="18" height="18" rx="2"/>
     <circle cx="8.5" cy="8.5" r="1.5"/>
     <polyline points="21 15 16 10 5 21"/>
   </svg>`,

  noResults: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
     stroke-linejoin="round" aria-hidden="true">
     <circle cx="11" cy="11" r="8"/>
     <path d="m21 21-4.35-4.35"/>
     <path d="M8 11h6"/>
   </svg>`,

  bus: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="2" stroke-linecap="round"
     stroke-linejoin="round" aria-hidden="true">
     <rect x="3" y="4" width="18" height="12" rx="2"/>
     <path d="M8 20H6"/><path d="M18 20h-2"/>
     <path d="M8 16v4"/><path d="M16 16v4"/>
     <path d="M3 8h18"/>
   </svg>`,

  taxi: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="2" stroke-linecap="round"
     stroke-linejoin="round" aria-hidden="true">
     <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-4h8l2 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
     <circle cx="8" cy="17" r="2"/><circle cx="16" cy="17" r="2"/>
   </svg>`,

  shuttle: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="2" stroke-linecap="round"
     stroke-linejoin="round" aria-hidden="true">
     <path d="M2 17V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10"/>
     <path d="M2 12h20"/>
     <path d="M7 17v2"/><path d="M17 17v2"/>
     <circle cx="7" cy="19" r="1"/><circle cx="17" cy="19" r="1"/>
   </svg>`,

  deals: sectionIcon('badge-percent'),
  benefits: sectionIcon('graduation-cap'),
  housing: sectionIcon('building-2'),
  transportation: sectionIcon('bus'),

  flag: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="2" stroke-linecap="round"
     stroke-linejoin="round" aria-hidden="true">
     <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
     <line x1="4" y1="22" x2="4" y2="15"/>
   </svg>`,

  clock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="2" stroke-linecap="round"
     stroke-linejoin="round" aria-hidden="true">
     <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
   </svg>`,
};

const t = (key, params = {}) => window.StudentHubI18n?.t(key, params) || '';
const dataValue = (section, item, field, index) =>
  window.StudentHubI18n?.data(section, item, field, index) ?? item[field];

function searchableItemText(section, item) {
  const localized = Object.keys(item).map((field) => Array.isArray(item[field])
    ? item[field].map((_, index) => dataValue(section, item, field, index)).join(' ')
    : ['category', 'room_type', 'benefit_type', 'type'].includes(field)
      ? window.StudentHubI18n.category(item[field]) : dataValue(section, item, field)).join(' ');
  return `${JSON.stringify(item)} ${localized}`.toLowerCase();
}

function detailRowHtml(label, value) {
  const text = String(value ?? '').trim();
  if (!text || /^(not available|n\/a|none|null|undefined|-)$/i.test(text)) return '';
  return `<div class="detail-row"><span class="detail-row__label">${label}</span><span class="detail-row__value">${text}</span></div>`;
}

function detailSectionHtml(heading, content) {
  return content ? `<section class="detail-section"><h3>${heading}</h3>${content}</section>` : '';
}

function shortCardDescription(value) {
  const text = String(value || '').trim();
  const firstSentence = text.match(/^.*?[.!?](?:\s|$)/);
  return (firstSentence ? firstSentence[0] : text).trim();
}

function offerExpiry(value) {
  const normalized = normalizeTransportDigits(String(value || ''));
  const iso = normalized.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), 23, 59, 59, 999);
  const monthYear = normalized.match(/(?:^|[\s–—-])(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|يناير|فبراير|مارس|أبريل|ابريل|مايو|يونيو|يوليو|أغسطس|اغسطس|سبتمبر|أكتوبر|اكتوبر|نوفمبر|ديسمبر)\s+(\d{4})(?:$|\s)/i);
  if (!monthYear) return null;
  const arabicMonths = { يناير: 0, فبراير: 1, مارس: 2, أبريل: 3, ابريل: 3, مايو: 4, يونيو: 5, يوليو: 6, أغسطس: 7, اغسطس: 7, سبتمبر: 8, أكتوبر: 9, اكتوبر: 9, نوفمبر: 10, ديسمبر: 11 };
  const month = arabicMonths[monthYear[1]] ?? new Date(`${monthYear[1]} 1, ${monthYear[2]}`).getMonth();
  return Number.isNaN(month) ? null : new Date(Number(monthYear[2]), month + 1, 0, 23, 59, 59, 999);
}

function offerStatusHtml(value) {
  const text = String(value || '').trim();
  if (!text || /^(not available|n\/a|none|null|undefined|-)$/i.test(text)) {
    return `<span class="card__status card__status--unknown">${t('offers.statusUnknown')}</span>`;
  }
  const expiry = offerExpiry(text);
  const expired = expiry && expiry < new Date();
  return `<span class="card__status${expired ? ' card__status--expired' : ''}">${expired ? t('offers.expired') : t('common.valid')} ${text.replace(/^(?:Demo Date|تاريخ تجريبي)\s*[–—-]\s*/i, '')}</span>`;
}

function dealImage(item) {
  if (Number(item.id) === 1) return 'assets/images/image.4B.png';
  const images = {
    restaurant: 'assets/images/image1.png',
    cafe: 'assets/images/image1.png',
    gym: 'assets/images/image.png',
    shop: 'assets/images/image1.png',
    other: 'assets/images/image1.png',
  };
  return images[item.category] || 'assets/images/image1.png';
}

function housingImage() {
  return 'assets/images/image copy.png';
}

function detailImage(item, name, section) {
  const candidate = item.image || item.image_url || item.logo;
  const safeCandidate = typeof candidate === 'string' && /^(assets\/|https:\/\/)/i.test(candidate) ? candidate : '';
  if (safeCandidate) return `<div class="detail-photo-wrapper"><img src="${safeCandidate}" alt="${name}" class="detail-photo" loading="lazy" onerror="this.classList.add('detail-photo--missing')"><div class="detail-photo-overlay"></div></div>`;
  return '';
}

function optionalValue(section, item, field) {
  const value = dataValue(section, item, field);
  return typeof value === 'string' && /^(not available|n\/a|none|null|undefined|-)$/i.test(value.trim()) ? '' : value;
}

function getTransportIcon(type) {
  if (type === 'Bus') return ICONS.bus;
  if (type === 'Minibus') return ICONS.bus;
  if (type === 'Taxi' || type === 'Shared taxi') return ICONS.taxi;
  return ICONS.shuttle;
}

function transportTypeClass(type) {
  return ({ Bus: 'bus', Shuttle: 'shuttle', Minibus: 'minibus', 'Shared taxi': 'shared-taxi', Taxi: 'taxi' })[type] || 'bus';
}

function normalizeTransportDigits(value) {
  return String(value).replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))).replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));
}

function parseTransportTime(value) {
  const normalized = normalizeTransportDigits(value).toLowerCase().replace(/[٫]/g, ':');
  const match = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(a\s*\.?\s*m\.?|p\s*\.?\s*m\.?|صباحًا|صباحا|مساءً|مساء|ص|م)?/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const meridiem = (match[3] || '').replace(/[.\s]/g, '');
  if (hour > 23 || minute > 59) return null;
  if (['pm', 'م', 'مساء', 'مساءً', 'ظهرًا', 'ظهرا'].includes(meridiem)) { if (hour < 1 || hour > 12) return null; if (hour !== 12) hour += 12; }
  else if (['am', 'ص', 'صباحا', 'صباحًا'].includes(meridiem)) { if (hour < 1 || hour > 12) return null; if (hour === 12) hour = 0; }
  else if (hour > 12) return { hour, minute };
  else return null;
  return { hour, minute };
}

function getTransportAvailability(schedule) {
  const normalized = normalizeTransportDigits(schedule || '').toLowerCase();
  if (!normalized || /not available|غير متاح|غير متوف|لا يتوفر/.test(normalized)) return null;
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const timePattern = /\d{1,2}(?::\d{2})?\s*(?:a\.?\s*m\.?|p\.?\s*m\.?|صباحًا?|مساءً?|ظهرًا|ظهرا|ص|م)?/gi;
  const scheduleTimes = [...normalized.matchAll(timePattern)];
  const hasRange = /(?:\d[\d:٫]*\s*(?:a\.?m\.?|p\.?m\.?|صباحًا?|مساءً?|ظهرًا|ظهرا|ص|م)?\s*(?:–|—|-|\bto\b|إلى|الى)\s*\d)/i.test(normalized);
  if (hasRange && scheduleTimes.length >= 2) {
    const pair = scheduleTimes.slice(-2);
    const first = parseTransportTime(pair[0][0]);
    const second = parseTransportTime(pair[1][0]);
    if (!first || !second) return null;
    let start = first.hour * 60 + first.minute;
    let end = second.hour * 60 + second.minute;
    if (end < start) end += 1440;
    return (current >= start && current <= end) || (end > 1440 && current + 1440 <= end);
  }
  const times = scheduleTimes.map(match => match[0]).filter(value => /(?:a\.?\s*m\.?|p\.?\s*m\.?|صباحًا?|مساءً?|ظهرًا|ظهرا|ص|م)/i.test(value));
  if (!times.length || !/departure|departures|مغادرة|انطلاق|ينطلق|رحلة|الانطلاق/.test(normalized)) return null;
  const parsed = times.map(parseTransportTime);
  if (parsed.some(time => !time)) return null;
  return parsed.some(time => time.hour * 60 + time.minute === current);
}

function transportFareValue(fare) {
  const normalized = normalizeTransportDigits(fare || '').toLowerCase();
  if (!normalized || /not available|غير متاح|غير محدد/.test(normalized)) return null;
  if (/\bfree\b|مجاني|مجانًا|مجانا/.test(normalized)) return 0;
  const amount = normalized.replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return amount ? Number(amount[0]) : null;
}

function isFreeTransportFare(fare) {
  return transportFareValue(fare) === 0 && /\bfree\b|مجاني|مجانًا|مجانا/i.test(normalizeTransportDigits(fare || ''));
}

function getZakhoMapUrl() {
  const mapUrl = new URL('https://www.openstreetmap.org/search');
  mapUrl.searchParams.set('query', 'Zakho, Iraq');
  return mapUrl.href;
}

/* ══════════════════════════════════════════════════════════
   CATEGORY → LABEL MAP
   ══════════════════════════════════════════════════════════ */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ══════════════════════════════════════════════════════════
   DEALS PAGE
   ══════════════════════════════════════════════════════════ */
function initDealsPage() {
  const categories = ['All', 'restaurant', 'cafe', 'gym', 'shop', 'other'];
  const page = location.pathname.split('/').pop() || 'deals.html';
  const selectedCategory = page === 'restaurant-offers.html' ? 'restaurant'
    : page === 'gym-offers.html' ? 'gym' : 'All';
  const updateLabels = () => {
    const heading = document.getElementById('dealsHeading');
    const intro = document.getElementById('dealsIntro');
    const label = document.getElementById('dealsSearchLabel');
    const search = document.getElementById('searchInput');
    if (heading) heading.textContent = selectedCategory === 'restaurant' ? t('deals.restaurantHeading')
      : selectedCategory === 'gym' ? t('deals.gymHeading') : t('deals.heading');
    if (intro) intro.textContent = t('deals.intro');
    if (label) label.textContent = t('deals.search');
    if (search) search.placeholder = t('deals.searchPlaceholder');
    document.getElementById('filterChips')?.setAttribute('aria-label', t('deals.categories'));
  };
  updateLabels();
  window.StudentHubI18n?.onChange(updateLabels);
  renderListPage({
    data: dealsData,
    containerId: 'cardContainer',
    searchId: 'searchInput',
    chipsId: 'filterChips',
    categories,
    categoryField: 'category',
    renderCard: renderDealCard,
    section: 'deals',
    selectedCategory,
  });
}

function renderDealCard(item) {
  const name = dataValue('deals', item, 'business_name');
  const description = shortCardDescription(dataValue('deals', item, 'description'));
  const category = window.StudentHubI18n.category(item.category);
  const expiry = dataValue('deals', item, 'valid_until');
  const href = `detail.html?section=deals&id=${encodeURIComponent(item.id)}`;
  return `
    <article class="card card--compact" aria-label="${name}">
      <a class="card__link" href="${href}">
        <div class="card__photo-wrapper">
          <img src="${dealImage(item)}" alt="${name}" class="card__photo"
               loading="lazy" onerror="this.classList.add('card__photo--missing')">
          <span class="card__image-badge">${dataValue('deals', item, 'discount')}</span>
        </div>
        <div class="card__body">
          <span class="badge badge--gray">${category}</span>
          <h3 class="card__title">${name}</h3>
          ${description ? `<p class="card__desc">${description}</p>` : ''}
          ${offerStatusHtml(expiry)}
          <span class="btn btn--primary btn--sm">${t('common.viewDetails')}</span>
        </div>
      </a>
    </article>`;
}

/* ══════════════════════════════════════════════════════════
   BENEFITS PAGE
   ══════════════════════════════════════════════════════════ */
function initBenefitsPage() {
  const categories = ['All', 'AI tools', 'Development', 'Cloud', 'Productivity', 'Design'];
  renderListPage({
    data: benefitsData,
    containerId: 'cardContainer',
    searchId: 'searchInput',
    chipsId: 'filterChips',
    categories,
    categoryField: 'category',
    renderCard: renderBenefitCard,
    section: 'benefits',
  });
}

function renderBenefitCard(item) {
  const typeColor = item.benefit_type === 'Free' ? 'badge--amber' : 'badge--blue';
  const name = dataValue('benefits', item, 'name');
  const description = shortCardDescription(dataValue('benefits', item, 'description'));
  return `
    <article class="card card--compact" aria-label="${name}">
      <a class="card__link card__link--benefit" href="detail.html?section=benefits&id=${encodeURIComponent(item.id)}">
        <div class="card__body">
          <div class="card__meta">
          <span class="badge ${typeColor}">${window.StudentHubI18n.category(item.benefit_type)}</span>
          <span class="badge badge--gray">${window.StudentHubI18n.category(item.category)}</span>
          </div>
          <h3 class="card__title">${name}</h3>
          ${description ? `<p class="card__desc">${description}</p>` : ''}
          <span class="card__status">${t('common.verified')} ${dataValue('benefits', item, 'last_verified')}</span>
          <span class="btn btn--primary btn--sm">${t('common.viewDetails')}</span>
        </div>
      </a>
    </article>`;
}

/* ══════════════════════════════════════════════════════════
   HOUSING PAGE
   ══════════════════════════════════════════════════════════ */
function initHousingPage() {
  const results = document.getElementById('housingResults');
  const searchInput = document.getElementById('housingSearch');
  const categoriesEl = document.getElementById('universityCategories');
  const privateFilters = document.getElementById('privateFilters');
  const sortInput = document.getElementById('housingSort');
  const countEl = document.getElementById('housingCount');
  const tabs = [...document.querySelectorAll('[data-housing-section]')];
  if (!results) return;

  let activeSection = 'university';
  let activeCategory = 'All';
  let searchTerm = '';
  const categories = ['All', 'Single', 'Shared', 'Apartment'];
  const filters = {
    price: document.getElementById('housingPriceFilter'),
    rooms: document.getElementById('housingRoomsFilter'),
    furnished: document.getElementById('housingFurnishedFilter'),
  };

  function drawCategories() {
    if (!categoriesEl) return;
    const icons = { All: 'building-2', Single: 'house', Shared: 'house', Apartment: 'building-2' };
    categoriesEl.innerHTML = categories.map(category => `
      <button type="button" class="housing-category-chip housing-category-chip--${category.toLowerCase()}${activeCategory === category ? ' active' : ''}" aria-pressed="${activeCategory === category}" data-housing-category="${category}">
        <span class="lucide-icon lucide-icon--${icons[category]}" aria-hidden="true"></span><span>${category === 'All' ? t('filters.all') : window.StudentHubI18n.category(category)}</span>
      </button>`).join('');
  }

  function render() {
    const isUniversity = activeSection === 'university';
    privateFilters.hidden = isUniversity;
    categoriesEl.hidden = !isUniversity;
    results.setAttribute('aria-labelledby', isUniversity ? 'universityHousingTab' : 'privateHousingTab');
    tabs.forEach(tab => {
      const active = tab.dataset.housingSection === activeSection;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    let items = housingData.filter(item => housingIsUniversityHousing(item) === isUniversity);
    if (isUniversity && activeCategory !== 'All') items = items.filter(item => item.room_type === activeCategory);
    if (searchTerm) items = items.filter(item => housingSearchText(item).includes(searchTerm));

    if (!isUniversity) {
      const priceFilter = filters.price?.value || 'all';
      const roomsFilter = filters.rooms?.value || 'all';
      const furnishedFilter = filters.furnished?.value || 'all';
      if (priceFilter !== 'all') items = items.filter(item => housingPriceMatches(item, priceFilter));
      if (roomsFilter !== 'all') items = items.filter(item => housingRoomsMatch(item, roomsFilter));
      if (furnishedFilter !== 'all') items = items.filter(item => housingFurnished(item) === (furnishedFilter === 'yes'));
    }

    const sortMode = sortInput?.value || 'default';
    if (sortMode === 'cheapest') {
      items = [...items].sort((a, b) => compareKnownLast(housingPriceAmount(a), housingPriceAmount(b)));
    } else if (sortMode === 'closest') {
      items = [...items].sort((a, b) => compareKnownLast(housingDistance(a), housingDistance(b)));
    }

    countEl.textContent = t('housing.resultCount', { count: items.length });
    if (!items.length) {
      results.innerHTML = `<div class="housing-empty" role="status"><span class="lucide-icon lucide-icon--building-2" aria-hidden="true"></span><h2>${t('housing.emptyTitle')}</h2><p>${t('housing.emptyText')}</p><button type="button" class="housing-clear">${t('housing.clearFilters')}</button></div>`;
      results.querySelector('.housing-clear')?.addEventListener('click', clearFilters);
      return;
    }
    results.innerHTML = `<div class="housing-listing-grid">${items.map(renderHousingCard).join('')}</div>`;
  }

  function clearFilters() {
    activeCategory = 'All';
    searchTerm = '';
    if (searchInput) searchInput.value = '';
    Object.values(filters).forEach(select => { if (select) select.value = 'all'; });
    if (sortInput) sortInput.value = 'default';
    drawCategories();
    render();
  }

  drawCategories();
  categoriesEl?.addEventListener('click', event => {
    const button = event.target.closest('[data-housing-category]');
    if (!button) return;
    activeCategory = button.dataset.housingCategory;
    drawCategories();
    render();
  });
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      activeSection = tab.dataset.housingSection;
      render();
    });
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const rtl = document.documentElement.dir === 'rtl';
      const step = event.key === 'ArrowRight' ? (rtl ? -1 : 1) : (rtl ? 1 : -1);
      const targetIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + step + tabs.length) % tabs.length;
      tabs[targetIndex].focus();
      tabs[targetIndex].click();
    });
  });
  searchInput?.addEventListener('input', event => { searchTerm = event.target.value.toLowerCase().trim(); render(); });
  Object.values(filters).forEach(select => select?.addEventListener('change', render));
  sortInput?.addEventListener('change', render);
  window.StudentHubI18n?.onChange(() => { drawCategories(); render(); });
  render();
}

function housingIsUniversityHousing(item) {
  return ['housing_section', 'provider_type', 'provider'].some(field => /university|campus/i.test(String(item[field] || '')));
}

function housingSearchText(item) {
  return `${searchableItemText('housing', item)} ${dataValue('housing', item, 'title')} ${dataValue('housing', item, 'neighborhood')}`.toLowerCase();
}

function housingPriceAmount(item) {
  const price = item.student_price_per_month ?? item.discounted_price_per_month ?? item.price_per_month;
  if (typeof price === 'number') return Number.isFinite(price) ? price : null;
  const normalized = normalizeTransportDigits(price || '').replace(/,/g, '');
  if (/\bfree\b|مجاني|مجانًا|مجانا/i.test(normalized)) return 0;
  const match = normalized.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function housingIsFree(item) {
  return housingPriceAmount(item) === 0 && (typeof item.price_per_month === 'number' && item.price_per_month === 0 || /\bfree\b|مجاني|مجانًا|مجانا/i.test(normalizeTransportDigits(item.price_per_month || '')));
}

function housingDiscount(item) {
  const originalPrice = item.original_price_per_month;
  const percent = Number.parseFloat(item.student_discount_percent ?? item.discount_percent);
  const discountedPrice = item.student_price_per_month ?? item.discounted_price_per_month;
  if (!originalPrice || !Number.isFinite(percent) || percent <= 0) return null;
  const original = housingPriceAmount({ price_per_month: originalPrice });
  const discounted = discountedPrice ? housingPriceAmount({ price_per_month: discountedPrice }) : Math.round(original * (1 - percent / 100));
  if (original === null || discounted === null) return null;
  return { original, discounted, percent };
}

function housingPriceMatches(item, range) {
  const price = housingPriceAmount(item);
  if (price === null) return false;
  if (range === 'under100') return price < 100000;
  if (range === '100to200') return price >= 100000 && price <= 200000;
  if (range === 'over200') return price > 200000;
  return true;
}

function housingBedrooms(item) {
  const explicit = item.bedroom_count ?? item.bedrooms ?? item.room_count;
  if (explicit !== undefined && explicit !== null && explicit !== '') return Number(explicit) || null;
  const text = [item.title, item.description, ...(item.facilities || [])].join(' ');
  const match = normalizeTransportDigits(text).match(/(\d+)\s*[- ]?bedrooms?|bedrooms?\s*[:：]?\s*(\d+)/i);
  if (match) return Number(match[1] || match[2]);
  if (/\bstudio\b/i.test(text)) return 1;
  return null;
}

function housingRoomsMatch(item, range) {
  const rooms = housingBedrooms(item);
  if (rooms === null) return false;
  if (range === '1') return rooms === 1;
  if (range === '2') return rooms === 2;
  if (range === '3plus') return rooms >= 3;
  return true;
}

function housingFurnished(item) {
  if (typeof item.furnished === 'boolean') return item.furnished;
  const text = [item.title, item.description, ...(item.facilities || [])].join(' ');
  if (/\bunfurnished\b|\bnot furnished\b|غير مفروش/i.test(text)) return false;
  if (/\bfurnished\b|\bfurnishings\b|مفروش/i.test(text)) return true;
  return null;
}

function housingDistance(item) {
  const value = item.distance_to_university_km ?? item.distance_km ?? item.distance_to_university;
  if (value === undefined || value === null || value === '') return null;
  const match = normalizeTransportDigits(value).match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function compareKnownLast(a, b) {
  if (a === null && b !== null) return 1;
  if (b === null && a !== null) return -1;
  return a === null || b === null ? 0 : a - b;
}

function housingPhone(item) {
  const value = item.phone ?? item.contact;
  if (!value) return '';
  const normalized = normalizeTransportDigits(value);
  const digits = normalized.replace(/[^\d+]/g, '');
  return digits.length >= 7 ? digits : '';
}

function housingIcon(kind) {
  const paths = {
    bed: '<path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 14h18M5 9V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"/><path d="M3 18v2m18-2v2"/>',
    wifi: '<path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>',
    pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-7h6v7"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[kind] || paths.check}</svg>`;
}

function renderHousingCard(item) {
  const title = dataValue('housing', item, 'title');
  const neighborhood = dataValue('housing', item, 'neighborhood');
  const description = shortCardDescription(dataValue('housing', item, 'description'));
  const isUniversity = housingIsUniversityHousing(item);
  const discount = housingDiscount(item);
  const price = isUniversity && housingIsFree(item) ? `<span class="housing-free">${t('benefit.free')}</span>` : discount
    ? `<div class="housing-price"><del>${discount.original.toLocaleString()} IQD</del><strong>${discount.discounted.toLocaleString()} IQD <small>/ ${t('common.monthShort')}</small></strong><span class="housing-discount">${t('housing.discountBadge', { percent: discount.percent })}</span></div>`
    : item.price_per_month ? `<div class="housing-price"><strong>${item.price_per_month} <small>/ ${t('common.monthShort')}</small></strong></div>` : '';
  const location = neighborhood ? `<p class="housing-listing__location">${housingIcon('pin')}<span>${neighborhood}</span></p>` : '';
  const image = housingImage();
  return `
    <article class="housing-listing${isUniversity ? ' housing-listing--university' : ' housing-listing--private'}" aria-label="${title}">
      <a class="housing-listing__link" href="detail.html?section=housing&id=${encodeURIComponent(item.id)}">
        <div class="housing-listing__image-wrap">
          <img src="${image}" alt="${title}" class="housing-listing__image" loading="lazy" onerror="this.classList.add('housing-listing__image--missing')">
          <span class="housing-listing__section-badge">${isUniversity ? t('housing.universityBadge') : t('housing.privateBadge')}</span>
        </div>
        <div class="housing-listing__body">
          <h2 class="housing-listing__title">${title}</h2>
          ${price}
          ${location}
          ${description ? `<p class="housing-listing__description">${description}</p>` : ''}
          <span class="btn btn--primary btn--sm">${t('common.viewDetails')}</span>
        </div>
      </a>
    </article>`;
}

/* ══════════════════════════════════════════════════════════
   TRANSPORTATION PAGE
   ══════════════════════════════════════════════════════════ */
function initTransportationPage() {
  const container   = document.getElementById('cardContainer');
  const searchInput = document.getElementById('searchInput');
  const chipsEl     = document.getElementById('filterChips');
  const suggestionsEl = document.getElementById('searchSuggestions');
  const sortInput = document.getElementById('transportSort');
  const countEl = document.getElementById('transportCount');
  if (!container) return;

  const categories = ['All', 'Bus', 'Shuttle', 'Minibus', 'Shared taxi', 'Taxi'];
  const page = location.pathname.split('/').pop() || 'transportation.html';
  const allowedIds = page === 'transport-zakho.html' ? [1, 2, 3, 4]
    : page === 'transport-external.html' ? [5, 6] : null;
  let activeCategory = 'All';
  let searchTerm = '';
  let sortMode = 'default';
  const typeIcons = { Bus: ICONS.bus, Shuttle: ICONS.shuttle, Minibus: ICONS.bus, 'Shared taxi': ICONS.taxi, Taxi: ICONS.taxi };
  const updateLabels = () => {
    const heading = document.getElementById('transportHeading');
    const intro = document.getElementById('transportIntro');
    const banner = document.getElementById('transportDemoNotice');
    const searchLabel = document.getElementById('transportSearchLabel');
    const searchBox = document.getElementById('searchInput');
    if (heading) heading.textContent = page === 'transport-zakho.html' ? t('transportation.localTitle')
      : page === 'transport-external.html' ? t('transportation.external') : t('pageTitle.transportation');
    if (intro) intro.textContent = t('transportation.intro');
    if (banner) banner.textContent = t('common.fictionalTransportNotice');
    if (searchLabel) searchLabel.textContent = t('transportation.searchLabel');
    if (searchBox) searchBox.placeholder = t('transportation.searchPlaceholder');
    chipsEl?.setAttribute('aria-label', t('transportation.filterLabel'));
  };
  updateLabels();
  window.StudentHubI18n?.onChange(updateLabels);

  // Build chips
  function drawChips() { buildChips(chipsEl, categories, (cat) => {
    activeCategory = cat;
    renderTransport();
  }, activeCategory);
    chipsEl?.querySelectorAll('.chip').forEach((button, index) => {
      const category = categories[index];
      const icon = typeIcons[category] || ICONS.bus;
      button.classList.add(`transport-filter--${category === 'All' ? 'all' : transportTypeClass(category)}`);
      button.innerHTML = `${icon}<span>${window.StudentHubI18n?.category(category) ?? category}</span>`;
    });
  }
  drawChips();

  function drawSuggestions() {
    const suggestions = [...new Set(transportationData.flatMap(item => [
      dataValue('transportation', item, 'pickup_point'), dataValue('transportation', item, 'dropoff_point'),
    ]))].slice(0, 3);
    if (suggestionsEl) suggestionsEl.innerHTML = suggestions.map(value => `<button type="button" class="transport-suggestion">${String(value).replace(/\s*\(fictional\)/i, '').replace(/Demo\s+/i, '')}</button>`).join('');
  }
  drawSuggestions();
  suggestionsEl?.addEventListener('click', event => {
    const button = event.target.closest('.transport-suggestion');
    if (!button || !searchInput) return;
    searchInput.value = button.textContent;
    searchTerm = button.textContent.toLowerCase().trim();
    renderTransport();
  });
  sortInput?.addEventListener('change', () => { sortMode = sortInput.value; renderTransport(); });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      renderTransport();
    });
  }

  function renderTransport() {
    let items = allowedIds ? transportationData.filter(item => allowedIds.includes(Number(item.id))) : transportationData;
    if (activeCategory !== 'All') {
      items = items.filter(i => i.type === activeCategory);
    }
    if (searchTerm) {
      items = items.filter(i => searchableItemText('transportation', i).includes(searchTerm));
    }

    if (sortMode === 'available') {
      items = [...items].sort((a, b) => {
        const aAvailable = getTransportAvailability(dataValue('transportation', a, 'schedule_note'));
        const bAvailable = getTransportAvailability(dataValue('transportation', b, 'schedule_note'));
        const rank = value => value === true ? 0 : value === false ? 1 : 2;
        return rank(aAvailable) - rank(bAvailable);
      });
    } else if (sortMode === 'cheapest') {
      items = [...items].sort((a, b) => {
        const aFare = dataValue('transportation', a, 'fare');
        const bFare = dataValue('transportation', b, 'fare');
        const av = transportFareValue(aFare), bv = transportFareValue(bFare);
        if (isFreeTransportFare(aFare) !== isFreeTransportFare(bFare)) return isFreeTransportFare(aFare) ? -1 : 1;
        if (av === null && bv !== null) return 1;
        if (bv === null && av !== null) return -1;
        return av === null || bv === null ? 0 : av - bv;
      });
    }

    if (countEl) countEl.textContent = t('transportation.resultCount', { count: items.length });

    if (items.length === 0) {
      container.innerHTML = `<div class="transport-empty" role="status"><div aria-hidden="true">${ICONS.noResults}</div><h2>${t('transportation.emptyTitle')}</h2><p>${t('transportation.emptyText')}</p><button type="button" class="transport-clear">${t('transportation.clearFilters')}</button></div>`;
      container.querySelector('.transport-clear')?.addEventListener('click', () => {
        activeCategory = 'All'; searchTerm = ''; sortMode = 'default';
        if (searchInput) searchInput.value = '';
        if (sortInput) sortInput.value = 'default';
        drawChips(); renderTransport();
      });
      return;
    }

    container.innerHTML = `<div class="transport-grid">${items.map(renderTransportCard).join('')}</div>`;
  }

  renderTransport();
  window.StudentHubI18n?.onChange(() => { drawChips(); drawSuggestions(); renderTransport(); });
}

function renderTransportCard(item) {
  const routeName = dataValue('transportation', item, 'route_name');
  const fare = dataValue('transportation', item, 'fare') || '';
  const pickup = dataValue('transportation', item, 'pickup_point');
  const dropoff = dataValue('transportation', item, 'dropoff_point');
  return `
    <article class="transport-route transport-route--${transportTypeClass(item.type)}" aria-label="${routeName}">
      <a class="transport-route__link" href="detail.html?section=transportation&id=${encodeURIComponent(item.id)}">
        <div class="transport-route__header"><span class="transport-route__type">${getTransportIcon(item.type)}${window.StudentHubI18n.category(item.type)}</span></div>
        <h2 class="transport-route__title">${routeName}</h2>
        ${(pickup || dropoff) ? `<p class="transport-route__summary">${[pickup, dropoff].filter(Boolean).join(' → ')}</p>` : ''}
        ${fare && !/demo|fictional/i.test(fare) ? `<div class="transport-price">${isFreeTransportFare(fare) ? `<span class="transport-free">${t('transportation.freeBadge')}</span>` : `<strong>${fare}</strong>`}</div>` : ''}
        <span class="btn btn--primary btn--sm">${t('common.viewDetails')}</span>
      </a>
    </article>`;
}

function parseTransportScheduleChips(schedule) {
  const normalized = normalizeTransportDigits(schedule || '').replace(/^Demo times:\s*/i, '').replace(/\s*\(fictional\)/i, '').trim();
  if (!normalized || /not available|غير متاح|غير متوفر/i.test(normalized)) return [];
  const clean = normalized.replace(/^أوقات تجريبية:\s*/i, '').replace(/^مواعيد تجريبية:\s*/i, '');
  const range = clean.match(/(.+?),\s*(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?|صباحًا?|مساءً?|ص|م)?\s*[–—-]\s*\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?|صباحًا?|مساءً?|ص|م))/i);
  if (range) return [range[1].replace(/[,.]$/, '').trim(), range[2].trim()];
  const timePattern = /\d{1,2}(?::\d{2})?\s*(?:a\.?\s*m\.?|p\.?\s*m\.?|صباحًا?|مساءً?|ظهرًا|ظهرا|ص|م)?/gi;
  const times = [...clean.matchAll(timePattern)];
  const hasTextRange = /\bfrom\b|\bto\b|من|إلى|الى/i.test(clean);
  if (times.length >= 2 && hasTextRange) {
    const first = times[0];
    const last = times[times.length - 1];
    const leading = clean.slice(0, first.index).replace(/(?:from|من)\s*$/i, '').replace(/[،,\s]+$/, '').trim();
    const timeRange = clean.slice(first.index, last.index + last[0].length).trim();
    return [leading, timeRange].filter(Boolean);
  }
  const commaParts = clean.split(/[،,]/).map(part => part.trim()).filter(Boolean);
  if (commaParts.length > 1) return commaParts;
  const departures = clean.match(/(?:Available\s+)?(?:daily\s+)?(?:at\s+)?(.+?departure(?:s)?|\d{1,2}:[^,]+)/i);
  if (departures) return [departures[1].replace(/\s+departure(?:s)?/i, ' departures').trim()];
  return [clean];
}

/* ══════════════════════════════════════════════════════════
   GENERIC LIST PAGE RENDERER
   ══════════════════════════════════════════════════════════ */
function renderListPage({ data, containerId, searchId, chipsId, categories,
                          categoryField, renderCard, section, selectedCategory = 'All' }) {
  const container   = document.getElementById(containerId);
  const searchInput = document.getElementById(searchId);
  const chipsEl     = document.getElementById(chipsId);
  if (!container) return;

  let activeCategory = selectedCategory;
  let searchTerm = '';

  function drawChips() { buildChips(chipsEl, categories, (cat) => {
    activeCategory = cat;
    render();
  }, activeCategory); }
  drawChips();

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      render();
    });
  }

  function render() {
    let items = data;
    if (activeCategory !== 'All') {
      items = items.filter(i => i[categoryField] === activeCategory);
    }
    if (searchTerm) {
      items = items.filter(i => searchableItemText(section, i).includes(searchTerm));
    }

    if (items.length === 0) {
      container.innerHTML = noResultsHtml();
      return;
    }

    container.innerHTML = `<div class="card-grid">${items.map(renderCard).join('')}</div>`;
  }

  render();
  window.StudentHubI18n?.onChange(() => { drawChips(); render(); });
}

/* ── Chip builder ─────────────────────────────────────────── */
function buildChips(container, categories, onSelect, selectedCategory = 'All') {
  if (!container) return;
  container.innerHTML = '';
  categories.forEach((cat, idx) => {
    const btn = document.createElement('button');
    const selected = selectedCategory === cat;
    btn.className = 'chip' + (selected ? ' active' : '');
    btn.textContent = window.StudentHubI18n?.category(cat) ?? cat;
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
    btn.addEventListener('click', () => {
      container.querySelectorAll('.chip').forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      onSelect(cat);
    });
    container.appendChild(btn);
  });
}

/* ── No results HTML ──────────────────────────────────────── */
function noResultsHtml() {
  return `
    <div class="no-results" role="status" aria-live="polite">
      <div class="no-results__icon" aria-hidden="true">${ICONS.noResults}</div>
      <h3>${t('common.noResultsTitle')}</h3>
      <p>${t('common.noResultsText')}</p>
    </div>`;
}

/* ══════════════════════════════════════════════════════════
   DETAIL PAGE
   ══════════════════════════════════════════════════════════ */
function initDetailPage() {
  const params  = new URLSearchParams(window.location.search);
  const section = params.get('section');
  const id      = params.get('id');

  const container = document.getElementById('detailContainer');
  if (!container) return;
  if (!initDetailPage.refreshRegistered) {
    window.StudentHubI18n?.onChange(initDetailPage);
    initDetailPage.refreshRegistered = true;
  }


  const dataMap = {
    deals:          { data: dealsData,          render: renderDealDetail },
    benefits:       { data: benefitsData,        render: renderBenefitsDetail },
    housing:        { data: housingData,         render: renderHousingDetail },
    transportation: { data: transportationData,  render: renderTransportDetail },
    books:          { data: window.STUDENTHUB_BENEFITS?.books || [], render: renderBookDetail, back: 'book-discounts.html' },
    studentOffers:  { data: window.STUDENTHUB_BENEFITS?.offers || [], render: renderStudentOfferDetail, back: 'digital-offers.html' },
    software:       { data: window.STUDENTHUB_BENEFITS?.software || [], render: renderSoftwareDetail, back: 'software-guides.html' },
  };

  if (!section || !dataMap[section]) {
    container.innerHTML = errorHtml(t('common.invalidSection'), t('common.invalidSectionText'), '#');
    return;
  }

  const { data, render } = dataMap[section];
  const item = data.find(d => String(d.id) === id);

  if (!item) {
    const backHref = dataMap[section]?.back || `${section}.html`;
    container.innerHTML = errorHtml(t('common.itemNotFound'),
      t('common.itemNotFoundText', { id }), backHref);
    return;
  }

  // Update page title
  const titleEl = document.getElementById('detailPageTitle');
  if (titleEl) titleEl.textContent = getItemTitle(section, item);

  container.innerHTML = render(item, section);

  // Wire report button if present
  const reportBtn = document.getElementById('reportBtn');
  if (reportBtn) {
    reportBtn.addEventListener('click', () => {
      const msg = document.getElementById('reportMsg');
      if (msg) msg.classList.add('visible');
    });
  }
}

function getItemTitle(section, item) {
  if (section === 'deals')          return dataValue(section, item, 'business_name');
  if (section === 'benefits')       return dataValue(section, item, 'name');
  if (section === 'books' || section === 'studentOffers' || section === 'software') return typeof item.name === 'string' ? item.name : item.name?.[window.StudentHubI18n?.getLanguage() || 'en'] || item.name?.en || '';
  if (section === 'housing')        return dataValue(section, item, 'title');
  if (section === 'transportation') return dataValue(section, item, 'route_name');
  return t('pageTitle.detail');
}

function backLinkHtml(section) {
  return `<a href="${section}.html" class="back-link">
    ${ICONS.arrowLeft} ${t('common.back')} ${window.StudentHubI18n.category(section)}
  </a>`;
}

function renderBookDetail(item) {
  const language = window.StudentHubI18n?.getLanguage() || 'en';
  const localize = (value) => typeof value === 'string' ? value : value?.[language] || value?.en || '';
  const name = localize(item.name);
  const description = localize(item.description);
  const provider = localize(item.provider);
  const services = localize(item.services);
  const location = typeof item.location === 'string' && item.location.startsWith('benefits.') ? t(item.location) : localize(item.location);
  return `<div class="detail-card"><h2 class="detail-card__title">${name}</h2>${item.kind ? `<div class="detail-meta"><span class="badge badge--gray">${window.StudentHubI18n.category(item.kind)}</span></div>` : ''}${detailSectionHtml(t('offers.description'), description ? `<p>${description}</p>` : '')}${detailSectionHtml(t('common.contact'), detailRowHtml(t('benefits.provider'), provider))}${detailSectionHtml(t('benefits.services'), detailRowHtml(t('benefits.services'), services))}${detailSectionHtml(t('common.location'), detailRowHtml(t('common.location'), location))}</div><div class="detail-notice">${t('common.demoNotice')}</div>`;
}

/* ── Deal detail ──────────────────────────────────────────── */
function renderDealDetail(item, section) {
  const name = dataValue(section, item, 'business_name');
  const image = detailImage(item, name, section) || `<div class="detail-photo-wrapper"><img src="${dealImage(item)}" alt="${name}" class="detail-photo" loading="lazy"></div>`;
  const websiteCandidate = item.website || item.url || '';
  let safeWebsite = '';
  try {
    const website = new URL(websiteCandidate);
    if (website.protocol === 'https:') safeWebsite = website.href;
  } catch {}
  const isDemo = /demo|fictional/i.test(JSON.stringify(item));
  const summary = String(dataValue(section, item, 'description') || '').trim();
  const location = optionalValue(section, item, 'location');
  const discount = optionalValue(section, item, 'discount');
  const expiry = optionalValue(section, item, 'valid_until');
  const eligibility = optionalValue(section, item, 'eligibility');
  const terms = optionalValue(section, item, 'terms');
  const redemption = optionalValue(section, item, 'how_to_use');
  const included = optionalValue(section, item, 'included');
  const exclusions = optionalValue(section, item, 'exclusions');
  const contact = optionalValue(section, item, 'contact');
  const mapUrl = typeof item.map_url === 'string' && /^https:\/\//i.test(item.map_url) ? item.map_url : '';
  return `
    ${image}
    <div class="detail-card">
      <h2 class="detail-card__title">${name}</h2>
      <div class="detail-meta">
        ${discount ? `<span class="badge badge--amber">${discount}</span>` : ''}
        ${item.category ? `<span class="badge badge--gray">${window.StudentHubI18n.category(item.category)}</span>` : ''}
      </div>
      ${detailSectionHtml(t('offers.description'), summary ? `<p>${dataValue(section, item, 'description')}</p>` : '')}
      ${detailSectionHtml(t('offers.offerDetails'), `${detailRowHtml(t('common.discount'), discount)}${detailRowHtml(t('offers.status'), expiry ? `${offerStatusHtml(expiry)}` : t('offers.statusUnknown'))}${detailRowHtml(t('common.eligibility'), eligibility)}${detailRowHtml(t('offers.included'), included)}${detailRowHtml(t('common.terms'), terms)}${detailRowHtml(t('offers.exclusions'), exclusions)}`)}
      ${detailSectionHtml(t('common.howToUse'), redemption ? `<p>${redemption}</p>` : '')}
      ${detailSectionHtml(t('common.location'), location ? `<p>${location}</p>` : '')}
      ${detailSectionHtml(t('common.contact'), contact ? `<p>${contact}</p>` : '')}
      ${mapUrl ? `<a class="btn btn--ghost btn--sm" href="${mapUrl}" target="_blank" rel="noopener noreferrer">${ICONS.pin}${t('transportation.mapArea')}</a>` : ''}
      ${safeWebsite ? `<a class="btn btn--ghost btn--sm" href="${safeWebsite}" target="_blank" rel="noopener noreferrer">${t('benefits.source')}</a>` : ''}
    </div>
    ${isDemo ? `<div class="detail-notice">⚠️ ${t('common.demoNotice')}</div>` : ''}`;
}

/* ── Benefits detail ──────────────────────────────────────── */
function renderBenefitsDetail(item, section) {
  const typeColor = item.benefit_type === 'Free' ? 'badge--amber' : 'badge--blue';
  const name = dataValue(section, item, 'name');
  const description = String(dataValue(section, item, 'description') || '').trim();
  return `
    <div class="detail-icon-circle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    </div>
    <div class="detail-card">
      <h2 class="detail-card__title">${name}</h2>
      <div class="detail-meta">
        ${item.benefit_type ? `<span class="badge ${typeColor}">${window.StudentHubI18n.category(item.benefit_type)}</span>` : ''}
        ${item.category ? `<span class="badge badge--gray">${window.StudentHubI18n.category(item.category)}</span>` : ''}
      </div>
      ${description ? `<p>${dataValue(section, item, 'description')}</p>` : ''}
      ${detailRowHtml(t('common.eligibility'), optionalValue(section, item, 'eligibility'))}
      ${detailRowHtml(t('common.howToActivate'), optionalValue(section, item, 'how_to_activate'))}
      ${detailRowHtml(t('common.restrictions'), optionalValue(section, item, 'restrictions'))}
      ${detailRowHtml(t('common.lastVerified'), optionalValue(section, item, 'last_verified'))}
    </div>
    <div class="detail-notice">
      ℹ️ ${t('common.officialTermsNotice')}
    </div>`;
}

function renderStudentOfferDetail(item) {
  const lang = window.StudentHubI18n?.getLanguage() || 'en';
  const localize = (value) => typeof value === 'string' ? value : value?.[lang] || value?.en || '';
  const safeUrl = (value) => { try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; } };
  const description = localize(item.description);
  const duration = localize(item.duration);
  const price = localize(item.price);
  const eligibility = localize(item.eligibility);
  const source = safeUrl(item.information);
  const activation = safeUrl(item.activation);
  const expiration = item.expiration || '';
  const expiry = offerExpiry(expiration);
  const status = expiration && expiry ? `${expiry < new Date() ? t('offers.expired') : t('common.valid')} ${expiration}` : t('offers.statusUnknown');
  return `<div class="detail-card"><h2 class="detail-card__title">${item.name}</h2><div class="detail-meta">${item.provider ? `<span class="badge badge--blue">${item.provider}</span>` : ''}${item.category ? `<span class="badge badge--gray">${window.StudentHubI18n.category(item.category)}</span>` : ''}${item.offerType ? `<span class="badge badge--amber">${t(`benefits.type.${item.offerType}`)}</span>` : ''}</div>${detailSectionHtml(t('offers.description'), description ? `<p>${description}</p>` : '')}${detailSectionHtml(t('offers.offerDetails'), `${detailRowHtml(t('benefits.price'), price)}${detailRowHtml(t('benefits.eligibility'), eligibility)}${detailRowHtml(t('benefits.duration'), duration)}${detailRowHtml(t('offers.status'), status)}${detailRowHtml(t('benefits.lastVerified'), item.lastVerified)}`)}${activation ? `<a class="btn btn--primary btn--sm" href="${activation}" target="_blank" rel="noopener noreferrer">${t('benefits.apply')}</a>` : ''}${source ? `<a class="btn btn--ghost btn--sm" href="${source}" target="_blank" rel="noopener noreferrer">${t('benefits.source')}</a>` : ''}</div>`;
}

function renderSoftwareDetail(item) {
  const lang = window.StudentHubI18n?.getLanguage() || 'en';
  const localize = (value) => typeof value === 'string' ? value : value?.[lang] || value?.en || '';
  const safeUrl = (value) => { try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; } };
  const category = item.category ? window.StudentHubI18n.category(item.category) : '';
  const download = safeUrl(item.download);
  const guide = safeUrl(item.guide);
  return `<div class="detail-card"><h2 class="detail-card__title">${item.name}</h2>${category ? `<div class="detail-meta"><span class="badge badge--gray">${category}</span></div>` : ''}${localize(item.description) ? `<p>${localize(item.description)}</p>` : ''}${detailRowHtml(t('benefits.requirements'), item.systems)}${detailRowHtml(t('benefits.license'), localize(item.license))}${detailRowHtml(t('benefits.studentInfo'), localize(item.student))}${download ? `<a class="btn btn--primary btn--sm" href="${download}" target="_blank" rel="noopener noreferrer">${t('benefits.download')}</a>` : ''}${guide ? `<a class="btn btn--ghost btn--sm" href="${guide}" target="_blank" rel="noopener noreferrer">${t('benefits.installGuide')}</a>` : ''}</div>`;
}

/* ── Housing detail ───────────────────────────────────────── */
function renderHousingDetail(item, section) {
  const facilitiesHtml = (item.facilities || [])
    .map((_, index) => dataValue(section, item, 'facilities', index))
    .filter(value => String(value || '').trim() && !/^(not available|n\/a|none|null)$/i.test(String(value).trim()) && !(/bedrooms?/i.test(String(value)) && housingBedrooms(item) !== null))
    .map(value => `<span class="housing-fact-chip">${housingIcon(/wi-?fi/i.test(value) ? 'wifi' : /bed|room|غرف|نوم/i.test(value) ? 'bed' : 'check')}<span>${value}</span></span>`).join('');
  const title = dataValue(section, item, 'title');
  const neighborhood = dataValue(section, item, 'neighborhood');
  const description = dataValue(section, item, 'description');
  const phone = housingPhone(item);
  const discount = housingDiscount(item);
  const priceText = item.price_per_month || '';
  const optionalRow = (label, value) => value && !/^(not available|n\/a|none|null|undefined|-)$/i.test(String(value).trim()) ? `<div class="detail-row"><span class="detail-row__label">${label}</span><span class="detail-row__value">${value}</span></div>` : '';
  const distance = housingDistance(item);
  const rules = item.rules || item.conditions || item.house_rules || item.restrictions || '';
  const image = housingImage();
  const bedrooms = housingBedrooms(item);
  const furnished = housingFurnished(item);
  const extraFacts = [
    bedrooms ? `<span class="housing-fact-chip">${housingIcon('bed')}<span>${t('housing.bedrooms', { count: bedrooms })}</span></span>` : '',
    furnished === true ? `<span class="housing-fact-chip">${housingIcon('home')}<span>${t('housing.furnished')}</span></span>` : furnished === false ? `<span class="housing-fact-chip">${housingIcon('home')}<span>${t('housing.furnishedNo')}</span></span>` : '',
  ].filter(Boolean).join('');
  const priceBreakdown = discount
    ? `<section class="housing-detail-section"><h3>${t('housing.priceBreakdown')}</h3><p class="housing-detail-price"><del>${discount.original.toLocaleString()} IQD</del><strong>${discount.discounted.toLocaleString()} IQD / ${t('common.monthShort')}</strong><span class="housing-discount">${t('housing.discountBadge', { percent: discount.percent })}</span></p></section>`
    : housingIsFree(item) ? `<section class="housing-detail-section"><h3>${t('housing.priceBreakdown')}</h3><p class="housing-detail-price"><span class="housing-free">${t('benefit.free')}</span></p></section>`
      : priceText ? `<section class="housing-detail-section"><h3>${t('housing.priceBreakdown')}</h3><p class="housing-detail-price"><strong>${priceText} / ${t('common.monthShort')}</strong></p></section>` : '';
  return `
    <div class="detail-photo-wrapper">
      <img src="${image}" alt="${title}" class="detail-photo"
           loading="lazy" onerror="this.classList.add('detail-photo--missing')">
      <div class="detail-photo-overlay"></div>
    </div>
    <div class="detail-card">
      <h2 class="detail-card__title">${title}</h2>
      <div class="detail-meta">
        <span class="badge badge--blue">${window.StudentHubI18n.category(item.room_type)}</span>
        <span class="badge ${housingIsUniversityHousing(item) ? 'badge--blue' : 'badge--gray'}">${housingIsUniversityHousing(item) ? t('housing.universityBadge') : t('housing.privateBadge')}</span>
      </div>
      ${description ? `<p>${description}</p>` : ''}
      ${priceBreakdown}
      ${neighborhood || distance !== null ? `<section class="housing-detail-section"><h3>${t('common.location')}</h3>${optionalRow(t('common.neighborhood'), neighborhood)}${distance !== null ? optionalRow(t('housing.distanceLabel'), t('housing.distance', { distance })) : ''}</section>` : ''}
      ${facilitiesHtml || extraFacts ? `<section class="housing-detail-section"><h3>${t('common.facilities')}</h3><div class="housing-listing__facts">${extraFacts}${facilitiesHtml}</div></section>` : ''}
      ${item.room_type ? optionalRow(t('common.roomType'), window.StudentHubI18n.category(item.room_type)) : ''}
      ${optionalRow(t('housing.rules'), rules)}
      ${phone ? `<section class="housing-detail-section"><h3>${t('common.contact')}</h3><div class="housing-listing__actions"><a class="btn btn--primary btn--sm" href="tel:${phone}">${t('housing.call')}</a><a class="btn btn--ghost btn--sm" href="https://wa.me/${phone.replace(/\D/g, '')}" target="_blank" rel="noopener noreferrer">${t('housing.whatsapp')}</a></div></section>` : ''}
    </div>
    ${item.allow_reports ? `<div class="detail-card"><button id="reportBtn" class="btn btn--ghost btn--sm">${ICONS.flag} ${t('common.reportListing')}</button><div id="reportMsg" class="inline-msg">${t('common.demoReports')}</div></div>` : ''}
    <div class="detail-notice">
      ⚠️ ${t('common.fictionalListingNotice')}
    </div>`;
}

/* ── Transport detail ─────────────────────────────────────── */
function renderTransportDetail(item, section) {
  const routeName = dataValue(section, item, 'route_name');
  const isDemo = /demo|fictional/i.test(JSON.stringify(item));
  return `
    ${detailImage(item, routeName, section)}
    <div class="detail-card">
      <h2 class="detail-card__title">${routeName}</h2>
      <div class="detail-meta">
        <span class="badge badge--blue">${window.StudentHubI18n.category(item.type)}</span>
      </div>
      ${isDemo ? `<p>${t('common.fictionalTransportNotice')}</p>` : ''}
      ${detailRowHtml(t('common.pickup'), optionalValue(section, item, 'pickup_point'))}
      ${detailRowHtml(t('common.dropoff'), optionalValue(section, item, 'dropoff_point'))}
      ${detailRowHtml(t('common.schedule'), optionalValue(section, item, 'schedule_note'))}
      ${detailRowHtml(t('common.duration'), optionalValue(section, item, 'duration'))}
      ${detailRowHtml(t('common.fare'), optionalValue(section, item, 'fare'))}
      ${detailRowHtml(t('common.notes'), optionalValue(section, item, 'notes'))}
      ${detailRowHtml(t('common.contact'), optionalValue(section, item, 'contact'))}
    </div>
    <div class="detail-notice">
      ⚠️ ${t('common.fictionalTransportNotice')}
    </div>`;
}

/* ── Error HTML ───────────────────────────────────────────── */
function errorHtml(title, msg, backHref) {
  return `
    <div class="error-state">
      <div class="error-state__emoji">🔍</div>
      <h2>${title}</h2>
      <p>${msg}</p>
      <a href="${backHref}" class="btn btn--primary">${t('common.goBack')}</a>
    </div>`;
}

/* ══════════════════════════════════════════════════════════
   PAGE INIT ROUTER
   ══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const page = location.pathname.split('/').pop() || 'index.html';

  if (['deals.html', 'restaurant-offers.html', 'gym-offers.html'].includes(page)) initDealsPage();
  else if (page === 'benefits.html') initBenefitsPage();
  else if (page === 'housing.html') initHousingPage();
  else if (['transportation.html', 'transport-zakho.html', 'transport-external.html'].includes(page)) initTransportationPage();
  else if (page === 'detail.html') initDetailPage();

  // Back button functionality for detail page
      const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section');
    if (section === 'studentOffers') {
      backBtn.onclick = () => { window.location.href = 'digital-offers.html'; };
    } else if (section === 'software') {
      backBtn.onclick = () => { window.location.href = 'software-guides.html'; };
    } else if (section === 'books') {
      backBtn.onclick = () => { window.location.href = 'book-discounts.html'; };
    } else if (section) {
      backBtn.addEventListener('click', () => {
        window.location.href = `${section}.html`;
      });
    } else {
      backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }
  }
});
