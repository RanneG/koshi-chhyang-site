/** Apply KC_TICKETS config to .btn-buy-tickets links. */
(function () {
  "use strict";
  var cfg = window.KC_TICKETS;
  if (!cfg || !cfg.stripePaymentLink) return;

  function apply() {
    document.querySelectorAll("a.btn-buy-tickets").forEach(function (link) {
      link.href = cfg.stripePaymentLink;
      if (link.dataset.autoLabel === "1" && cfg.priceLabel) {
        link.textContent = "Buy tickets — " + cfg.priceLabel;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
