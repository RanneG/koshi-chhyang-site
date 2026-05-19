/**
 * Page loader — only on first slow visit per session, or slow community-notes fetch on home.
 */
(function () {
  var loader = document.getElementById("page-loader");
  if (!loader) return;

  var body = document.body;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SESSION_KEY = "kc_site_ready";
  var SLOW_MS = 450;
  var FADE_MS = 500;
  var isHome = body.classList.contains("page-home");
  var seenSession = sessionStorage.getItem(SESSION_KEY) === "1";

  var finished = false;
  var visible = false;
  var pageReady = false;
  var dataReady = !isHome;
  var revealTimer = null;

  function lockScroll(on) {
    body.classList.toggle("page-is-loading", on);
  }

  function showLoader() {
    if (visible || finished || reduced) return;
    visible = true;
    loader.classList.add("is-visible");
    loader.setAttribute("aria-busy", "true");
    lockScroll(true);
  }

  function removeLoader() {
    if (!loader.parentNode) return;
    loader.parentNode.removeChild(loader);
    lockScroll(false);
  }

  function hideLoader() {
    if (finished) return;
    finished = true;
    if (revealTimer) window.clearTimeout(revealTimer);

    sessionStorage.setItem(SESSION_KEY, "1");

    if (!visible) {
      removeLoader();
      return;
    }

    loader.classList.add("is-done");
    loader.setAttribute("aria-busy", "false");
    lockScroll(false);
    window.setTimeout(removeLoader, reduced ? 0 : FADE_MS);
  }

  function maybeFinish() {
    if (finished) return;
    if (!pageReady) return;
    if (!dataReady) return;
    hideLoader();
  }

  function scheduleReveal() {
    if (visible || finished || reduced) return;
    revealTimer = window.setTimeout(function () {
      revealTimer = null;
      if (!finished && !pageReady) showLoader();
    }, SLOW_MS);
  }

  function onNotesLoading() {
    if (!finished) showLoader();
  }

  function onNotesReady() {
    dataReady = true;
    maybeFinish();
  }

  function finishReturnHome() {
    if (revealTimer) {
      window.clearTimeout(revealTimer);
      revealTimer = null;
    }
    if (!visible) removeLoader();
    else hideLoader();
  }

  /* Repeat visit: skip full-page loader unless home data is slow. */
  if (seenSession && !isHome) {
    removeLoader();
    return;
  }

  if (seenSession && isHome) {
    document.addEventListener("community-notes:loading", onNotesLoading, {
      once: true,
    });
    document.addEventListener("community-notes:ready", finishReturnHome, {
      once: true,
    });
    document.addEventListener("community-notes:error", finishReturnHome, {
      once: true,
    });
    revealTimer = window.setTimeout(function () {
      revealTimer = null;
      if (!finished) onNotesLoading();
    }, SLOW_MS);
    return;
  }

  scheduleReveal();

  window.addEventListener(
    "load",
    function () {
      pageReady = true;
      maybeFinish();
    },
    { once: true }
  );

  if (isHome) {
    document.addEventListener("community-notes:loading", onNotesLoading, {
      once: true,
    });
    document.addEventListener("community-notes:ready", onNotesReady);
    document.addEventListener("community-notes:error", onNotesReady);
  }

  if (document.readyState === "complete") {
    pageReady = true;
    maybeFinish();
  }

  window.setTimeout(function () {
    pageReady = true;
    dataReady = true;
    maybeFinish();
  }, 8000);
})();
