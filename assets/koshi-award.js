/* Koshi Chhyang — landing interactions */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof gsap !== "undefined";
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------------- smooth scroll (Lenis) ---------------- */
  let lenis = null;
  if (!prefersReduced && typeof Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", () => hasGsap && ScrollTrigger.update());
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------------- split text helpers ---------------- */
  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    el.setAttribute("aria-label", words.join(" "));
    words.forEach((w, i) => {
      const mask = document.createElement("span");
      mask.className = "word";
      mask.setAttribute("aria-hidden", "true");
      const inner = document.createElement("span");
      inner.textContent = w;
      mask.appendChild(inner);
      el.appendChild(mask);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return el.querySelectorAll(".word > span");
  }

  document.querySelectorAll("[data-split], [data-split-lines]").forEach((el) => splitWords(el));

  /* ---------------- preloader ---------------- */
  const preloader = document.getElementById("preloader");
  const preloaderCount = document.getElementById("preloaderCount");

  function heroIntro() {
    if (!hasGsap || prefersReduced) return;
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.to(".hero__title .word > span", { y: 0, duration: 1.2, stagger: 0.08 })
      .to(".hero .reveal", { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, "-=0.7")
      .from(".hero__dev", { opacity: 0, scale: 0.96, duration: 1.4, ease: "power2.out" }, 0);
  }

  if (prefersReduced || !hasGsap) {
    preloader.remove();
    document.querySelectorAll(".reveal").forEach((el) => { el.style.opacity = 1; el.style.transform = "none"; });
    document.querySelectorAll("[data-split] .word > span").forEach((el) => { el.style.transform = "none"; });
  } else {
    const counter = { day: 1 };
    gsap.timeline()
      .to(counter, {
        day: 14, duration: 1.6, ease: "power2.inOut",
        onUpdate: () => { preloaderCount.textContent = "Day " + String(Math.round(counter.day)).padStart(2, "0"); }
      })
      .to(preloader, {
        yPercent: -100, duration: 0.9, ease: "power4.inOut",
        onComplete: () => { preloader.remove(); heroIntro(); }
      }, "+=0.25");
  }

  /* ---------------- generic reveals ---------------- */
  if (hasGsap && !prefersReduced) {
    document.querySelectorAll(".reveal").forEach((el) => {
      if (el.closest(".hero")) return; // hero handled by intro timeline
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });

    // split-word headings outside the hero
    document.querySelectorAll("[data-split]").forEach((el) => {
      if (el.closest(".hero")) return;
      const inJourney = el.closest(".journey");
      gsap.to(el.querySelectorAll(".word > span"), {
        y: 0, duration: 1, ease: "power4.out", stagger: 0.05,
        scrollTrigger: inJourney
          ? { trigger: el.closest(".chapter"), containerAnimation: undefined, start: "top 90%" }
          : { trigger: el, start: "top 88%" }
      });
    });

    // manifesto: soft word-by-word fade
    const manifestoWords = document.querySelectorAll(".manifesto__text .word > span");
    gsap.set(manifestoWords, { y: 0, opacity: 0.14 });
    gsap.to(manifestoWords, {
      opacity: 1, stagger: 0.04, ease: "none",
      scrollTrigger: { trigger: ".manifesto", start: "top 75%", end: "bottom 60%", scrub: true }
    });
  }

  /* ---------------- journey: pinned horizontal scroll ---------------- */
  const track = document.getElementById("journeyTrack");
  const progressFill = document.getElementById("journeyProgress");
  const dayCounter = document.getElementById("dayCounter");
  let journeyTween = null;

  function setDay(p) {
    const day = Math.max(1, Math.min(14, Math.round(1 + p * 13)));
    dayCounter.textContent = String(day).padStart(2, "0");
  }

  if (hasGsap && !prefersReduced) {
    ScrollTrigger.matchMedia({
      "(min-width: 821px)": function () {
        const getDistance = () => track.scrollWidth - window.innerWidth;

        journeyTween = gsap.to(track, {
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
              progressFill.style.transform = "scaleX(" + self.progress + ")";
            }
          }
        });

        // day counter scrubbed while chapter 3 crosses the viewport
        ScrollTrigger.create({
          trigger: ".chapter--wait",
          containerAnimation: journeyTween,
          start: "left 80%",
          end: "right 60%",
          onUpdate: (self) => setDay(self.progress)
        });

        // chapter art drift (parallax inside horizontal scroll)
        document.querySelectorAll(".chapter__art").forEach((art) => {
          gsap.fromTo(art, { x: 60 }, {
            x: -60, ease: "none",
            scrollTrigger: {
              trigger: art.closest(".chapter"),
              containerAnimation: journeyTween,
              start: "left right", end: "right left", scrub: true
            }
          });
        });
      },

      "(max-width: 820px)": function () {
        gsap.set(track, { x: 0 });
        ScrollTrigger.create({
          trigger: ".chapter--wait",
          start: "top 70%",
          end: "bottom 50%",
          onUpdate: (self) => setDay(self.progress)
        });
      }
    });
  } else {
    setDay(1);
  }

  /* ---------------- fermentation bubbles ---------------- */
  const bubbleField = document.getElementById("bubbleField");
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

  /* ---------------- hero rice drift (canvas) ---------------- */
  const canvas = document.getElementById("riceCanvas");
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    let grains = [];
    let w, h;

    function resize() {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    }
    resize();
    window.addEventListener("resize", resize);

    const COLORS = ["rgba(180,80,42,0.35)", "rgba(194,149,74,0.4)", "rgba(74,65,55,0.25)"];
    for (let i = 0; i < 36; i++) {
      grains.push({
        x: Math.random(), y: Math.random(),
        len: 5 + Math.random() * 7, wdt: 2 + Math.random() * 2,
        vy: 0.00035 + Math.random() * 0.0007,
        drift: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.01,
        color: COLORS[(Math.random() * COLORS.length) | 0]
      });
    }

    function frame(t) {
      if (window.scrollY < window.innerHeight * 1.2) {
        ctx.clearRect(0, 0, w, h);
        grains.forEach((g) => {
          g.y += g.vy;
          g.rot += g.vr;
          if (g.y > 1.05) { g.y = -0.05; g.x = Math.random(); }
          const x = (g.x + Math.sin(t * 0.0004 + g.drift) * 0.015) * w;
          const y = g.y * h;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(g.rot);
          ctx.fillStyle = g.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, g.len * devicePixelRatio * 0.5, g.wdt * devicePixelRatio * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------------- nav behaviour ---------------- */
  const nav = document.getElementById("nav");
  let lastY = 0;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 40);
    nav.classList.toggle("is-hidden", y > 600 && y > lastY);
    lastY = y;
  }, { passive: true });

  /* ---------------- lineage timeline ---------------- */
  const lineageFill = document.getElementById("lineageFill");
  if (lineageFill && hasGsap && !prefersReduced) {
    gsap.to(lineageFill, {
      scaleY: 1, ease: "none",
      scrollTrigger: {
        trigger: "#lineageTimeline",
        start: "top 70%",
        end: "bottom 55%",
        scrub: true
      }
    });
    document.querySelectorAll(".milestone").forEach((m) => {
      gsap.from(m, {
        opacity: 0, x: -32, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: m, start: "top 80%" }
      });
      gsap.from(m.querySelector(".milestone__marker"), {
        scale: 0, duration: 0.5, ease: "back.out(2.5)",
        scrollTrigger: { trigger: m, start: "top 80%" }
      });
    });
  }

  /* ---------------- film clips: play only when visible ---------------- */
  const films = document.querySelectorAll("video[data-film]");
  if (films.length) {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          const v = e.target;
          if (e.isIntersecting) { v.play().catch(() => {}); }
          else { v.pause(); }
        });
      }, { threshold: 0.15 });
      films.forEach((v) => io.observe(v));
    } else {
      films.forEach((v) => v.play().catch(() => {}));
    }
  }

  /* ---------------- custom cursor ---------------- */
  const cursor = document.querySelector(".cursor");
  if (cursor && window.matchMedia("(hover: hover)").matches && !prefersReduced) {
    let cx = -100, cy = -100, tx = cx, ty = cy;
    window.addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add("is-active");
    });
    (function loop() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cursor.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("a, button, input").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  }
})();
