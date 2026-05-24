/**
 * Community notes — seamless infinite loop (duplicate strip) + pause on hover / drag scrub
 */
(function () {
  var DRAG_THRESHOLD_PX = 6;

  function parseTransformX(el) {
    var t = window.getComputedStyle(el).transform;
    if (!t || t === "none") return 0;
    return new DOMMatrixReadOnly(t).m41;
  }

  function loopWidth(group) {
    return group.getBoundingClientRect().width;
  }

  function wrapOffset(offset, width) {
    if (width <= 0) return 0;
    offset = offset % width;
    if (offset > 0) offset -= width;
    if (offset <= -width) offset += width;
    return offset;
  }

  function durationSec(root) {
    var raw = getComputedStyle(root).getPropertyValue("--marquee-duration").trim();
    var n = parseFloat(raw);
    return Number.isFinite(n) ? n : 48;
  }

  function setupCarouselInteraction(root, wrap, track, group, opts) {
    var autoPlay = !opts || opts.autoPlay !== false;
    var surface = wrap
      ? wrap.querySelector(".community-marquee__viewport") || wrap
      : root.querySelector(".community-marquee__viewport") || root;

    if (!surface || surface.dataset.communityCarouselBound === "1") return;
    surface.dataset.communityCarouselBound = "1";

    if (wrap) wrap.classList.add("is-interactive");

    var dragging = false;
    var hovered = false;
    var frozen = false;
    var dragMoved = false;
    var startX = 0;
    var startOffset = 0;
    var currentOffset = 0;

    function width() {
      return loopWidth(group);
    }

    function applyOffset(px) {
      currentOffset = wrapOffset(px, width());
      track.style.animation = "none";
      track.style.animationDelay = "";
      track.style.transform = "translate3d(" + currentOffset + "px, 0, 0)";
      frozen = true;
    }

    function freezeFromAnimation() {
      currentOffset = parseTransformX(track);
      applyOffset(currentOffset);
    }

    function resumeAnimation() {
      if (!autoPlay) return;
      var w = width();
      if (w <= 0 || !root.classList.contains("is-running")) return;

      var progress = (-currentOffset / w) % 1;
      if (progress < 0) progress += 1;

      track.style.transform = "";
      track.style.animation = "";
      track.style.animationDelay = "-" + progress * durationSec(root) + "s";
      track.style.animationPlayState = "running";
      frozen = false;
    }

    function pauseHover() {
      hovered = true;
      if (dragging || frozen) return;
      if (autoPlay && root.classList.contains("is-running")) {
        track.style.animationPlayState = "paused";
      }
    }

    function resumeHover() {
      hovered = false;
      if (dragging) return;
      if (frozen) {
        resumeAnimation();
        return;
      }
      if (autoPlay && root.classList.contains("is-running")) {
        track.style.animationPlayState = "running";
      }
    }

    function onPointerDown(e) {
      if (e.button !== undefined && e.button !== 0) return;
      if (autoPlay && !root.classList.contains("is-running")) return;

      dragging = true;
      dragMoved = false;
      startX = e.clientX;
      if (!frozen) freezeFromAnimation();
      startOffset = currentOffset;

      if (wrap) wrap.classList.add("is-dragging");
      surface.setPointerCapture(e.pointerId);
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > DRAG_THRESHOLD_PX) dragMoved = true;
      applyOffset(startOffset + dx);
    }

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      if (wrap) wrap.classList.remove("is-dragging");
      try {
        surface.releasePointerCapture(e.pointerId);
      } catch (err) {
        /* already released */
      }
      if (!hovered && autoPlay) {
        resumeAnimation();
      }
    }

    function onClickCapture(e) {
      if (!dragMoved) return;
      e.preventDefault();
      e.stopPropagation();
      dragMoved = false;
    }

    surface.addEventListener("mouseenter", pauseHover);
    surface.addEventListener("mouseleave", resumeHover);
    surface.addEventListener("pointerdown", onPointerDown);
    surface.addEventListener("pointermove", onPointerMove);
    surface.addEventListener("pointerup", endDrag);
    surface.addEventListener("pointercancel", endDrag);
    surface.addEventListener("click", onClickCapture, true);
  }

  function initCommunityMarquee() {
    var root = document.querySelector("[data-community-carousel]");
    if (!root) return;

    var wrap = root.closest(".community-marquee-wrap");
    var track = root.querySelector(".community-marquee__track");
    var group = root.querySelector(".community-marquee__group");
    if (!track || !group) return;

    if (group.querySelector(".note") === null) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (track.querySelector(".community-marquee__group--clone")) {
      setupCarouselInteraction(root, wrap, track, group, {
        autoPlay: !reduced,
      });
      return;
    }

    var clone = group.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.classList.add("community-marquee__group--clone");
    track.appendChild(clone);

    function setSpeed() {
      var widthPx = group.getBoundingClientRect().width;
      var pxPerSecond = 52;
      var seconds = Math.max(28, Math.round(widthPx / pxPerSecond));
      root.style.setProperty("--marquee-duration", seconds + "s");
    }

    setSpeed();
    window.addEventListener("resize", setSpeed);

    if (reduced) {
      setupCarouselInteraction(root, wrap, track, group, { autoPlay: false });
      return;
    }

    root.classList.add("is-running");

    document.addEventListener("visibilitychange", function () {
      if (track.style.animation === "none") return;
      track.style.animationPlayState = document.hidden ? "paused" : "running";
    });

    setupCarouselInteraction(root, wrap, track, group, { autoPlay: true });
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
