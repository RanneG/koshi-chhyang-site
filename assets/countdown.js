(function () {
  /** Launch: 18 July 2026, 6:00 PM Europe/London (BST = UTC+1 → 17:00 UTC) */
  var TARGET = new Date("2026-07-18T17:00:00.000Z");

  var root = document.querySelector(".launch-countdown");
  if (!root) return;

  var daysEl = root.querySelector('[data-unit="days"]');
  var hoursEl = root.querySelector('[data-unit="hours"]');
  var minutesEl = root.querySelector('[data-unit="minutes"]');
  var secondsEl = root.querySelector('[data-unit="seconds"]');

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function tick() {
    var diff = TARGET.getTime() - Date.now();
    if (diff <= 0) {
      root.classList.add("is-live");
      return;
    }
    var days = Math.floor(diff / 86400000);
    diff -= days * 86400000;
    var hours = Math.floor(diff / 3600000);
    diff -= hours * 3600000;
    var minutes = Math.floor(diff / 60000);
    diff -= minutes * 60000;
    var seconds = Math.floor(diff / 1000);

    if (daysEl) daysEl.textContent = pad(days);
    if (hoursEl) hoursEl.textContent = pad(hours);
    if (minutesEl) minutesEl.textContent = pad(minutes);
    if (secondsEl) secondsEl.textContent = pad(seconds);
  }

  tick();
  setInterval(tick, 1000);
})();
