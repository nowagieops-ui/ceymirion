/* Joe: update destination URLs here when the remaining pages are ready.
   Paths are relative to the site root. Full https: and mailto: URLs also work.
   No analytics, subscription service, external font service or backend is used. */
window.CEYMIRION_CONFIG = Object.freeze({
  routes: {
    home: "index.html",
    research: "research/index.html",
    ip: "intellectual-property/index.html",
    journal: "journal/index.html",
    about: "about/index.html",
    collaborate: "mailto:info@ceymirion.com?subject=Research%20and%20licensing%20enquiry",
    contact: "mailto:info@ceymirion.com",
    privacy: "privacy/index.html",
    terms: "terms/index.html",
    cookies: "cookies/index.html"
  },
  motion: {
    enabled: true,
    introOncePerSession: true,
    sessionKey: "ceymirion-home-entrance-v1",
    startupTimeoutMs: 4500,
    taglineAt: 7.15,
    actionsAt: 8.17,
    navigationAt: 8.49,
    desktop: {
      intro: "assets/media/desktop-entrance.mp4",
      ambient: "assets/media/desktop-ambient.mp4"
    },
    mobile: {
      intro: "assets/media/mobile-entrance.mp4",
      ambient: "assets/media/mobile-ambient.mp4"
    }
  }
});
