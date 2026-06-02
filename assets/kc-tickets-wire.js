/** Apply KC_TICKETS config to ticket CTAs. */
(function () {
  "use strict";
  var cfg = window.KC_TICKETS;
  if (!cfg) return;

  function apply() {
    document.querySelectorAll("a.btn-buy-tickets[data-kc-checkout]").forEach(function (link) {
      if (cfg.stripePaymentLink) {
        link.href = cfg.stripePaymentLink;
      }
      if (link.dataset.autoLabel === "1" && cfg.priceLabel) {
        link.textContent = "Buy tickets — " + cfg.priceLabel;
      }
    });

    document.querySelectorAll("a.btn-tickets-details[data-kc-details]").forEach(function (link) {
      if (cfg.eventDetailsUrl) {
        link.href = cfg.eventDetailsUrl;
      }
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
