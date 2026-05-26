/**
 * Archive only: switch between production site (repo root) and classic (/archive/legacy/).
 */
(function () {
  var STORAGE_KEY = "kc_site_design";

  function pathNorm() {
    return window.location.pathname.replace(/\\/g, "/");
  }

  function isClassic() {
    var p = pathNorm();
    return p.indexOf("/archive/legacy/") !== -1 || p.indexOf("/legacy/") !== -1;
  }

  function pageKey() {
    var path = pathNorm();
    if (path.indexOf("/archive/legacy/") !== -1) {
      var tail = path.split("/archive/legacy/")[1] || "index.html";
      if (!tail || tail.endsWith("/")) tail = "index.html";
      return "legacy/" + tail.split("?")[0].split("#")[0];
    }
    if (path.indexOf("/legacy/") !== -1) {
      var old = path.split("/legacy/")[1] || "index.html";
      if (!old || old.endsWith("/")) old = "index.html";
      return "legacy/" + old.split("?")[0].split("#")[0];
    }
    var base = path.split("/").pop() || "index.html";
    if (!base || base === "") base = "index.html";
    return base.split("?")[0].split("#")[0];
  }

  var TO_CURRENT = {
    "legacy/index.html": "../../index.html",
    "legacy/heritage.html": "../../heritage.html",
    "legacy/collection.html": "../../collection.html",
    "legacy/business.html": "../../business.html",
  };

  var TO_CLASSIC = {
    "index.html": "../legacy/index.html",
    "/": "../legacy/index.html",
    "heritage.html": "../legacy/heritage.html",
    "collection.html": "../legacy/collection.html",
    "business.html": "../legacy/business.html",
    "visit.html": "../legacy/index.html",
    "events.html": "../legacy/index.html",
    "guide.html": "../legacy/collection.html",
    "stockists.html": "../legacy/business.html",
  };

  function targetPath() {
    var key = pageKey();
    if (isClassic()) {
      return TO_CURRENT[key] || "../../index.html";
    }
    return TO_CLASSIC[key] || "../legacy/index.html";
  }

  function init() {
    var el = document.querySelector("[data-design-switcher]");
    if (!el) return;
    var link = el.querySelector("[data-design-switch-target]");
    if (!link) return;

    var classic = isClassic();
    link.textContent = classic ? "View production site" : "View classic site";
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
