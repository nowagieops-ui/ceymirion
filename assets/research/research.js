/* Progressive enhancement. All publications, paper links and citations work without JavaScript. */
(() => {
  'use strict';
  const root = document.documentElement;
  const header = document.getElementById('site-header');
  const menu = document.querySelector('.nav-toggle');
  const navigation = document.getElementById('primary-navigation');
  function closeMenu() {
    if (!header || !menu) return;
    header.dataset.menu = '';
    menu.setAttribute('aria-expanded', 'false');
  }
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    header.dataset.menu = open ? 'open' : '';
    menu.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header?.dataset.menu === 'open') {
      closeMenu(); menu.focus();
    }
  });
  document.addEventListener('click', event => {
    if (header && !header.contains(event.target)) closeMenu();
  });
  navigation?.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  root.classList.add('enhanced');
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  const search = document.getElementById('publication-search');
  if (search) {
    const rows = [...document.querySelectorAll('[data-publication]')];
    const filters = [...document.querySelectorAll('[data-filter]')];
    const count = document.getElementById('result-count');
    const empty = document.getElementById('empty-state');
    let active = 'all';
    const normalize = str => str.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    function update() {
      const words = normalize(search.value).split(' ').filter(Boolean);
      let shown = 0;
      for (const row of rows) {
        const text = normalize(row.dataset.search);
        const visible = (active === 'all' || row.dataset.group === active) && words.every(word => text.includes(word));
        row.hidden = !visible;
        if (visible) shown++;
      }
      count.textContent = `${shown} ${shown === 1 ? 'publication' : 'publications'}${shown !== rows.length ? ` of ${rows.length}` : ''}`;
      empty.hidden = shown !== 0;
      filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === active)));
    }
    filters.forEach(button => button.addEventListener('click', () => { active = button.dataset.filter; update(); }));
    search.addEventListener('input', update);
    document.getElementById('reset-search')?.addEventListener('click', () => { active = 'all'; search.value = ''; update(); search.focus(); });
    document.getElementById('library-tools').hidden = false;
    count.hidden = false;
    update();
  }

  const study = document.getElementById('continuity-study');
  const toggle = document.getElementById('motion-toggle');
  if (!study || !toggle) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let manuallyPaused = false;
  function preference() {
    const still = reduced.matches;
    study.classList.toggle('motion-ready', !still);
    toggle.hidden = still;
  }
  toggle.addEventListener('click', () => {
    manuallyPaused = !manuallyPaused;
    study.classList.toggle('motion-paused', manuallyPaused);
    toggle.textContent = manuallyPaused ? 'Resume motion' : 'Pause motion';
    toggle.setAttribute('aria-pressed', String(manuallyPaused));
  });
  if (reduced.addEventListener) reduced.addEventListener('change', preference);
  else reduced.addListener(preference);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      study.classList.toggle('motion-offscreen', !entries[0].isIntersecting || document.hidden);
    }).observe(study);
  }
  document.addEventListener('visibilitychange', () => { study.classList.toggle('motion-offscreen', document.hidden); });
  preference();
})();
