/**
 * Full-page capybara loader — dismiss on window load (min display for motion users).
 */
(function () {
  var loader = document.getElementById("page-loader");
  if (!loader) return;

  var body = document.body;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var minMs = reduced ? 0 : 850;
  var start = Date.now();
  var done = false;

  body.classList.add("page-is-loading");

  function finish() {
    if (done) return;
    done = true;

    var elapsed = Date.now() - start;
    var wait = Math.max(0, minMs - elapsed);

    window.setTimeout(function () {
      loader.classList.add("is-done");
      loader.setAttribute("aria-busy", "false");
      body.classList.remove("page-is-loading");

      window.setTimeout(function () {
        if (loader.parentNode) {
          loader.parentNode.removeChild(loader);
        }
      }, reduced ? 0 : 560);
    }, wait);
  }

  if (document.readyState === "complete") {
    finish();
  } else {
    window.addEventListener("load", finish);
    window.setTimeout(finish, 8000);
  }
})();
