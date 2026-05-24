/**
 * Optional social palette (?palette=social). Production default is always red room.
 * Persists only when the visitor uses the footer "Social palette" toggle (sessionStorage).
 */
(function () {
  "use strict";

  var STORAGE_KEY = "kc_palette";
  var PIN_KEY = "kc_palette_pinned";
  var EXPERIMENTAL = { social: 1, warm: 1, crimson: 1, apricot: 1 };

  function paletteFromQuery() {
    if (typeof URLSearchParams === "undefined") return null;
    var value = new URLSearchParams(window.location.search).get("palette");
    if (!value) return null;
    if (EXPERIMENTAL[value]) return "social";
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
    if (fromQuery === "social") {
      return "social";
    }
    if (fromQuery === "red") {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(PIN_KEY);
      } catch (err) {
        /* ignore */
      }
      return "red";
    }

    try {
      if (
        sessionStorage.getItem(PIN_KEY) === "1" &&
        sessionStorage.getItem(STORAGE_KEY) === "social"
      ) {
        return "social";
      }
    } catch (err2) {
      /* ignore */
    }

    return "red";
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

  clearLegacyStorage();

  if (resolvePalette() === "social") {
    applyExperimental();
  } else {
    clearExperimental();
  }

  window.kcSetPalette = function (mode, options) {
    var pin = !options || options.pin !== false;
    var next =
      mode === "social" || mode === "warm" || mode === "crimson" ? "social" : "red";
    try {
      if (next === "social" && pin) {
        sessionStorage.setItem(STORAGE_KEY, "social");
        sessionStorage.setItem(PIN_KEY, "1");
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(PIN_KEY);
      }
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
    return resolvePalette();
  };
})();
