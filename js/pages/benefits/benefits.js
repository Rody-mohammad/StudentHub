(() => {
  const page = document.querySelector('[data-benefit-page]');
  const i18n = window.StudentHubI18n;
  const catalog = window.STUDENTHUB_BENEFITS;
  if (!page || !i18n || !catalog) return;

  const section = page.dataset.benefitPage;
  const $ = (selector) => page.querySelector(selector);
  const search = document.getElementById('benefitSearch');
  const filters = $('[data-benefit-filters]');
  const results = $('[data-benefit-results]');
  const translate = (key) => i18n.t(key);
  const localize = (value) => typeof value === 'string' ? value : value?.[i18n.getLanguage()] || value?.en || '';
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const safeUrl = (value) => { try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; } };
  const expiryLabel = (value) => {
    if (!value) return `<span class="benefit-card__status">${escape(translate('offers.statusUnknown'))}</span>`;
    const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T23:59:59`) : null;
    if (!date || Number.isNaN(date.getTime())) return `<span class="benefit-card__status">${escape(translate('offers.statusUnknown'))}</span>`;
    const expired = date < new Date();
    return `<span class="benefit-card__status${expired ? ' is-expired' : ''}">${escape(expired ? translate('offers.expired') : translate('common.valid'))} ${escape(value)}</span>`;
  };
  const categories = section === 'books' ? { bookseller: 'benefits.filter.bookseller', study: 'benefits.filter.study' } : section === 'software'
    ? { programming: 'benefits.softwareCategory.programming', engineering: 'benefits.softwareCategory.engineering', database: 'benefits.softwareCategory.database', dataScience: 'benefits.softwareCategory.dataScience', multimedia: 'benefits.softwareCategory.multimedia', office: 'benefits.softwareCategory.office', networking: 'benefits.softwareCategory.networking' }
    : { ai: 'benefits.category.ai', productivity: 'benefits.category.productivity', cloud: 'benefits.category.cloud', developer: 'benefits.category.developer', learning: 'benefits.category.learning', design: 'benefits.category.design' };
  const offerTypes = ['completelyFree', 'freeStudentPlan', 'studentDiscount', 'freeTrial', 'institutional', 'partnerOffers'];
  const categoryAliases = { bookseller: ['bookseller', 'book seller', 'متجر كتب', 'متاجر الكتب'], study: ['study space', 'مكان دراسة', 'مساحة دراسة'] };
  let active = 'all';
  let activeType = 'all';
  let sort = 'default';
  const list = () => section === 'books' ? (catalog.books || []) : section === 'software' ? (catalog.software || []) : (catalog.offers || []);
  const searchText = (item) => Object.values(item).flatMap((value) => value && typeof value === 'object' ? Object.values(value) : [value]).filter((value) => typeof value === 'string').join(' ').toLocaleLowerCase();

  function matches(item) {
    const term = search?.value.trim().toLocaleLowerCase() || '';
    if (term && !searchText(item).includes(term) && !localize(item.name).toLocaleLowerCase().includes(term)) return false;
    if (section === 'offers' && activeType !== 'all' && item.offerType !== activeType) return false;
    if (active === 'all') return true;
    if (item.kind === active || item.category === active || item.categories?.includes(active)) return true;
    if ((categoryAliases[active] || []).some((alias) => searchText(item).includes(alias.toLocaleLowerCase())) && (active !== 'study' || item.kind === 'study')) return true;
    return false;
  }

  function renderFilters() {
    if (!filters) return;
    filters.setAttribute('aria-label', translate('benefits.filterLabel'));
    filters.innerHTML = `<button type="button" class="benefit-filter${active === 'all' ? ' is-active' : ''}" data-filter="all">${escape(translate('benefits.filterAll'))}</button>` + Object.entries(categories).map(([key, label]) => `<button type="button" class="benefit-filter${active === key ? ' is-active' : ''}" data-filter="${escape(key)}">${escape(translate(label))}</button>`).join('');
    filters.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => { active = button.dataset.filter; renderFilters(); renderResults(); }));
    const typeFilters = $('[data-benefit-types]');
    if (typeFilters && section === 'offers') {
      typeFilters.innerHTML = ['all', ...offerTypes].map((key) => `<button type="button" class="benefit-type-filter${activeType === key ? ' is-active' : ''}" data-offer-type="${key}">${escape(translate(key === 'all' ? 'benefits.filterAll' : `benefits.type.${key}`))}</button>`).join('');
      typeFilters.querySelectorAll('[data-offer-type]').forEach((button) => button.addEventListener('click', () => { activeType = button.dataset.offerType; renderFilters(); renderResults(); }));
    }
  }

  function bookCard(item) {
    const name = localize(item.name);
    return `<article class="benefit-card" data-kind="${escape(item.kind)}"><a class="benefit-card__link" href="detail.html?section=books&id=${encodeURIComponent(item.id)}"><div class="benefit-card__top"><span class="benefit-mark" aria-hidden="true">${escape(item.mark || name.slice(0, 2))}</span><span class="benefit-badge">${escape(translate(item.kind === 'study' ? 'benefits.studySpace' : 'benefits.seller'))}</span></div><h2>${escape(name)}</h2><span class="benefit-link">${escape(translate('common.viewDetails'))}</span></a></article>`;
  }

  function offerCard(item) {
    const price = localize(item.price);
    const free = /free|no cost/i.test(price);
    return `<article class="benefit-card" data-kind="offer"><a class="benefit-card__link" href="detail.html?section=studentOffers&id=${encodeURIComponent(item.id)}"><div class="benefit-card__top"><span class="benefit-mark" aria-hidden="true">${escape(item.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 3))}</span><span class="benefit-badge">${escape(translate(`benefits.type.${item.offerType}`))}</span></div><h2>${escape(item.name)}</h2>${item.provider ? `<p class="benefit-provider">${escape(item.provider)}</p>` : ''}${price.trim() ? `<p class="benefit-value ${free ? 'benefit-value--free' : 'benefit-value--limited'}">${free ? '✓ ' : ''}${escape(price)}</p>` : ''}<span class="benefit-link">${escape(translate('common.viewDetails'))}</span></a></article>`;
  }

  function softwareCard(item) {
    const category = translate(`benefits.softwareCategory.${item.category}`);
    return `<article class="benefit-card" data-kind="software"><a class="benefit-card__link" href="detail.html?section=software&id=${encodeURIComponent(item.id)}"><div class="benefit-card__top"><span class="benefit-mark" aria-hidden="true">${escape(item.mark || item.name.slice(0, 2))}</span><span class="benefit-badge">${escape(category)}</span></div><h2>${escape(item.name)}</h2><span class="benefit-link">${escape(translate('common.viewDetails'))}</span></a></article>`;
  }

  function metadata(rows) {
    const valid = rows.filter(([, value]) => typeof value === 'string' && value.trim());
    return valid.length ? `<dl class="benefit-meta">${valid.map(([label, value]) => `<dt>${escape(translate(label))}</dt><dd>${escape(value)}</dd>`).join('')}</dl>` : '';
  }

  function renderResults() {
    let items = list().filter(matches);
    if (sort === 'name') items = items.slice().sort((a, b) => localize(a.name || a.title).localeCompare(localize(b.name || b.title), i18n.getLanguage()));
    if (section === 'offers' && sort === 'recent') items = items.slice().sort((a, b) => String(b.lastVerified || '').localeCompare(String(a.lastVerified || '')));
    const count = $('[data-benefit-count]');
    if (count) count.textContent = translate(section === 'offers' ? 'benefits.resultCount' : 'benefits.booksResultCount').replace('{count}', String(items.length));
    if (!items.length) {
      results.innerHTML = `<div class="no-results"><h2>${escape(translate('common.noResultsTitle'))}</h2><p>${escape(translate('common.noResultsText'))}</p></div>`;
      return;
    }
    results.innerHTML = items.map(section === 'books' ? bookCard : section === 'software' ? softwareCard : offerCard).join('');
  }

  function render() {
    const title = $('[data-benefit-title]');
    const intro = $('[data-benefit-intro]');
    if (title) title.textContent = translate(`benefits.${section}.title`);
    if (intro) intro.textContent = translate(`benefits.${section}Intro`);
    const note = $('[data-benefit-disclaimer]') || $('[data-benefit-review]');
    if (note) note.textContent = section === 'books' ? translate('benefits.books.note') : section === 'offers' ? translate('benefits.directoryNote') : translate('benefits.software.note');
    const searchLabel = $('[data-benefit-search-label]');
    if (searchLabel) searchLabel.textContent = translate('benefits.search');
    if (search) search.placeholder = translate('benefits.searchPlaceholder');
    const back = $('[data-benefit-back]');
    if (back) back.textContent = translate('benefits.back');
    const sortLabel = $('[data-benefit-sort-label]');
    if (sortLabel) sortLabel.textContent = translate('benefits.sortLabel');
    const sortSelect = $('[data-benefit-sort]');
    if (sortSelect) {
      const keys = section === 'books' ? ['default', 'name', 'kind'] : section === 'offers' ? ['default', 'free', 'recent'] : ['default', 'name'];
      sortSelect.innerHTML = keys.map((key) => `<option value="${key}">${escape(translate(section === 'books' ? `benefits.booksSort.${key}` : `benefits.sort.${key}`))}</option>`).join('');
      sortSelect.value = sort;
      sortSelect.onchange = () => { sort = sortSelect.value; renderResults(); };
    }
    renderFilters();
    renderResults();
  }

  if (search) search.addEventListener('input', renderResults);
  i18n.onChange(render);
  render();
})();
