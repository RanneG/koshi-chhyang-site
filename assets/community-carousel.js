/**
 * Community notes — seamless infinite loop (duplicate strip, no visible end)
 */
(function () {
  function initCommunityMarquee() {
    var root = document.querySelector("[data-community-carousel]");
    if (!root) return;

    var wrap = root.closest(".community-marquee-wrap");
    var track = root.querySelector(".community-marquee__track");
    var group = root.querySelector(".community-marquee__group");
    if (!track || !group) return;

    if (group.querySelector(".note") === null) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      if (wrap) wrap.classList.add("is-static");
      return;
    }

    if (track.querySelector(".community-marquee__group--clone")) return;

    var clone = group.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.classList.add("community-marquee__group--clone");
    track.appendChild(clone);

    function setSpeed() {
      var width = group.getBoundingClientRect().width;
      var pxPerSecond = 52;
      var seconds = Math.max(28, Math.round(width / pxPerSecond));
      root.style.setProperty("--marquee-duration", seconds + "s");
    }

    setSpeed();
    root.classList.add("is-running");

    window.addEventListener("resize", setSpeed);

    document.addEventListener("visibilitychange", function () {
      track.style.animationPlayState = document.hidden ? "paused" : "running";
    });
  }

  function boot() {
    if (document.querySelector("[data-community-notes-root]")) {
      document.addEventListener("community-notes:ready", initCommunityMarquee, {
        once: true,
      });
      return;
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initCommunityMarquee);
    } else {
      initCommunityMarquee();
    }
  }

  boot();
})();
