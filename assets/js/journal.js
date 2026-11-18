(() => {
  'use strict';
  const raw = window.CEYMIRION_JOURNAL_EDITION?.publicationDate;
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return;
  const date = new Date(raw + 'T12:00:00Z');
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0,10) !== raw) return;
  document.querySelectorAll('[data-publication-date]').forEach(el => {
    const time = document.createElement('time');
    time.dateTime = raw;
    time.textContent = new Intl.DateTimeFormat('en-GB', {day:'2-digit',month:'long',year:'numeric',timeZone:'UTC'}).format(date);
    el.replaceChildren(time);
  });
  document.querySelectorAll('[data-draft-badge]').forEach(el => { el.hidden = true; });
})();
