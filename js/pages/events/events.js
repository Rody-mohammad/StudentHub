(() => {
  function initEventsPage() {
    const page = document.querySelector('[data-events-page]');
    if (!page || !Array.isArray(window.eventsData)) return;

    const i18n = window.StudentHubI18n;
    const search = page.querySelector('#eventsSearch');
    const statusFilter = page.querySelector('#eventsStatus');
    const locationFilter = page.querySelector('#eventsLocation');
    const results = page.querySelector('#eventsResults');
    const featured = page.querySelector('#eventsFeatured');
    const count = page.querySelector('#eventsCount');
    const t = (key, params) => i18n.t(key, params);
    const value = (event, field) => i18n.data('events', event, field) ?? event[field] ?? '';
    const escapeHtml = (text) => String(text ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[char]);
    const sortedEvents = () => [...window.eventsData].sort((a, b) =>
      `${a.date}T${a.startTime || '00:00'}`.localeCompare(`${b.date}T${b.startTime || '00:00'}`));

    function renderLocations() {
      const selected = locationFilter.value || 'all';
      const cities = [...new Set(window.eventsData.map((event) => event.city))];
      locationFilter.innerHTML = `<option value="all">${escapeHtml(t('events.locationAll'))}</option>${cities.map((city) =>
        `<option value="${escapeHtml(city)}">${escapeHtml(t(`events.city.${city.toLowerCase()}`))}</option>`).join('')}`;
      locationFilter.value = cities.includes(selected) ? selected : 'all';
      locationFilter.setAttribute('aria-label', t('events.locationLabel'));
    }

    function participationLabel(event) {
      if (event.price == null) return t('events.participationUnknown');
      return t(Number(event.price) > 0 ? 'events.paidEntryShort' : 'events.freeEntryShort');
    }

    function renderCard(event, compact = false) {
      const language = i18n.getLanguage();
      const title = value(event, 'title');
      const categoryLabel = t(`events.category.${event.category}`);
      const status = window.StudentHubEvents.status(event);
      const statusLabel = t(`events.state.${status}`);
      const location = value(event, 'location');
      const participation = participationLabel(event);
      const href = `detail.html?section=events&id=${encodeURIComponent(event.id)}`;
      return `<article class="card events-card${compact ? ' events-card--compact' : ''}">
        <a class="events-card__link" href="${href}">
          <div class="events-card__cover">
            <img src="${escapeHtml(event.image)}" alt="" loading="lazy">
          </div>
          <div class="events-card__body">
            <div class="detail-meta"><span class="badge badge--gray">${escapeHtml(categoryLabel)}</span><span class="badge events-state events-state--${status}">${escapeHtml(statusLabel)}</span></div>
            <h3 class="card__title">${escapeHtml(title)}</h3>
            <p class="events-card__meta">${escapeHtml(window.StudentHubEvents.dateTime(event, language))}</p>
            <p class="events-card__meta">${escapeHtml(location)}</p>
            <div class="events-card__tags"><span class="badge badge--amber">${escapeHtml(participation)}</span></div>
            <span class="btn btn--primary btn--sm">${escapeHtml(t('common.viewDetails'))}</span>
          </div>
        </a>
      </article>`;
    }

    function renderFeatured(events) {
      const upcoming = events.find((event) => window.StudentHubEvents.status(event) !== 'past');
      if (!upcoming) {
        featured.hidden = true;
        featured.innerHTML = '';
        return;
      }
      featured.hidden = false;
      featured.innerHTML = `<p class="events-featured__label">${escapeHtml(t('events.featured'))}</p>${renderCard(upcoming)}`;
    }

    function renderResults() {
      const term = search.value.trim().toLocaleLowerCase();
      const status = statusFilter.value;
      const city = locationFilter.value;
      const filtered = sortedEvents().filter((event) => {
        const currentStatus = window.StudentHubEvents.status(event);
        const searchable = [
          value(event, 'title'), value(event, 'organizer'), value(event, 'description'),
          value(event, 'location'), t(`events.category.${event.category}`),
        ].join(' ').toLocaleLowerCase();
        return (!term || searchable.includes(term))
          && (city === 'all' || event.city === city)
          && (status === 'all' || (status === 'past' ? currentStatus === 'past' : currentStatus !== 'past'));
      });

      count.textContent = t('events.count', { count: filtered.length });
      if (!filtered.length) {
        results.innerHTML = `<div class="events-empty" role="status"><h2>${escapeHtml(t('events.emptyTitle'))}</h2><p>${escapeHtml(t('events.emptyText'))}</p><button class="btn btn--ghost events-clear" type="button">${escapeHtml(t('events.clearFilters'))}</button></div>`;
        results.querySelector('.events-clear').addEventListener('click', () => {
          search.value = '';
          statusFilter.value = 'all';
          locationFilter.value = 'all';
          statusFilter.dataset.selectedStatus = 'all';
          renderResults();
        });
        return;
      }

      const upcoming = filtered.filter((event) => window.StudentHubEvents.status(event) !== 'past');
      const past = filtered.filter((event) => window.StudentHubEvents.status(event) === 'past');
      results.innerHTML = `${upcoming.length ? `<section class="events-result-section" aria-labelledby="eventsUpcomingHeading"><h2 class="section-heading" id="eventsUpcomingHeading">${escapeHtml(t('events.upcoming'))}</h2><div class="events-grid">${upcoming.map((event) => renderCard(event)).join('')}</div></section>` : ''}${past.length ? `<section class="events-result-section" aria-labelledby="eventsPastHeading"><h2 class="section-heading" id="eventsPastHeading">${escapeHtml(t('events.past'))}</h2><div class="events-grid">${past.map((event) => renderCard(event)).join('')}</div></section>` : ''}`;
    }

    function renderLabels() {
      page.querySelector('#eventsHeading').textContent = t('events.heading');
      page.querySelector('#eventsIntro').textContent = t('events.intro');
      page.querySelector('#eventsSearchLabel').textContent = t('events.searchLabel');
      search.placeholder = t('events.searchPlaceholder');
      page.querySelector('#eventsLocationLabel').textContent = t('events.locationLabel');
      page.querySelector('#eventsStatusLabel').textContent = t('events.statusLabel');
      statusFilter.setAttribute('aria-label', t('events.statusLabel'));
      statusFilter.innerHTML = ['all', 'upcoming', 'past'].map((status) =>
        `<option value="${status}">${escapeHtml(t(`events.status.${status}`))}</option>`).join('');
      statusFilter.value = statusFilter.dataset.selectedStatus || 'all';
      locationFilter.setAttribute('aria-label', t('events.locationLabel'));
      renderLocations();
      renderFeatured(sortedEvents());
      renderResults();
    }

    search.addEventListener('input', renderResults);
    statusFilter.addEventListener('change', () => {
      statusFilter.dataset.selectedStatus = statusFilter.value;
      renderResults();
    });
    locationFilter.addEventListener('change', renderResults);
    i18n.onChange(renderLabels);
    renderLabels();
  }

  function initHomeEvents() {
    const section = document.querySelector('[data-home-upcoming-events]');
    if (!section || !Array.isArray(window.eventsData) || !window.StudentHubI18n) return;
    const i18n = window.StudentHubI18n;
    const container = section.querySelector('[data-home-events-list]');
    const render = () => {
      const upcoming = [...window.eventsData]
        .filter((event) => window.StudentHubEvents.status(event) !== 'past')
        .sort((a, b) => `${a.date}T${a.startTime || '00:00'}`.localeCompare(`${b.date}T${b.startTime || '00:00'}`))
        .slice(0, 1);
      section.querySelector('[data-home-events-heading]').textContent = i18n.t('home.eventsHeading');
      section.querySelector('[data-home-events-intro]').textContent = i18n.t('home.eventsIntro');
      section.querySelector('[data-home-events-link]').textContent = i18n.t('home.eventsExplore');
      container.innerHTML = upcoming.map((event) => {
        const title = i18n.data('events', event, 'title');
        const date = window.StudentHubEvents.dateTime(event, i18n.getLanguage());
        const status = i18n.t(`events.state.${window.StudentHubEvents.status(event)}`);
        const location = i18n.data('events', event, 'location');
        const participation = event.price == null ? i18n.t('events.participationUnknown')
          : i18n.t(Number(event.price) > 0 ? 'events.paidEntryShort' : 'events.freeEntryShort');
        return `<a class="home-event-card" href="detail.html?section=events&id=${encodeURIComponent(event.id)}"><img class="home-event-card__image" src="${event.image}" alt="${title}" loading="lazy"><div class="home-event-card__content"><span class="home-event-card__date">${date} · ${status}</span><span>${i18n.t(`events.category.${event.category}`)} · ${participation}</span><strong>${title}</strong><span>${location}</span></div></a>`;
      }).join('');
      section.hidden = !upcoming.length;
    };
    i18n.onChange(render);
    render();
  }

  initEventsPage();
  initHomeEvents();
})();
