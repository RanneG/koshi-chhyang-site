/**
 * Local-only palette toggle.
 * ?palette=social | warm | crimson  →  mood-board experiment
 * ?palette=red | default            →  red room (production look)
 * localStorage key: kc_palette (social | red)
 */
(function () {
  "use strict";

  var STORAGE_KEY = "kc_palette";
  var EXPERIMENTAL = { social: 1, warm: 1, crimson: 1, apricot: 1 };

  function paletteFromQuery() {
    if (typeof URLSearchParams === "undefined") return null;
    var value = new URLSearchParams(window.location.search).get("palette");
    if (!value) return null;
    if (EXPERIMENTAL[value]) return "social";
    if (value === "red" || value === "default") return "red";
    return null;
  }

  function readPalette() {
    var fromQuery = paletteFromQuery();
    if (fromQuery) {
      try {
        localStorage.setItem(STORAGE_KEY, fromQuery);
      } catch (err) {
        /* ignore */
      }
      return fromQuery;
    }
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "warm" || stored === "apricot" || stored === "crimson") {
        return "social";
      }
      return stored || "red";
    } catch (err2) {
      return "red";
    }
  }

  function cssHref() {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i += 1) {
      var src = scripts[i].src;
      if (src && src.indexOf("palette-warm.js") !== -1) {
        return src.replace(/palette-warm\.js(\?.*)?$/, "theme-palette-warm.css");
      }
    }
    return "assets/theme-palette-warm.css";
  }

  function applyExperimental() {
    document.documentElement.classList.add("page-theme-preview--warm");
    if (document.getElementById("kc-palette-warm-css")) return;
    var link = document.createElement("link");
    link.id = "kc-palette-warm-css";
    link.rel = "stylesheet";
    link.href = cssHref();
    document.head.appendChild(link);
  }

  function clearExperimental() {
    document.documentElement.classList.remove("page-theme-preview--warm");
    var link = document.getElementById("kc-palette-warm-css");
    if (link) link.remove();
  }

  if (readPalette() === "social") {
    applyExperimental();
  } else {
    clearExperimental();
  }

  window.kcSetPalette = function (mode) {
    var next = mode === "social" || mode === "warm" || mode === "crimson" ? "social" : "red";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (err) {
      /* ignore */
    }
    if (next === "social") {
      applyExperimental();
    } else {
      clearExperimental();
    }
  };

  window.kcGetPalette = function () {
    return readPalette();
  };
})();
