/**
 * Footer link: switch between current (root) and classic (/legacy/) site trees.
 * Persists preference in localStorage only; no auto-redirect on load.
 */
(function () {
  var STORAGE_KEY = "kc_site_design";

  var TO_CURRENT = {
    "legacy/index.html": "index.html",
    "legacy/heritage.html": "heritage.html",
    "legacy/collection.html": "collection.html",
    "legacy/business.html": "business.html",
  };

  var TO_CLASSIC = {
    "index.html": "legacy/index.html",
    "/": "legacy/index.html",
    "heritage.html": "legacy/heritage.html",
    "collection.html": "legacy/collection.html",
    "business.html": "legacy/business.html",
    "visit.html": "legacy/index.html",
    "events.html": "legacy/index.html",
    "guide.html": "legacy/collection.html",
    "stockists.html": "legacy/business.html",
  };

  function pageKey() {
    var path = window.location.pathname.replace(/\\/g, "/");
    if (path.indexOf("/legacy/") !== -1) {
      var tail = path.split("/legacy/")[1] || "index.html";
      if (!tail || tail.endsWith("/")) tail = "index.html";
      return "legacy/" + tail.split("?")[0].split("#")[0];
    }
    var base = path.split("/").pop() || "index.html";
    if (!base || base === "") base = "index.html";
    return base.split("?")[0].split("#")[0];
  }

  function isClassic() {
    return window.location.pathname.replace(/\\/g, "/").indexOf("/legacy/") !== -1;
  }

  function targetPath() {
    var key = pageKey();
    if (isClassic()) {
      return TO_CURRENT[key] || "index.html";
    }
    return TO_CLASSIC[key] || "legacy/index.html";
  }

  function init() {
    var el = document.querySelector("[data-design-switcher]");
    if (!el) return;
    var link = el.querySelector("[data-design-switch-target]");
    if (!link) return;

    var classic = isClassic();
    link.textContent = classic ? "View new site" : "View classic site";
    link.href = targetPath();

    link.addEventListener("click", function (e) {
      e.preventDefault();
      try {
        localStorage.setItem(STORAGE_KEY, classic ? "current" : "classic");
      } catch (err) {
        /* ignore */
      }
      window.location.href = link.getAttribute("href");
    });

    if (!classic) {
      initPaletteToggles(el);
    }
  }

  function currentPalette() {
    if (window.kcGetPalette) {
      return window.kcGetPalette();
    }
    if (document.documentElement.classList.contains("page-theme-preview--earth")) {
      return "earth";
    }
    if (document.documentElement.classList.contains("page-theme-preview--warm")) {
      return "social";
    }
    return "red";
  }

  function addPaletteLink(el, label, mode) {
    var sep = document.createElement("span");
    sep.textContent = " · ";
    sep.setAttribute("aria-hidden", "true");
    var link = document.createElement("a");
    link.href = "#";
    link.textContent = label;
    link.addEventListener("click", function (e) {
      e.preventDefault();
      switchPalette(mode);
    });
    el.appendChild(sep);
    el.appendChild(link);
  }

  function initPaletteToggles(el) {
    var active = currentPalette();

    if (active !== "red") {
      addPaletteLink(el, "Red room palette", "red");
    }
    if (active !== "social") {
      addPaletteLink(el, "Social palette", "social");
    }
    if (active !== "earth") {
      addPaletteLink(el, "Earth palette", "earth");
    }
  }

  function switchPalette(mode) {
    var next = "red";
    if (mode === "earth") {
      next = "earth";
    } else if (mode === "social" || mode === "warm") {
      next = "social";
    }

    if (window.kcSetPalette) {
      window.kcSetPalette(next, { pin: true });
    }

    var url = new URL(window.location.href);
    if (next === "red") {
      url.searchParams.delete("palette");
    } else {
      url.searchParams.set("palette", next);
    }
    window.location.href = url.pathname + url.search + url.hash;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
