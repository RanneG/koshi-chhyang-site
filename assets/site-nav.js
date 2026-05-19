/**
 * Site header — mobile drawer + desktop inline nav + scroll hide/show
 */
(function () {
  var motionPages = ["page-home", "page-heritage", "page-collection", "page-business"];
  var body = document.body;
  var hasMotion = motionPages.some(function (cls) {
    return body.classList.contains(cls);
  });
  if (!hasMotion) return;

  var header = document.querySelector("[data-site-header]");
  if (!header) return;

  var toggle = header.querySelector(".site-nav__toggle");
  var backdrop = header.querySelector("[data-nav-backdrop]");
  var drawer = document.getElementById("site-nav-drawer");
  var drawerPanel = drawer ? drawer.querySelector(".site-nav__drawer-panel") : null;
  var drawerLinks = drawer ? drawer.querySelectorAll("a") : [];
  var mobileNav = window.matchMedia("(max-width: 720px)");
  var drawerMs = 3000;

  var lastY = 0;
  var scrollTicking = false;
  var scrollDelta = 6;
  var closeTimer = null;

  function isMobileNav() {
    return mobileNav.matches;
  }

  function drawerDurationMs() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return 0;
    }
    return isMobileNav() ? drawerMs : 0;
  }

  function clearCloseTimer() {
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  function setMenuOpen(open) {
    clearCloseTimer();

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

    header.classList.remove("is-hidden");
    if (drawer) drawer.setAttribute("aria-hidden", "false");
    if (backdrop) backdrop.setAttribute("aria-hidden", "false");
  }

  function openMenuAnimated() {
    if (!isMobileNav()) return;
    setMenuOpen(true);
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
    clearCloseTimer();
    header.classList.remove("is-menu-open");
    body.classList.remove("site-nav--lock");

    var ms = drawerDurationMs();
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
      clearCloseTimer();
      setMenuOpen(false);
    }
    drawerPanel.addEventListener("transitionend", onEnd);
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      if (!isMobileNav()) return;
      if (header.classList.contains("is-menu-open")) {
        closeMenuAnimated();
      } else {
        openMenuAnimated();
      }
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", closeMenuAnimated);
  }

  drawerLinks.forEach(function (link) {
    link.addEventListener("click", closeMenuAnimated);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMenuAnimated();
    }
  });

  mobileNav.addEventListener("change", function () {
    closeMenuAnimated();
  });

  requestAnimationFrame(function () {
    header.classList.add("is-loaded");
    setMenuOpen(false);
  });

  function onScroll(y) {
    header.classList.toggle("is-scrolled", y > 56);

    if (header.classList.contains("is-menu-open")) {
      lastY = y;
      return;
    }

    if (y < 72) {
      header.classList.remove("is-hidden");
    } else if (y > lastY + scrollDelta) {
      closeMenuAnimated();
      header.classList.add("is-hidden");
    } else if (y < lastY - scrollDelta) {
      header.classList.remove("is-hidden");
    }
    lastY = y;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(function () {
        onScroll(window.scrollY);
        scrollTicking = false;
      });
    },
    { passive: true }
  );
  onScroll(window.scrollY);
})();
