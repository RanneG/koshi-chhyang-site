/**
 * Enhances in-page CTAs with playful sword icons (not header/footer nav).
 */
(function () {
  var script = document.currentScript;
  var base =
    script && script.src
      ? script.src.replace(/\/[^/]+$/, "/")
      : "assets/";
  var iconsUrl = base + "btn-playful-icons.html";

  var iconsHtml = "";

  function isNavControl(el) {
    return (
      el.matches(".site-nav__cta") ||
      !!el.closest("nav.site-nav") ||
      !!el.closest("footer.site-nav")
    );
  }

  function variantFor(el) {
    if (el.classList.contains("landing-btn--outline")) return "outline";
    if (el.classList.contains("ghost")) return "ghost";
    if (el.classList.contains("landing-btn--primary")) {
      var style = el.getAttribute("style") || "";
      if (/accent/i.test(style)) return "accent";
      if (el.closest(".landing-hero")) return "light";
      return "accent";
    }
    if (el.classList.contains("primary")) return "accent";
    if (el.classList.contains("btn") && !el.classList.contains("ghost") && !el.classList.contains("primary")) {
      return "solid";
    }
    return "";
  }

  function enhance(el) {
    if (el.dataset.playfulEnhanced || isNavControl(el)) return;
    if (el.closest(".menu-card")) return;

    el.dataset.playfulEnhanced = "1";
    el.classList.add("btn-playful");

    var variant = variantFor(el);
    if (variant) el.classList.add("btn-playful--" + variant);

    var label = document.createElement("span");
    label.className = "btn-playful__label";
    while (el.firstChild) {
      label.appendChild(el.firstChild);
    }
    el.appendChild(label);

    var icons = document.createElement("template");
    icons.innerHTML = iconsHtml.trim();
    while (icons.content.firstChild) {
      el.appendChild(icons.content.firstChild);
    }

    el.removeAttribute("style");
  }

  function candidates() {
    var list = document.querySelectorAll(
      ".landing-btn, .btn.primary, button.btn.primary, .btn.ghost, .page-collection .activation .btn"
    );
    return Array.prototype.filter.call(list, function (el) {
      return !isNavControl(el) && !el.closest(".menu-card");
    });
  }

  function sameRow(a, b) {
    var overlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    return overlap > Math.min(a.height, b.height) * 0.45;
  }

  /** True when another playful button sits on the same row, to the left (e.g. grid cards). */
  function hasPlayfulButtonToLeft(btn) {
    var rect = btn.getBoundingClientRect();
    if (!rect.width) return false;

    var buttons = document.querySelectorAll(".btn-playful");
    for (var i = 0; i < buttons.length; i++) {
      var other = buttons[i];
      if (other === btn) continue;
      var o = other.getBoundingClientRect();
      if (!o.width) continue;
      if (!sameRow(rect, o)) continue;
      if (o.right <= rect.left + 6) return true;
    }
    return false;
  }

  function hideLeavesWhenPaired() {
    document.querySelectorAll(".btn-playful").forEach(function (btn) {
      btn.classList.toggle("btn-playful--no-leaves", hasPlayfulButtonToLeft(btn));
    });
  }

  function run() {
    candidates().forEach(enhance);
    requestAnimationFrame(function () {
      requestAnimationFrame(hideLeavesWhenPaired);
    });
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(hideLeavesWhenPaired, 150);
  });

  fetch(iconsUrl)
    .then(function (res) {
      if (!res.ok) throw new Error("icons fetch failed");
      return res.text();
    })
    .then(function (html) {
      iconsHtml = html;
      run();
    })
    .catch(function () {
      /* icons optional — buttons still get base playful styles */
      run();
    });
})();
