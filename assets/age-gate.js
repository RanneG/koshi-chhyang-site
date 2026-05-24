/**
 * UK 18+ age gate — sessionStorage key kc_age_verified=1 (this tab only).
 * Under-18 and invalid dates do not set storage. Birthday-not-yet-this-year aware.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "kc_age_verified";
  var STORAGE_VAL = "1";
  var MIN_AGE = 18;

  if (sessionStorage.getItem(STORAGE_KEY) === STORAGE_VAL) {
    return;
  }

  document.documentElement.classList.add("kc-age-gate-active");

  function startOfDay(d) {
    var copy = new Date(d.getTime());
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  function parseDOB(dayStr, monthStr, yearStr) {
    var day = parseInt(dayStr, 10);
    var month = parseInt(monthStr, 10);
    var year = parseInt(yearStr, 10);

    if (
      !dayStr ||
      !monthStr ||
      !yearStr ||
      Number.isNaN(day) ||
      Number.isNaN(month) ||
      Number.isNaN(year)
    ) {
      return { ok: false, code: "incomplete" };
    }

    if (year < 1900 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) {
      return { ok: false, code: "invalid" };
    }

    var birth = new Date(year, month - 1, day);
    if (
      birth.getFullYear() !== year ||
      birth.getMonth() !== month - 1 ||
      birth.getDate() !== day
    ) {
      return { ok: false, code: "invalid" };
    }

    birth = startOfDay(birth);
    var today = startOfDay(new Date());

    if (birth > today) {
      return { ok: false, code: "future" };
    }

    return { ok: true, birth: birth };
  }

  function isAtLeastMinAge(birth, minAge) {
    var today = startOfDay(new Date());
    var eligible = new Date(
      birth.getFullYear() + minAge,
      birth.getMonth(),
      birth.getDate()
    );
    return startOfDay(eligible) <= today;
  }

  function messageFor(code) {
    if (code === "future") {
      return "Date of birth cannot be in the future.";
    }
    if (code === "invalid" || code === "incomplete") {
      return "Please enter a valid date of birth.";
    }
    return "";
  }

  function mount() {
    var root = document.createElement("div");
    root.className = "kc-age-gate";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "kc-age-gate-title");
    root.innerHTML =
      '<div class="kc-age-gate__panel">' +
      '  <h1 id="kc-age-gate-title" class="kc-age-gate__title">Age verification</h1>' +
      '  <p class="kc-age-gate__legal">You must be of legal drinking age in your country to enter.</p>' +
      '  <p class="kc-age-gate__note">You must be 18 or over to enter this site (UK).</p>' +
      '  <form class="kc-age-gate__form" novalidate>' +
      '    <fieldset class="kc-age-gate__fieldset">' +
      '      <legend class="kc-age-gate__legend">Date of birth</legend>' +
      '      <div class="kc-age-gate__dob">' +
      '        <div class="kc-age-gate__field">' +
      '          <label for="kc-age-day">Day</label>' +
      '          <input id="kc-age-day" name="day" type="number" inputmode="numeric" min="1" max="31" placeholder="DD" autocomplete="bday-day" required />' +
      "        </div>" +
      '        <div class="kc-age-gate__field">' +
      '          <label for="kc-age-month">Month</label>' +
      '          <input id="kc-age-month" name="month" type="number" inputmode="numeric" min="1" max="12" placeholder="MM" autocomplete="bday-month" required />' +
      "        </div>" +
      '        <div class="kc-age-gate__field">' +
      '          <label for="kc-age-year">Year</label>' +
      '          <input id="kc-age-year" name="year" type="number" inputmode="numeric" min="1900" max="9999" placeholder="YYYY" autocomplete="bday-year" required />' +
      "        </div>" +
      "      </div>" +
      "    </fieldset>" +
      '    <p class="kc-age-gate__error" id="kc-age-gate-error" role="alert" aria-live="polite"></p>' +
      '    <button type="submit" class="kc-age-gate__submit" disabled>Enter</button>' +
      "  </form>" +
      '  <p class="kc-age-gate__denied" id="kc-age-gate-denied" hidden>' +
      "    Sorry — you must be 18 or over to view this website." +
      "  </p>" +
      "</div>";

    document.body.insertBefore(root, document.body.firstChild);

    var form = root.querySelector(".kc-age-gate__form");
    var dayInput = root.querySelector("#kc-age-day");
    var monthInput = root.querySelector("#kc-age-month");
    var yearInput = root.querySelector("#kc-age-year");
    var errorEl = root.querySelector("#kc-age-gate-error");
    var submitBtn = root.querySelector(".kc-age-gate__submit");
    var deniedEl = root.querySelector("#kc-age-gate-denied");

    function fieldsFilled() {
      return Boolean(
        dayInput.value.trim() &&
          monthInput.value.trim() &&
          yearInput.value.trim()
      );
    }

    function syncSubmit() {
      submitBtn.disabled = !fieldsFilled();
    }

    function showDenied() {
      root.classList.add("kc-age-gate--denied");
      deniedEl.hidden = false;
      errorEl.textContent = "";
    }

    function dismissGate() {
      sessionStorage.setItem(STORAGE_KEY, STORAGE_VAL);
      document.documentElement.classList.remove("kc-age-gate-active");
      root.hidden = true;
      root.remove();
    }

    dayInput.addEventListener("input", syncSubmit);
    monthInput.addEventListener("input", syncSubmit);
    yearInput.addEventListener("input", syncSubmit);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      errorEl.textContent = "";

      var parsed = parseDOB(
        dayInput.value.trim(),
        monthInput.value.trim(),
        yearInput.value.trim()
      );

      if (!parsed.ok) {
        errorEl.textContent = messageFor(parsed.code);
        return;
      }

      if (!isAtLeastMinAge(parsed.birth, MIN_AGE)) {
        showDenied();
        return;
      }

      dismissGate();
    });

    dayInput.focus();
  }

  if (document.body) {
    mount();
  } else {
    document.addEventListener("DOMContentLoaded", mount);
  }
})();
