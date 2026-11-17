/* A short white opening, with a bounded fallback if the main script cannot load. */
(() => {
  const root = document.documentElement;
  root.classList.add("enhanced");
  const params = new URLSearchParams(location.search);
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches && params.get("still") !== "1") {
    root.classList.add("motion-pending");
    window.CEY_BOOT_TIMER = setTimeout(() => root.classList.remove("motion-pending"), 5000);
  }
})();
