/**
 * Site-wide motion — load-in, scroll reveals, native smooth anchors
 */
(function () {
  var body = document.body;
  var motionPages = ["page-home", "page-heritage", "page-collection", "page-business"];
  var hasMotion = motionPages.some(function (cls) {
    return body.classList.contains(cls);
  });
  if (!hasMotion) return;

  var isHome = body.classList.contains("page-home");
  var hero = isHome ? document.querySelector(".landing-hero") : null;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (hero) {
    requestAnimationFrame(function () {
      hero.classList.add("is-ready");
    });
  }

  var targets = document.querySelectorAll("[data-reveal]");

  if (reduced || !targets.length) {
    targets.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({
        top: top,
        behavior: reduced ? "auto" : "smooth",
      });
    });
  });
})();
