/**
 * Promise stack + launch countdown overlap (GSAP ScrollTrigger).
 * Overlap pattern inspired by Skiper UI Skiper44 (https://skiper-ui.com/v1/skiper44)
 * and vercel.com — cream promise sheet covers the hero, craft lines accumulate,
 * then onyx/garnet countdown scrolls up over the light band. Not a copy of Skiper source.
 */
(function () {
  "use strict";

  var root = document.querySelector("[data-overlap-scroll]");
  if (!root) return;

  var track = root.querySelector(".preview-overlap__track");
  var pinEl = root.querySelector("[data-overlap-pin]");
  var heroStage = root.querySelector("[data-overlap-hero]");
  var lightPanel = root.querySelector(".preview-overlap__panel--light");
  var stack = root.querySelector("[data-promise-stack]");
  var prefix = stack && stack.querySelector("[data-promise-prefix], .preview-promise__prefix");
  var lines = root.querySelectorAll("[data-promise-line]");
  var darkPanel = root.querySelector(".preview-overlap__panel--dark");
  if (
    !track ||
    !pinEl ||
    !heroStage ||
    !lightPanel ||
    !stack ||
    !prefix ||
    !lines.length ||
    !darkPanel
  ) {
    root.classList.add("preview-overlap--static");
    return;
  }

  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var narrowQuery = window.matchMedia("(max-width: 47.99rem)");
  var timeline = null;
  var resizeObserver = null;

  /** Longer hero phase so the splash stays visible until the cream sheet covers it. */
  var HERO_SEGMENT = 1.05;
  var LINE_SEGMENT = 0.6;
  var OVERLAP_SEGMENT = 0.8;
  /** Brief beat after the hero is covered before craft lines begin. */
  var LINE_PHASE_DELAY = 0.12;
  /** Viewport heights of scrub per timeline unit (hero cover + lines + countdown). */
  var SCROLL_UNIT = 0.42;

  function prefersReduced() {
    return motionQuery.matches;
  }

  function isNarrowViewport() {
    return narrowQuery.matches;
  }

  function measurePrefixTravel() {
    if (lines.length < 2) {
      return 56;
    }
    var firstTop = lines[0].offsetTop;
    var lastTop = lines[lines.length - 1].offsetTop;
    return Math.max(56, lastTop - firstTop);
  }

  function setLatest(index) {
    for (var i = 0; i < lines.length; i++) {
      lines[i].classList.toggle("is-latest", i === index);
    }
  }

  function killTimeline() {
    if (timeline) {
      if (timeline.scrollTrigger) timeline.scrollTrigger.kill();
      timeline.kill();
      timeline = null;
    }
  }

  function clearGsap() {
    if (typeof gsap === "undefined") return;
    gsap.set(lightPanel, { clearProps: "transform" });
    gsap.set(darkPanel, { clearProps: "transform" });
    gsap.set(prefix, { clearProps: "transform" });
    gsap.set(lines, { clearProps: "all" });
  }

  function setTrackScrollRoom(totalUnits) {
    var roomVh = totalUnits * SCROLL_UNIT * 100;
    track.style.setProperty("--overlap-scroll-vh", roomVh.toFixed(2));
  }

  function engageOverlap() {
    root.classList.remove("preview-overlap--released");
  }

  function markScrubReady() {
    root.classList.add("preview-overlap--scrub-ready");
  }

  function clearScrubReady() {
    root.classList.remove("preview-overlap--scrub-ready");
  }

  /**
   * Mark overlap complete for sections below (RSVP z-index). Never collapse pin
   * height or clear transforms — that breaks reverse scrub.
   */
  function releaseOverlap() {
    root.classList.add("preview-overlap--released");
  }

  function showStatic() {
    killTimeline();
    clearGsap();
    clearScrubReady();
    engageOverlap();
    track.style.removeProperty("--overlap-scroll-vh");
    root.classList.remove("preview-overlap--animated");
    root.classList.add("preview-overlap--static");
    stack.classList.add("preview-promise--static");
    setLatest(lines.length - 1);
  }

  function build() {
    killTimeline();
    clearScrubReady();
    engageOverlap();
    root.classList.remove("preview-overlap--static", "preview-overlap--released");
    stack.classList.remove("preview-promise--static");

    if (prefersReduced()) {
      showStatic();
      return;
    }

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      showStatic();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    root.classList.add("preview-overlap--animated");

    var lineCount = lines.length;
    var totalUnits =
      HERO_SEGMENT + LINE_PHASE_DELAY + lineCount * LINE_SEGMENT + OVERLAP_SEGMENT;
    var prefixTravel = isNarrowViewport() ? 0 : measurePrefixTravel();
    var linePhaseDuration = Math.max(0.01, (lineCount - 0.15) * LINE_SEGMENT);
    var linePhaseStart = HERO_SEGMENT + LINE_PHASE_DELAY;
    var darkOverlapStart = linePhaseStart + (lineCount - 0.35) * LINE_SEGMENT;

    setTrackScrollRoom(totalUnits);

    /* Panels off-screen via yPercent only (no force3D — it pins y in px and stacks with yPercent). */
    gsap.set([lightPanel, darkPanel], { y: 0, yPercent: 100 });
    /* Drop CSS translate fallback so it does not stack with GSAP yPercent. */
    markScrubReady();

    timeline = gsap.timeline({
      scrollTrigger: {
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.75,
        invalidateOnRefresh: true,
        onEnter: engageOverlap,
        onEnterBack: engageOverlap,
        onLeave: function (self) {
          if (self.direction === 1) {
            releaseOverlap();
          }
        },
        onLeaveBack: engageOverlap,
        onUpdate: function (self) {
          if (self.progress < 0.998) {
            engageOverlap();
          } else if (self.direction === 1) {
            releaseOverlap();
          }

          var scrolled = self.progress * totalUnits;
          if (scrolled < linePhaseStart) {
            setLatest(-1);
            return;
          }
          var linePhase = lineCount * LINE_SEGMENT;
          if (scrolled < linePhaseStart + linePhase) {
            var step = Math.min(
              lineCount - 1,
              Math.floor((scrolled - linePhaseStart) / LINE_SEGMENT)
            );
            setLatest(step);
          } else {
            setLatest(lineCount - 1);
          }
        },
      },
    });

    timeline.fromTo(
      lightPanel,
      { yPercent: 100, y: 0 },
      {
        yPercent: 0,
        y: 0,
        duration: HERO_SEGMENT,
        ease: "none",
        immediateRender: true,
      },
      0
    );

    timeline.fromTo(
      darkPanel,
      { yPercent: 100, y: 0 },
      {
        yPercent: 0,
        y: 0,
        duration: OVERLAP_SEGMENT,
        ease: "none",
        immediateRender: true,
      },
      darkOverlapStart
    );

    if (prefixTravel > 0) {
      timeline.to(
        prefix,
        {
          y: prefixTravel,
          duration: linePhaseDuration,
          ease: "none",
        },
        linePhaseStart
      );
    }

    for (var i = 0; i < lineCount; i += 1) {
      var line = lines[i];
      var pos = linePhaseStart + i * LINE_SEGMENT;

      timeline.fromTo(
        line,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: LINE_SEGMENT * 0.55,
          ease: "power2.out",
          immediateRender: false,
        },
        pos
      );
    }

    if (timeline.scrollTrigger) {
      timeline.scrollTrigger.update();
      timeline.progress(timeline.scrollTrigger.progress);
    }

    if (!resizeObserver && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(function () {
        ScrollTrigger.refresh();
      });
      resizeObserver.observe(track);
      resizeObserver.observe(pinEl);
      resizeObserver.observe(stack);
    }
  }

  function onModeChange() {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    build();
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
    }
  }

  if (motionQuery.addEventListener) {
    motionQuery.addEventListener("change", onModeChange);
  } else if (motionQuery.addListener) {
    motionQuery.addListener(onModeChange);
  }

  if (narrowQuery.addEventListener) {
    narrowQuery.addEventListener("change", onModeChange);
  } else if (narrowQuery.addListener) {
    narrowQuery.addListener(onModeChange);
  }

  function init() {
    build();
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function scrollToPageHash() {
    var id = window.location.hash && window.location.hash.slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    var marginTop = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    var top = target.getBoundingClientRect().top + window.scrollY - marginTop;
    if (
      timeline &&
      timeline.scrollTrigger &&
      top > timeline.scrollTrigger.end + 8
    ) {
      releaseOverlap();
      ScrollTrigger.refresh();
      top = target.getBoundingClientRect().top + window.scrollY - marginTop;
    }
    window.scrollTo(0, Math.max(0, top));
  }

  window.addEventListener("load", function () {
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
      requestAnimationFrame(function () {
        scrollToPageHash();
        ScrollTrigger.refresh();
      });
    } else {
      scrollToPageHash();
    }
  });
})();
