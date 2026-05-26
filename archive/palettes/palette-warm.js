/**
 * Palette loader — default: earth mood board. Override: ?palette=red | ?palette=social
 * Persists when pinned via footer toggles (sessionStorage).
 */
(function () {
  "use strict";

  var STORAGE_KEY = "kc_palette";
  var PIN_KEY = "kc_palette_pinned";

  var PALETTES = {
    social: {
      className: "page-theme-preview--warm",
      cssFile: "theme-palette-warm.css",
      query: "social",
    },
    earth: {
      className: "page-theme-preview--earth",
      cssFile: "theme-palette-earth.css",
      query: "earth",
    },
  };

  var SOCIAL_ALIASES = { social: 1, warm: 1, crimson: 1, apricot: 1 };

  function paletteFromQuery() {
    if (typeof URLSearchParams === "undefined") return null;
    var value = new URLSearchParams(window.location.search).get("palette");
    if (!value) return null;
    if (value === "earth") return "earth";
    if (SOCIAL_ALIASES[value]) return "social";
    if (value === "red" || value === "default") return "red";
    return null;
  }

  function clearLegacyStorage() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PIN_KEY);
    } catch (err) {
      /* ignore */
    }
  }

  function resolvePalette() {
    var fromQuery = paletteFromQuery();
    if (fromQuery) {
      if (fromQuery === "red") {
        try {
          sessionStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem(PIN_KEY);
        } catch (err) {
          /* ignore */
        }
      }
      return fromQuery;
    }

    try {
      if (sessionStorage.getItem(PIN_KEY) === "1") {
        var stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored === "earth" || stored === "social") {
          return stored;
        }
      }
    } catch (err2) {
      /* ignore */
    }

    return "earth";
  }

  function scriptBase() {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i += 1) {
      var src = scripts[i].src;
      if (src && src.indexOf("palette-warm.js") !== -1) {
        return src.replace(/palette-warm\.js(\?.*)?$/, "");
      }
    }
    return "assets/";
  }

  function clearAllExperimental() {
    Object.keys(PALETTES).forEach(function (key) {
      document.documentElement.classList.remove(PALETTES[key].className);
      var link = document.getElementById("kc-palette-" + key + "-css");
      if (link) link.remove();
    });
  }

  function applyPalette(name) {
    clearAllExperimental();
    var palette = PALETTES[name];
    if (!palette) return;
    document.documentElement.classList.add(palette.className);
    if (document.getElementById("kc-palette-" + name + "-css")) return;
    var link = document.createElement("link");
    link.id = "kc-palette-" + name + "-css";
    link.rel = "stylesheet";
    link.href = scriptBase() + palette.cssFile;
    document.head.appendChild(link);
  }

  function shouldSkipPaletteLink(anchor, url) {
    if (anchor.hasAttribute("data-design-switch-target")) {
      return true;
    }
    var path = url.pathname.replace(/\\/g, "/");
    if (path.indexOf("/legacy/") !== -1 || path.indexOf("/archive/legacy/") !== -1) {
      return true;
    }
    return false;
  }

  /** Keep ?palette= on same-site navigation while viewing an experiment. */
  function syncPaletteLinks(root) {
    var active = resolvePalette();
    if (active === "red") return;

    var scope = root || document;
    var origin = window.location.origin;
    var queryValue = PALETTES[active] ? PALETTES[active].query : active;

    scope.querySelectorAll("a[href]").forEach(function (anchor) {
      var raw = anchor.getAttribute("href");
      if (!raw || raw.charAt(0) === "#") return;
      if (/^(mailto:|tel:|javascript:)/i.test(raw)) return;

      try {
        var url = new URL(raw, window.location.href);
        if (url.origin !== origin) return;
        if (shouldSkipPaletteLink(anchor, url)) return;
        if (url.searchParams.get("palette") === queryValue) return;
        url.searchParams.set("palette", queryValue);
        anchor.setAttribute("href", url.pathname + url.search + url.hash);
      } catch (err) {
        /* ignore bad href */
      }
    });
  }

  function initPaletteLinkSync() {
    var active = resolvePalette();
    if (active === "red" || active === "earth") return;

    function run() {
      syncPaletteLinks(document);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run);
    } else {
      run();
    }

    window.addEventListener("load", run);
  }

  clearLegacyStorage();

  var activePalette = resolvePalette();
  if (activePalette === "social" || activePalette === "earth") {
    applyPalette(activePalette);
    initPaletteLinkSync();
  } else {
    clearAllExperimental();
  }

  window.kcSetPalette = function (mode, options) {
    var pin = !options || options.pin !== false;
    var next = "red";
    if (mode === "earth") {
      next = "earth";
    } else if (mode === "social" || mode === "warm" || mode === "crimson" || mode === "apricot") {
      next = "social";
    }

    try {
      if (next !== "red" && pin) {
        sessionStorage.setItem(STORAGE_KEY, next);
        sessionStorage.setItem(PIN_KEY, "1");
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(PIN_KEY);
      }
    } catch (err) {
      /* ignore */
    }

    if (next === "social" || next === "earth") {
      applyPalette(next);
      initPaletteLinkSync();
    } else {
      clearAllExperimental();
    }
  };

  window.kcSyncPaletteLinks = syncPaletteLinks;

  window.kcGetPalette = function () {
    return resolvePalette();
  };
})();
