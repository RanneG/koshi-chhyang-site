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
  var drawerLinks = drawer ? drawer.querySelectorAll("a") : [];
  var mobileNav = window.matchMedia("(max-width: 720px)");

  var lastY = 0;
  var scrollTicking = false;
  var scrollDelta = 6;

  function isMobileNav() {
    return mobileNav.matches;
  }

  function setMenuOpen(open) {
    if (!isMobileNav()) {
      header.classList.remove("is-menu-open");
      body.classList.remove("site-nav--lock");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
      if (backdrop) backdrop.setAttribute("hidden", "");
      if (drawer) drawer.setAttribute("hidden", "");
      return;
    }

    header.classList.toggle("is-menu-open", open);
    body.classList.toggle("site-nav--lock", open);

    if (toggle) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    if (backdrop) {
      if (open) {
        backdrop.removeAttribute("hidden");
      } else {
        backdrop.setAttribute("hidden", "");
      }
    }

    if (drawer) {
      if (open) {
        drawer.removeAttribute("hidden");
      } else {
        drawer.setAttribute("hidden", "");
      }
    }
  }

  function closeMenu() {
    if (header.classList.contains("is-menu-open")) {
      setMenuOpen(false);
    }
  }

  function openMenu() {
    if (!isMobileNav()) return;
    header.classList.remove("is-hidden");
    setMenuOpen(true);
  }

  function toggleMenu() {
    if (!isMobileNav()) return;
    if (header.classList.contains("is-menu-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  if (toggle) {
    toggle.addEventListener("click", toggleMenu);
  }

  if (backdrop) {
    backdrop.addEventListener("click", closeMenu);
  }

  drawerLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMenu();
    }
  });

  mobileNav.addEventListener("change", function () {
    closeMenu();
  });

  requestAnimationFrame(function () {
    header.classList.add("is-loaded");
    closeMenu();
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
      closeMenu();
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
