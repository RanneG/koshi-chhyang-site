/**
 * Promo marquee — seamless belt: two identical copies, scroll by 50% (no rewind).
 */
(function () {
  var root = document.querySelector("[data-promo-marquee]");
  if (!root) return;
  var track = root.querySelector("[data-promo-track]");
  var template = root.querySelector("[data-promo-group]");
  if (!track || !template) return;

  var templateHTML = template.outerHTML;

  function buildLoop() {
    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.innerHTML = templateHTML;

    var first = track.querySelector("[data-promo-group]");
    if (!first) return;

    var second = first.cloneNode(true);
    second.removeAttribute("data-promo-group");
    second.setAttribute("aria-hidden", "true");
    track.appendChild(second);

    var segmentWidth = first.getBoundingClientRect().width;
    var pxPerSecond = 72;
    var duration = Math.max(16, segmentWidth / pxPerSecond);
    track.style.setProperty("--promo-duration", duration.toFixed(2) + "s");

    root.classList.toggle("is-running", !prefersReduced);
    track.style.animationPlayState = prefersReduced ? "paused" : "running";
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    if (resizeTimer) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(buildLoop, 120);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(buildLoop).catch(buildLoop);
  } else {
    buildLoop();
  }
})();
