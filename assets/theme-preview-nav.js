/**
 * Theme preview — mobile drawer only (no scroll-hide fixed nav).
 */
(function () {
  var body = document.body;
  if (!body.classList.contains("page-theme-preview")) return;

  var header = document.querySelector("[data-site-header]");
  if (!header) return;

  var toggle = header.querySelector(".site-nav__toggle");
  var backdrop = header.querySelector("[data-nav-backdrop]");
  var drawer = document.getElementById("site-nav-drawer");
  var drawerPanel = drawer ? drawer.querySelector(".site-nav__drawer-panel") : null;
  var drawerLinks = drawer ? drawer.querySelectorAll("a") : [];
  var mobileNav = window.matchMedia("(max-width: 720px)");
  var drawerMs = 1500;
  var closeTimer = null;

  function isMobileNav() {
    return mobileNav.matches;
  }

  function setMenuOpen(open) {
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
    if (!isMobileNav()) {
      header.classList.remove("is-menu-open");
      body.classList.remove("site-nav--lock");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
      if (drawer) drawer.setAttribute("aria-hidden", "true");
      if (backdrop) backdrop.setAttribute("aria-hidden", "true");
      return;
    }
    if (toggle) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    if (!open) {
      header.classList.remove("is-menu-open");
      body.classList.remove("site-nav--lock");
      if (drawer) drawer.setAttribute("aria-hidden", "true");
      if (backdrop) backdrop.setAttribute("aria-hidden", "true");
      return;
    }
    if (drawer) drawer.setAttribute("aria-hidden", "false");
    if (backdrop) backdrop.setAttribute("aria-hidden", "false");
    void (drawerPanel || drawer).offsetHeight;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        header.classList.add("is-menu-open");
        body.classList.add("site-nav--lock");
      });
    });
  }

  function closeMenuAnimated() {
    if (!header.classList.contains("is-menu-open")) return;
    header.classList.remove("is-menu-open");
    body.classList.remove("site-nav--lock");
    var ms = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : isMobileNav()
        ? drawerMs
        : 0;
    if (!ms || !drawerPanel) {
      setMenuOpen(false);
      return;
    }
    closeTimer = window.setTimeout(function () {
      closeTimer = null;
      setMenuOpen(false);
    }, ms + 50);
    function onEnd(e) {
      if (e.target !== drawerPanel || e.propertyName !== "transform") return;
      drawerPanel.removeEventListener("transitionend", onEnd);
      if (closeTimer) window.clearTimeout(closeTimer);
      closeTimer = null;
      setMenuOpen(false);
    }
    drawerPanel.addEventListener("transitionend", onEnd);
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      if (!isMobileNav()) return;
      if (header.classList.contains("is-menu-open")) closeMenuAnimated();
      else setMenuOpen(true);
    });
  }
  if (backdrop) backdrop.addEventListener("click", closeMenuAnimated);
  drawerLinks.forEach(function (link) {
    link.addEventListener("click", closeMenuAnimated);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenuAnimated();
  });
  mobileNav.addEventListener("change", closeMenuAnimated);
})();
