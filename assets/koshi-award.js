/* ============================================================
   Koshi Chhyang — v2 experience
   GSAP + ScrollTrigger + Lenis + Three.js (WebGL hero)
   ============================================================ */

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none)").matches;
const hasGsap = typeof gsap !== "undefined";
if (hasGsap) gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   1. Text splitting
   ============================================================ */
function splitChars(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute("aria-label", words.join(" "));
  el.textContent = "";
  words.forEach((w, i) => {
    const mask = document.createElement("span");
    mask.className = "word";
    mask.setAttribute("aria-hidden", "true");
    [...w].forEach((ch) => {
      const c = document.createElement("span");
      c.className = "char";
      c.textContent = ch;
      mask.appendChild(c);
    });
    el.appendChild(mask);
    if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
  });
  return $$(".char", el);
}

function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute("aria-label", words.join(" "));
  el.textContent = "";
  words.forEach((w, i) => {
    const span = document.createElement("span");
    span.className = "word";
    span.setAttribute("aria-hidden", "true");
    span.textContent = w;
    el.appendChild(span);
    if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
  });
  return $$(".word", el);
}

$$("[data-split-chars], [data-split]").forEach(splitChars);
$$("[data-split-words]").forEach(splitWords);

/* hover-flip labels need their text doubled */
$$("[data-hover-flip] > span").forEach((s) => s.setAttribute("data-text", s.textContent));

/* ============================================================
   2. Reduced-motion / no-GSAP fallback
   ============================================================ */
const THEMES = {
  night:  { "--bg": "#0d0a10", "--fg": "#f3ecdc", "--muted": "rgba(243,236,220,0.64)", "--line": "rgba(243,236,220,0.16)", "--accent": "#c9994e" },
  paper:  { "--bg": "#f3ecdc", "--fg": "#181410", "--muted": "#5a4f40", "--line": "rgba(24,20,16,0.16)", "--accent": "#c14e28" },
  paper2: { "--bg": "#e9dcc3", "--fg": "#181410", "--muted": "#54493b", "--line": "rgba(24,20,16,0.18)", "--accent": "#c14e28" },
  clay:   { "--bg": "#c14e28", "--fg": "#f6efdf", "--muted": "rgba(246,239,223,0.82)", "--line": "rgba(246,239,223,0.32)", "--accent": "#f2d8a7" },
};

if (prefersReduced || !hasGsap) {
  const pre = $("#preloader");
  if (pre) pre.remove();
  $$(".reveal").forEach((el) => { el.style.opacity = 1; el.style.transform = "none"; });
  $$(".char").forEach((el) => { el.style.transform = "none"; });
  // static section theming
  $$("[data-theme]").forEach((sec) => {
    const t = THEMES[sec.dataset.theme] || THEMES.night;
    sec.style.background = t["--bg"];
    sec.style.color = t["--fg"];
  });
  $$(".lineage__line-fill").forEach((el) => { el.style.transform = "scaleY(1)"; });
}

/* ============================================================
   3. Smooth scroll (Lenis) + page progress
   ============================================================ */
let lenis = null;
let scrollVelocity = 0;

if (!prefersReduced && hasGsap && typeof Lenis !== "undefined") {
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on("scroll", (e) => {
    scrollVelocity = e.velocity || 0;
    ScrollTrigger.update();
  });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

if (hasGsap && !prefersReduced) {
  gsap.to("#pageProgress", {
    scaleX: 1, ease: "none",
    scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.4 },
  });
}

/* anchor navigation */
$$('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    closeMenu();
    if (lenis) lenis.scrollTo(target, { offset: -56, duration: 1.5 });
    else target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
  });
});

/* ============================================================
   4. Theme morphing between sections
   (created after the journey pin so trigger positions account
   for the pin spacer — see initThemes() call below)
   ============================================================ */
function initThemes() {
  if (!hasGsap || prefersReduced) return;
  $$("[data-theme]").forEach((sec) => {
    const theme = THEMES[sec.dataset.theme] || THEMES.night;
    const apply = () => gsap.to(":root", { ...theme, duration: 0.85, ease: "power2.out", overwrite: "auto" });
    ScrollTrigger.create({
      trigger: sec,
      start: "top 55%",
      end: "bottom 55%",
      onEnter: apply,
      onEnterBack: apply,
    });
  });
  ScrollTrigger.sort();
}

/* ============================================================
   5. Preloader → hero intro
   ============================================================ */
const STEPS = ["steam the rice", "wake the marcha", "seal the jar", "wait, patiently", "pour"];

function heroIntro() {
  if (!hasGsap || prefersReduced) return;
  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
  tl.to(".hero__title .char", { y: 0, rotate: 0, duration: 1.3, stagger: { each: 0.035, from: "start" } })
    .to(".hero__content .reveal", { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, "-=0.8")
    .from("#heroDev", { opacity: 0, scale: 0.94, duration: 1.6, ease: "power2.out" }, 0.1)
    .from(".hero__foot", { opacity: 0, y: 14, duration: 0.9 }, "-=0.6")
    // opacity only: .nav transform belongs to the hide-on-scroll CSS transition
    .from(".nav", { opacity: 0, duration: 0.8 }, "-=0.9");
}

if (hasGsap && !prefersReduced) {
  const pre = $("#preloader");
  const count = $("#preloaderCount");
  const step = $("#preloaderStep");
  const fill = $("#preloaderFill");
  const pct = $("#preloaderPct");
  const state = { day: 1, p: 0 };

  if (lenis) lenis.stop();

  gsap.timeline({
    onComplete: () => { pre.remove(); if (lenis) lenis.start(); heroIntro(); },
  })
    .to(state, {
      day: 14, p: 100, duration: 2.1, ease: "power2.inOut",
      onUpdate: () => {
        count.textContent = "Day " + String(Math.round(state.day)).padStart(2, "0");
        pct.textContent = Math.round(state.p);
        fill.style.transform = `scaleX(${state.p / 100})`;
        step.textContent = STEPS[clamp(Math.floor((state.p / 100) * STEPS.length), 0, STEPS.length - 1)];
      },
    })
    .to(".preloader__inner, .preloader__pct", { opacity: 0, y: -26, duration: 0.45, ease: "power2.in" }, "+=0.2")
    .to(pre, { yPercent: -100, duration: 0.85, ease: "power4.inOut" }, "-=0.1");
}

/* ============================================================
   6. Hero — rotating word, mouse parallax
   ============================================================ */
(function rotator() {
  const words = $$("#rotator .rotator__word");
  if (!words.length || prefersReduced || !hasGsap) return;
  let i = 0;
  setInterval(() => {
    const prev = words[i];
    i = (i + 1) % words.length;
    const next = words[i];
    // toggle classes first so GSAP reads a clean (none) CSS transform,
    // then drive the motion entirely with inline tweens
    words.forEach((w) => w.classList.toggle("is-on", w === next));
    gsap.fromTo(prev, { yPercent: 0, y: 0, opacity: 1 }, { yPercent: -110, opacity: 0, duration: 0.55, ease: "power3.in" });
    gsap.fromTo(next, { yPercent: 110, y: 0, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.65, ease: "power3.out", delay: 0.12 });
  }, 2600);
})();

if (hasGsap && !prefersReduced && !isTouch) {
  const devX = gsap.quickTo("#heroDev", "x", { duration: 1.2, ease: "power3.out" });
  const devY = gsap.quickTo("#heroDev", "y", { duration: 1.2, ease: "power3.out" });
  const contentX = gsap.quickTo(".hero__content", "x", { duration: 1.6, ease: "power3.out" });
  window.addEventListener("pointermove", (e) => {
    const nx = (e.clientX / innerWidth) * 2 - 1;
    const ny = (e.clientY / innerHeight) * 2 - 1;
    devX(nx * 26); devY(ny * 18);
    contentX(nx * -8);
  });
}

if (hasGsap && !prefersReduced) {
  gsap.to("#heroDev", {
    yPercent: 24, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero__content", {
    yPercent: -8, opacity: 0.25, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 30%", scrub: true },
  });
}

/* ============================================================
   7. Nav + fullscreen menu
   ============================================================ */
const nav = $("#nav");
let lastY = 0;
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  nav.classList.toggle("is-scrolled", y > 40);
  nav.classList.toggle("is-hidden", y > 650 && y > lastY && !menuOpen);
  lastY = y;
}, { passive: true });

const menu = $("#menu");
const menuToggle = $("#menuToggle");
let menuOpen = false;
let menuTl = null;

if (hasGsap && menu) {
  menuTl = gsap.timeline({ paused: true })
    .set(menu, { visibility: "visible" })
    .to(".menu__bg", { scaleY: 1, duration: 0.65, ease: "power4.inOut" })
    .to(".menu__link", { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, ease: "power3.out" }, "-=0.25")
    .to(".menu__link .char", { y: 0, rotate: 0, duration: 0.7, stagger: 0.012, ease: "power3.out" }, "<")
    .to(".menu__foot", { opacity: 1, y: 0, duration: 0.5 }, "-=0.4");
}

function openMenu() {
  if (!menuTl || menuOpen) return;
  menuOpen = true;
  menu.classList.add("is-open");
  menu.setAttribute("aria-hidden", "false");
  menuToggle.setAttribute("aria-expanded", "true");
  if (lenis) lenis.stop();
  menuTl.timeScale(1).play();
}
function closeMenu() {
  if (!menuTl || !menuOpen) return;
  menuOpen = false;
  menu.setAttribute("aria-hidden", "true");
  menuToggle.setAttribute("aria-expanded", "false");
  if (lenis) lenis.start();
  menuTl.timeScale(1.6).reverse().eventCallback("onReverseComplete", () => menu.classList.remove("is-open"));
}
if (menuToggle) menuToggle.addEventListener("click", () => (menuOpen ? closeMenu() : openMenu()));
window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

/* ============================================================
   8. Custom cursor
   ============================================================ */
(function cursor() {
  const root = $(".cursor");
  if (!root || isTouch || prefersReduced) return;
  const label = $(".cursor__label", root);
  const dot = $(".cursor__dot", root);
  const ring = $(".cursor__ring", root);
  let tx = -100, ty = -100;
  let dx = tx, dy = ty, rx = tx, ry = ty;

  window.addEventListener("pointermove", (e) => {
    tx = e.clientX; ty = e.clientY;
    root.classList.add("is-active");
  });
  window.addEventListener("pointerdown", () => root.classList.add("is-down"));
  window.addEventListener("pointerup", () => root.classList.remove("is-down"));

  (function loop() {
    dx = lerp(dx, tx, 0.4); dy = lerp(dy, ty, 0.4);
    rx = lerp(rx, tx, 0.16); ry = lerp(ry, ty, 0.16);
    dot.style.left = dx + "px"; dot.style.top = dy + "px";
    ring.style.left = rx + "px"; ring.style.top = ry + "px";
    label.style.left = rx + "px"; label.style.top = ry + "px";
    requestAnimationFrame(loop);
  })();

  const LABELS = { film: "play", shop: "shop", drag: "drag" };
  document.addEventListener("mouseover", (e) => {
    const labelled = e.target.closest("[data-cursor]");
    const interactive = e.target.closest("a, button, input, [data-tilt]");
    if (labelled) {
      label.textContent = LABELS[labelled.dataset.cursor] || labelled.dataset.cursor;
      root.classList.add("is-label");
    } else root.classList.remove("is-label");
    root.classList.toggle("is-hover", !!interactive && !labelled);
  });
})();

/* ============================================================
   9. Magnetic elements
   ============================================================ */
if (hasGsap && !isTouch && !prefersReduced) {
  $$("[data-magnetic]").forEach((el) => {
    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      xTo(clamp((e.clientX - (r.left + r.width / 2)) * 0.32, -14, 14));
      yTo(clamp((e.clientY - (r.top + r.height / 2)) * 0.32, -10, 10));
    });
    el.addEventListener("pointerleave", () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
    });
  });
}

/* ============================================================
   10. Marquee — velocity-reactive
   ============================================================ */
if (hasGsap && !prefersReduced) {
  $$("[data-marquee]").forEach((row) => {
    const dir = Number(row.dataset.dir) || 1;
    const content = row.firstElementChild;
    // duplicate content until ≥ 2× viewport width, keeping an even count
    // so xPercent:-50 wraps seamlessly onto an identical half
    while (row.scrollWidth < innerWidth * 2.2 || row.children.length % 2 !== 0) {
      row.appendChild(content.cloneNode(true));
    }
    const tween = gsap.to(row, {
      xPercent: -50, ease: "none", duration: 24, repeat: -1,
    });
    if (dir === -1) { tween.progress(1); tween.timeScale(-1); }
    gsap.ticker.add(() => {
      const boost = 1 + Math.min(Math.abs(scrollVelocity) * 0.06, 3);
      tween.timeScale(dir * boost);
    });
  });
}

/* ============================================================
   11. Scroll reveals
   ============================================================ */
if (hasGsap && !prefersReduced) {
  $$(".reveal").forEach((el) => {
    if (el.closest(".hero")) return; // handled in intro
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1.05, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%" },
    });
  });

  // char-split headings outside hero / journey / menu
  $$("[data-split-chars]").forEach((el) => {
    if (el.closest(".hero") || el.closest(".journey") || el.closest(".menu")) return;
    gsap.to($$(".char", el), {
      y: 0, rotate: 0, duration: 1, ease: "power4.out", stagger: 0.025,
      scrollTrigger: { trigger: el, start: "top 86%" },
    });
  });

  // manifesto word scrub
  const words = $$(".manifesto__text .word");
  if (words.length) {
    gsap.set(words, { opacity: 0.13 });
    gsap.to(words, {
      opacity: 1, stagger: 0.04, ease: "none",
      scrollTrigger: { trigger: ".manifesto", start: "top 72%", end: "bottom 62%", scrub: true },
    });
  }
}

/* ============================================================
   12. Lineage timeline
   ============================================================ */
if (hasGsap && !prefersReduced) {
  gsap.to("#lineageFill", {
    scaleY: 1, ease: "none",
    scrollTrigger: { trigger: "#lineageTimeline", start: "top 70%", end: "bottom 55%", scrub: true },
  });
  $$(".milestone").forEach((m) => {
    gsap.from(m, {
      opacity: 0, x: -36, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: m, start: "top 82%" },
    });
    gsap.from($(".milestone__marker", m), {
      scale: 0, duration: 0.55, ease: "back.out(2.6)",
      scrollTrigger: { trigger: m, start: "top 82%" },
    });
  });
}

/* ============================================================
   13. Journey — pinned horizontal scrollytelling
   ============================================================ */
const track = $("#journeyTrack");
const dayCounter = $("#dayCounter");

function setDay(p) {
  if (!dayCounter) return;
  const day = clamp(Math.round(1 + p * 13), 1, 14);
  dayCounter.textContent = String(day).padStart(2, "0");
}

if (hasGsap && !prefersReduced && track) {
  ScrollTrigger.matchMedia({
    "(min-width: 821px)": function () {
      const panels = $$(".chapter", track);
      const getDistance = () => track.scrollWidth - innerWidth;

      const journeyTween = gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: ".journey__pin",
          start: "top top",
          end: () => "+=" + getDistance(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            $("#journeyProgress").style.transform = `scaleX(${self.progress})`;
            $("#journeyIndex").textContent = String(clamp(Math.round(self.progress * (panels.length - 1)) + 1, 1, panels.length)).padStart(2, "0");
          },
        },
      });

      ScrollTrigger.create({
        trigger: ".chapter--wait",
        containerAnimation: journeyTween,
        start: "left 80%",
        end: "right 60%",
        onUpdate: (self) => setDay(self.progress),
      });

      // chapter art drift
      $$(".chapter__art").forEach((art) => {
        gsap.fromTo(art, { x: 70 }, {
          x: -70, ease: "none",
          scrollTrigger: {
            trigger: art.closest(".chapter"),
            containerAnimation: journeyTween,
            start: "left right", end: "right left", scrub: true,
          },
        });
      });

      // chapter big numerals drift opposite
      $$(".chapter__num").forEach((num) => {
        gsap.fromTo(num, { xPercent: 14 }, {
          xPercent: -14, ease: "none",
          scrollTrigger: {
            trigger: num.closest(".chapter"),
            containerAnimation: journeyTween,
            start: "left right", end: "right left", scrub: true,
          },
        });
      });

      // chapter title char reveals inside the horizontal container
      $$(".chapter__title").forEach((title) => {
        gsap.to($$(".char", title), {
          y: 0, rotate: 0, duration: 0.9, ease: "power4.out", stagger: 0.03,
          scrollTrigger: {
            trigger: title.closest(".chapter"),
            containerAnimation: journeyTween,
            start: "left 62%",
          },
        });
      });

      // terraces line draw
      $$(".art-terraces path").forEach((p, i) => {
        const len = p.getTotalLength();
        gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, {
          strokeDashoffset: 0, duration: 1.4, ease: "power2.out", delay: i * 0.08,
          scrollTrigger: {
            trigger: ".chapter--grain",
            containerAnimation: journeyTween,
            start: "left 60%",
          },
        });
      });
    },

    "(max-width: 820px)": function () {
      gsap.set(track, { x: 0 });
      $$(".chapter__title").forEach((title) => {
        gsap.to($$(".char", title), {
          y: 0, rotate: 0, duration: 0.9, ease: "power4.out", stagger: 0.03,
          scrollTrigger: { trigger: title, start: "top 86%" },
        });
      });
      ScrollTrigger.create({
        trigger: ".chapter--wait",
        start: "top 70%",
        end: "bottom 50%",
        onUpdate: (self) => setDay(self.progress),
      });
    },
  });
} else {
  setDay(1);
  if (track) track.classList.add("is-static");
  $$(".chapter__title .char").forEach((el) => { el.style.transform = "none"; });
}

/* themes must be created after the journey pin exists */
initThemes();

/* fermentation bubbles */
const bubbleField = $("#bubbleField");
if (bubbleField && !prefersReduced) {
  for (let i = 0; i < 18; i++) {
    const b = document.createElement("span");
    b.className = "bubble";
    const size = 4 + Math.random() * 12;
    b.style.width = size + "px";
    b.style.height = size + "px";
    b.style.left = 8 + Math.random() * 84 + "%";
    b.style.animationDuration = 4 + Math.random() * 6 + "s";
    b.style.animationDelay = -Math.random() * 8 + "s";
    bubbleField.appendChild(b);
  }
}

/* film clips: play only when visible */
$$("video[data-film]").forEach((v) => {
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause()));
    }, { threshold: 0.15 }).observe(v);
  } else v.play().catch(() => {});
});

/* ============================================================
   14. Stats counters
   ============================================================ */
if (hasGsap && !prefersReduced) {
  $$("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    const pad = Number(el.dataset.pad || 1);
    const state = { v: 0 };
    gsap.to(state, {
      v: target, duration: 1.6, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
      onUpdate: () => { el.textContent = String(Math.round(state.v)).padStart(pad, "0"); },
    });
  });
} else {
  $$("[data-count]").forEach((el) => {
    el.textContent = String(Number(el.dataset.count)).padStart(Number(el.dataset.pad || 1), "0");
  });
}

/* ============================================================
   15. Product cards — 3D tilt + glare
   ============================================================ */
if (hasGsap && !isTouch && !prefersReduced) {
  $$("[data-tilt]").forEach((card) => {
    const rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3.out" });
    const ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3.out" });
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * 10);
      rx((0.5 - py) * 8);
      card.style.setProperty("--gx", px * 100 + "%");
      card.style.setProperty("--gy", py * 100 + "%");
    });
    card.addEventListener("pointerleave", () => {
      gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.9, ease: "elastic.out(1, 0.5)" });
    });
  });

  $$("[data-tilt-soft]").forEach((el) => {
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      xTo(((e.clientX - r.left) / r.width - 0.5) * 10);
    });
    el.addEventListener("pointerleave", () => xTo(0));
  });
}

/* ============================================================
   16. Basket — fly-to-cart micro-interaction
   ============================================================ */
let basketTotal = 0;
const basketBtn = $("#basketBtn");
const basketCount = $("#basketCount");

$$("[data-add]").forEach((btn) => {
  btn.addEventListener("click", () => {
    basketTotal += 1;
    basketCount.textContent = basketTotal;
    basketCount.classList.add("is-on");

    const span = $("span", btn);
    const original = span.textContent;
    btn.classList.add("is-done");
    span.textContent = "Added ✓";
    setTimeout(() => { btn.classList.remove("is-done"); span.textContent = original; }, 1400);

    if (!hasGsap || prefersReduced) return;

    const from = btn.getBoundingClientRect();
    const to = basketBtn.getBoundingClientRect();
    const dot = document.createElement("span");
    dot.className = "flydot";
    dot.style.left = from.left + from.width / 2 + "px";
    dot.style.top = from.top + from.height / 2 + "px";
    document.body.appendChild(dot);

    gsap.timeline({ onComplete: () => dot.remove() })
      .to(dot, { left: to.left + to.width / 2, duration: 0.7, ease: "power1.inOut" }, 0)
      .to(dot, { top: to.top + to.height / 2, duration: 0.7, ease: "power2.in" }, 0)
      .to(dot, { scale: 0.4, opacity: 0.8, duration: 0.7 }, 0)
      .to(basketBtn, { scale: 1.18, duration: 0.16, ease: "power2.out" }, 0.62)
      .to(basketBtn, { scale: 1, duration: 0.4, ease: "elastic.out(1.4, 0.4)" }, 0.78);
  });
});

/* ============================================================
   17. Waitlist forms
   ============================================================ */
$$("[data-waitlist]").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("input", form);
    const btn = $("button", form);
    if (!input.value || !input.checkValidity()) { input.reportValidity(); return; }
    form.classList.add("is-done");
    input.disabled = true;
    btn.classList.add("is-done");
    $("span", btn).textContent = "You're on the list ✓";
  });
});

/* ============================================================
   18. WebGL hero — fermenting river (Three.js)
   ============================================================ */
(async function heroGL() {
  const canvas = $("#glCanvas");
  if (!canvas || prefersReduced) return;

  let THREE;
  try {
    THREE = await import("three");
  } catch {
    canvas.style.display = "none";
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  } catch {
    canvas.style.display = "none";
    return;
  }

  const DPR = Math.min(devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(DPR);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
  camera.position.z = 1;

  /* --- flowing ferment shader --- */
  const uniforms = {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uStir: { value: 0 }, // mouse energy → swirl strength
    uNight: { value: new THREE.Color("#0d0a10") },
    uMilk: { value: new THREE.Color("#efe6d2") },
    uBrass: { value: new THREE.Color("#c9994e") },
    uClay: { value: new THREE.Color("#c14e28") },
  };

  const bg = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms,
      depthWrite: false,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime, uStir;
        uniform vec2 uRes, uMouse;
        uniform vec3 uNight, uMilk, uBrass, uClay;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                     mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
        }
        float fbm(vec2 p) {
          float v = 0.0, a = 0.5;
          mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
          for (int i = 0; i < 5; i++) {
            v += a * noise(p);
            p = r * p * 2.05;
            a *= 0.5;
          }
          return v;
        }

        void main() {
          float aspect = uRes.x / max(uRes.y, 1.0);
          vec2 uv = vUv;
          vec2 p = vec2(uv.x * aspect, uv.y) * 1.7;
          float t = uTime * 0.045;

          // mouse stir — silky swirl around the pointer
          vec2 m = vec2(uMouse.x * aspect, uMouse.y);
          vec2 dm = p - m * 1.7;
          float md = length(dm);
          vec2 swirl = vec2(-dm.y, dm.x) * exp(-md * 2.6) * (0.22 + uStir * 0.55);
          p += swirl;

          // layered flow: domain-warped fbm drifting like a slow river
          vec2 q = vec2(fbm(p + vec2(t * 0.9, -t * 0.3)), fbm(p + vec2(-t * 0.4, t * 0.6) + 3.7));
          float n = fbm(p + q * 1.4 + vec2(t * 0.5, 0.0));

          // milky streams over the night
          vec3 col = uNight;
          float streams = smoothstep(0.42, 0.88, n);
          col = mix(col, uMilk * 0.5, streams * 0.5);
          col = mix(col, uBrass * 0.75, smoothstep(0.72, 0.97, n) * 0.38);
          col = mix(col, uClay * 0.55, smoothstep(0.30, 0.05, n) * 0.22);

          // faint rising warmth near the bottom (the ferment working)
          col += uClay * 0.05 * smoothstep(0.55, 0.0, uv.y) * (0.5 + 0.5 * sin(t * 4.0 + uv.x * 9.0));

          // vignette
          float vig = smoothstep(1.25, 0.35, length(uv - 0.5) * 1.6);
          col *= mix(0.62, 1.0, vig);

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })
  );
  scene.add(bg);

  /* --- drifting rice motes (points) --- */
  const COUNT = isTouch ? 90 : 170;
  const pos = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT * 3); // speed, size, phase
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = Math.random() * 2 - 1;
    pos[i * 3 + 1] = Math.random() * 2 - 1;
    pos[i * 3 + 2] = Math.random(); // depth 0..1
    seed[i * 3] = 0.02 + Math.random() * 0.05;        // fall speed
    seed[i * 3 + 1] = (1.5 + Math.random() * 3.2) * DPR; // size px
    seed[i * 3 + 2] = Math.random() * Math.PI * 2;    // phase
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 3));

  const motes = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute vec3 aSeed;
        uniform float uTime;
        uniform vec2 uMouse;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          float depth = p.z;
          // slow fall with wrap + sway
          p.y = mod(p.y - uTime * aSeed.x, 2.0) - 1.0;
          p.x += sin(uTime * 0.35 + aSeed.z) * 0.04 * (1.0 - depth);
          // parallax away from the mouse
          p.xy += (uMouse - 0.5) * -0.08 * (1.0 - depth);
          vAlpha = mix(0.18, 0.55, depth) * (0.7 + 0.3 * sin(uTime * 0.8 + aSeed.z));
          gl_Position = vec4(p.xy, 0.0, 1.0);
          gl_PointSize = aSeed.y * mix(0.6, 1.4, depth);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform vec3 uBrass;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.08, d) * vAlpha;
          gl_FragColor = vec4(uBrass, a);
        }
      `,
    })
  );
  scene.add(motes);

  /* --- sizing / visibility / loop --- */
  const hero = $("#hero");
  let heroVisible = true;
  new IntersectionObserver((entries) => {
    heroVisible = entries[0].isIntersecting;
  }, { threshold: 0.02 }).observe(hero);

  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w * DPR, h * DPR);
  }
  resize();
  window.addEventListener("resize", resize);

  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, energy: 0 };
  window.addEventListener("pointermove", (e) => {
    const nx = e.clientX / innerWidth;
    const ny = 1 - e.clientY / innerHeight;
    mouse.energy = clamp(mouse.energy + (Math.abs(nx - mouse.tx) + Math.abs(ny - mouse.ty)) * 8, 0, 1);
    mouse.tx = nx; mouse.ty = ny;
  });

  const start = performance.now();
  (function frame() {
    requestAnimationFrame(frame);
    if (!heroVisible || document.hidden) return;
    const t = (performance.now() - start) / 1000;
    mouse.x = lerp(mouse.x, mouse.tx, 0.05);
    mouse.y = lerp(mouse.y, mouse.ty, 0.05);
    mouse.energy *= 0.96;
    uniforms.uTime.value = t;
    uniforms.uMouse.value.set(mouse.x, mouse.y);
    uniforms.uStir.value = mouse.energy;
    renderer.render(scene, camera);
  })();
})();
