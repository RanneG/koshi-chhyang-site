/**
 * UK 18+ age gate — simple Enter / Leave (sessionStorage kc_age_verified=1).
 */
(function () {
  "use strict";

  var STORAGE_KEY = "kc_age_verified";
  var STORAGE_VAL = "1";
  var LEAVE_URL = "https://www.google.com/";

  if (sessionStorage.getItem(STORAGE_KEY) === STORAGE_VAL) {
    return;
  }

  document.documentElement.classList.add("kc-age-gate-active");

  function dismissGate() {
    sessionStorage.setItem(STORAGE_KEY, STORAGE_VAL);
    document.documentElement.classList.remove("kc-age-gate-active");
    var root = document.querySelector(".kc-age-gate");
    if (root) {
      root.hidden = true;
      root.remove();
    }
  }

  function showLeaveMessage(panel) {
    panel.classList.add("kc-age-gate--denied");
    var actions = panel.querySelector(".kc-age-gate__actions");
    var denied = panel.querySelector("#kc-age-gate-denied");
    if (actions) actions.hidden = true;
    if (denied) denied.hidden = false;
  }

  function mount() {
    var root = document.createElement("div");
    root.className = "kc-age-gate";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "kc-age-gate-title");
    root.innerHTML =
      '<div class="kc-age-gate__panel">' +
      '  <h1 id="kc-age-gate-title" class="kc-age-gate__title">Welcome to Koshi Chhyang</h1>' +
      '  <p class="kc-age-gate__legal">This website contains information about alcoholic beverages.</p>' +
      '  <p class="kc-age-gate__note">You must be 18 or over to enter (United Kingdom).</p>' +
      '  <div class="kc-age-gate__actions">' +
      '    <button type="button" class="kc-age-gate__enter" id="kc-age-enter">I am 18 or over — Enter</button>' +
      '    <button type="button" class="kc-age-gate__leave" id="kc-age-leave">I am under 18 — Leave</button>' +
      "  </div>" +
      '  <p class="kc-age-gate__denied" id="kc-age-gate-denied" hidden>' +
      "    Thank you for visiting. You must be 18 or over to view this site. " +
      '    <a href="' +
      LEAVE_URL +
      '">Leave this site</a>.' +
      "  </p>" +
      "</div>";

    document.body.insertBefore(root, document.body.firstChild);

    var panel = root.querySelector(".kc-age-gate__panel");
    root.querySelector("#kc-age-enter").addEventListener("click", dismissGate);
    root.querySelector("#kc-age-leave").addEventListener("click", function () {
      showLeaveMessage(panel);
      window.setTimeout(function () {
        window.location.href = LEAVE_URL;
      }, 2200);
    });

    root.querySelector("#kc-age-enter").focus();
  }

  if (document.body) {
    mount();
  } else {
    document.addEventListener("DOMContentLoaded", mount);
  }
})();
