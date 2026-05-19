/**
 * Site header — scroll transitions (all motion pages)
 */
(function () {
  var motionPages = ["page-home", "page-heritage", "page-collection", "page-business"];
  var body = document.body;
  var hasMotion = motionPages.some(function (cls) {
    return body.classList.contains(cls);
  });
  if (!hasMotion) return;

  var header = document.querySelector("[data-site-header]");
  if (!header) return;

  var lastY = 0;

  requestAnimationFrame(function () {
    header.classList.add("is-loaded");
  });

  function onScroll(y) {
    header.classList.toggle("is-scrolled", y > 56);

    if (y < 72) {
      header.classList.remove("is-hidden");
    } else if (y > lastY + 4) {
      header.classList.add("is-hidden");
    } else if (y < lastY - 4) {
      header.classList.remove("is-hidden");
    }
    lastY = y;
  }

  window.addEventListener(
    "scroll",
    function () {
      onScroll(window.scrollY);
    },
    { passive: true }
  );
  onScroll(window.scrollY);
})();
