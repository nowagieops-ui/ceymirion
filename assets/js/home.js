/* Framework-free homepage controller. All media is local and all navigation is HTML. */
(() => {
  'use strict';
  const config = window.CEYMIRION_CONFIG;
  const body = document.body;
  const base = body.dataset.base || './';
  const root = document.documentElement;
  const clearPending = () => { clearTimeout(window.CEY_BOOT_TIMER); root.classList.remove('motion-pending'); };
  const resolve = path => /^(https?:|mailto:|\/)/i.test(path) ? path : base + path;
  if (!config) { clearPending(); return; }
  root.classList.add('enhanced');
  document.querySelectorAll('[data-route]').forEach(link => {
    const target = config.routes[link.dataset.route];
    if (target) link.href = resolve(target);
  });
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });
  const header = document.getElementById('site-header');
  const menuButton = document.querySelector('.nav-toggle');
  const closeMenu = () => { if (!menuButton) return; header.dataset.menu = ''; menuButton.setAttribute('aria-expanded', 'false'); };
  menuButton?.addEventListener('click', () => {
    const opening = menuButton.getAttribute('aria-expanded') !== 'true';
    header.dataset.menu = opening ? 'open' : '';
    menuButton.setAttribute('aria-expanded', String(opening));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header?.dataset.menu === 'open') { closeMenu(); menuButton.focus(); }
  });
  document.addEventListener('click', event => { if (header && !header.contains(event.target)) closeMenu(); });
  if (body.dataset.page !== 'home') { clearPending(); return; }

  const options = config.motion;
  const intro = document.getElementById('intro-video');
  const ambient = document.getElementById('ambient-video');
  const poster = document.getElementById('scene-poster');
  const tagline = document.getElementById('tagline');
  const actions = document.getElementById('hero-actions');
  const footer = document.getElementById('site-footer');
  const skip = document.getElementById('intro-skip');
  const pauseButton = document.getElementById('motion-toggle');
  const replayButton = document.getElementById('motion-replay');
  const controls = document.getElementById('motion-controls');
  const status = document.getElementById('motion-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width:760px)');
  const params = new URLSearchParams(location.search);
  let phase = 'static';
  let currentVideo = null;
  let pausedByUser = false;
  let manualMotion = false;
  let generation = 0;
  let playbackFrame = 0;
  let layout = mobile.matches ? 'mobile' : 'desktop';
  controls.hidden = !options.enabled;

  function markSeen() { try { sessionStorage.setItem(options.sessionKey, '1'); } catch (_) { /* Private or file-based browsing may deny storage. */ } }
  function hasSeen() { try { return sessionStorage.getItem(options.sessionKey) === '1'; } catch (_) { return false; } }
  function allowsMotion() { return options.enabled && (manualMotion || (!reduced.matches && !navigator.connection?.saveData && params.get('still') !== '1')); }
  function setPhase(value) { phase = value; body.dataset.phase = value; }
  function revealChrome() { header.classList.add('is-revealed'); footer.classList.add('is-revealed'); header.inert = false; footer.inert = false; }
  function revealAll() { tagline.classList.add('is-revealed'); actions.classList.add('is-revealed'); actions.inert = false; revealChrome(); }
  function setButton() {
    const label = !currentVideo ? 'Play motion' : pausedByUser ? 'Resume motion' : 'Pause motion';
    pauseButton.textContent = label; pauseButton.setAttribute('aria-label', label);
  }
  function stopFrameClock() {
    if (intro.cancelVideoFrameCallback && playbackFrame) intro.cancelVideoFrameCallback(playbackFrame);
    cancelAnimationFrame(playbackFrame); playbackFrame = 0;
  }
  function setMedia(video, kind) {
    const src = resolve(options[layout][kind]);
    if (video.dataset.asset !== src) { video.src = src; video.dataset.asset = src; video.preload = 'auto'; video.load(); }
    video.muted = true; video.defaultMuted = true; video.playsInline = true; video.playbackRate = 1;
  }
  async function playAndPaint(video) {
    let frameId = 0, timeout;
    try {
      await Promise.race([
        (async () => {
          await video.play();
          await new Promise(resolvePaint => {
            if (video.requestVideoFrameCallback) frameId = video.requestVideoFrameCallback(resolvePaint);
            else requestAnimationFrame(() => requestAnimationFrame(resolvePaint));
          });
        })(),
        new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Video startup timed out')), options.startupTimeoutMs); })
      ]);
    } finally {
      clearTimeout(timeout);
      if (video.cancelVideoFrameCallback && frameId) video.cancelVideoFrameCallback(frameId);
    }
  }
  function still(message = '') {
    generation++; stopFrameClock(); intro.pause(); ambient.pause();
    intro.classList.remove('is-active'); ambient.classList.remove('is-active');
    currentVideo = null; pausedByUser = false; poster.style.opacity = '';
    setPhase('static'); revealAll(); skip.hidden = true; clearPending(); setButton();
    if (message) status.textContent = message;
  }
  async function settle() {
    const mine = ++generation; stopFrameClock(); intro.pause();
    setPhase('settled'); revealAll(); skip.hidden = true; clearPending(); markSeen();
    if (!allowsMotion()) { still(); return; }
    setMedia(ambient, 'ambient');
    try {
      await playAndPaint(ambient);
      if (mine !== generation) return;
      ambient.classList.add('is-active'); intro.classList.remove('is-active');
      currentVideo = ambient; pausedByUser = false; setButton();
    } catch (_) { if (mine === generation) still('The still version is displayed. Select Play motion to try again.'); }
  }
  function introClock() {
    if (phase !== 'intro') return;
    const t = intro.currentTime;
    if (t >= options.taglineAt) tagline.classList.add('is-revealed');
    if (t >= options.actionsAt) { actions.classList.add('is-revealed'); actions.inert = false; }
    if (t >= options.navigationAt) revealChrome();
    if (intro.requestVideoFrameCallback) playbackFrame = intro.requestVideoFrameCallback(introClock);
    else playbackFrame = requestAnimationFrame(introClock);
  }
  async function beginIntro() {
    if (!allowsMotion()) { still(); return; }
    const mine = ++generation; stopFrameClock(); ambient.pause(); intro.pause();
    ambient.classList.remove('is-active'); intro.classList.remove('is-active');
    currentVideo = null; pausedByUser = false; closeMenu();
    [tagline, actions, header, footer].forEach(el => el.classList.remove('is-revealed'));
    header.inert = true; footer.inert = true; actions.inert = true;
    setPhase('intro'); skip.hidden = false; clearPending();
    setMedia(intro, 'intro'); intro.currentTime = 0;
    setMedia(ambient, 'ambient'); ambient.currentTime = 0;
    try {
      await playAndPaint(intro);
      if (mine !== generation) return;
      currentVideo = intro; intro.classList.add('is-active'); setButton(); introClock();
    } catch (_) { if (mine === generation) still('The still version is displayed. Select Play motion to try again.'); }
  }
  intro.addEventListener('ended', () => { if (phase === 'intro') settle(); });
  intro.addEventListener('error', () => { if (phase === 'intro') still('Motion is unavailable. The still version is displayed.'); });
  ambient.addEventListener('error', () => { if (phase === 'settled') still('Motion is unavailable. The still version is displayed.'); });
  skip.addEventListener('click', () => { settle(); document.getElementById('main').focus({preventScroll:true}); });
  document.querySelector('.skip-link').addEventListener('click', () => { if (phase === 'intro') settle(); });
  pauseButton.addEventListener('click', async () => {
    if (!currentVideo) { manualMotion = true; await settle(); status.textContent = 'Motion playing.'; return; }
    pausedByUser = !pausedByUser;
    if (pausedByUser) { currentVideo.pause(); status.textContent = 'Motion paused.'; }
    else { try { await currentVideo.play(); status.textContent = 'Motion playing.'; } catch (_) { still('Motion is unavailable. The still version is displayed.'); } }
    setButton();
  });
  replayButton.addEventListener('click', () => { manualMotion = true; beginIntro(); skip.focus({preventScroll:true}); });
  reduced.addEventListener('change', () => { manualMotion = false; if (reduced.matches) still(); else settle(); });
  mobile.addEventListener('change', () => {
    closeMenu(); layout = mobile.matches ? 'mobile' : 'desktop';
    const keepStill = pausedByUser || !allowsMotion();
    still();
    if (!keepStill) settle();
  });
  document.addEventListener('visibilitychange', () => {
    if (!currentVideo || pausedByUser) return;
    if (document.hidden) currentVideo.pause();
    else currentVideo.play().catch(() => still());
  });
  window.addEventListener('pagehide', () => { intro.pause(); ambient.pause(); });
  window.addEventListener('pageshow', event => { if (event.persisted) settle(); });
  if (!allowsMotion()) still();
  else if (params.get('intro') === '1' || !options.introOncePerSession || !hasSeen()) beginIntro();
  else settle();
})();
