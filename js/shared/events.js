(() => {
  function dateTime(event, language) {
    const [year, month, day] = event.date.split('-').map(Number);
    const locale = language === 'ku' ? 'ar' : language;
    const date = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(year, month - 1, day, 12));
    const formatTime = (value) => {
      const [hour, minute] = value.split(':').map(Number);
      return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' })
        .format(new Date(year, month - 1, day, hour, minute));
    };
    return window.StudentHubI18n.t('events.dateRange', {
      date,
      start: formatTime(event.startTime),
      end: formatTime(event.endTime),
    });
  }

  function status(event, now = new Date()) {
    const start = new Date(`${event.date}T${event.startTime}:00`);
    const end = new Date(`${event.date}T${event.endTime}:00`);
    const currentStatus = Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())
      ? 'past' : now < start ? 'upcoming' : now <= end ? 'ongoing' : 'past';
    event.status = currentStatus;
    return currentStatus;
  }

  window.StudentHubEvents = { dateTime, status };
})();
