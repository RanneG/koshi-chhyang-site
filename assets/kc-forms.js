/**
 * Koshi Chhyang forms — Netlify on deploy; mailto fallback for local preview.
 * Notifications: set Form notifications → info@koshichhyang.com in Netlify UI.
 */
(function () {
  "use strict";

  var TO_EMAIL = "info@koshichhyang.com";
  var THANK_YOU = "thank-you.html";

  function isLiveFormHost() {
    var h = window.location.hostname;
    return (
      h === "koshichhyang.com" ||
      h === "www.koshichhyang.com" ||
      /\.netlify\.app$/i.test(h)
    );
  }

  function statusEl(form) {
    var el = form.querySelector(".kc-form__status");
    if (!el) {
      el = document.createElement("p");
      el.className = "kc-form__status";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      el.hidden = true;
      form.appendChild(el);
    }
    return el;
  }

  function showStatus(form, message, ok) {
    var el = statusEl(form);
    el.textContent = message;
    el.dataset.state = ok ? "ok" : "err";
    el.hidden = false;
  }

  function formFields(form) {
    var data = {};
    Array.prototype.forEach.call(form.elements, function (node) {
      if (!node.name || node.name === "bot-field" || node.type === "submit") return;
      if (node.type === "radio" && !node.checked) return;
      if (node.type === "checkbox" && !node.checked) return;
      data[node.name] = (node.value || "").trim();
    });
    return data;
  }

  function mailtoBody(formName, fields) {
    var lines = ["Form: " + formName, "—", ""];
    Object.keys(fields).forEach(function (key) {
      if (key === "form-name") return;
      lines.push(key + ": " + fields[key]);
    });
    lines.push("", "Sent from: " + window.location.href);
    return lines.join("\n");
  }

  function mailtoSubject(formName) {
    if (formName === "customer-waitlist") return "Customer waiting list — Koshi Chhyang";
    if (formName === "business-enquiry") return "Trade & supplier enquiry — Koshi Chhyang";
    return "Website form — Koshi Chhyang";
  }

  function openMailto(form) {
    var name = form.getAttribute("name") || "website-form";
    var fields = formFields(form);
    var subject = encodeURIComponent(mailtoSubject(name));
    var body = encodeURIComponent(mailtoBody(name, fields));
    window.location.href =
      "mailto:" + TO_EMAIL + "?subject=" + subject + "&body=" + body;
    showStatus(
      form,
      "Opening your email app to send to " + TO_EMAIL + ". If nothing opens, email us directly.",
      true
    );
  }

  function wireForm(form) {
    if (!form || form.dataset.kcWired === "1") return;
    form.dataset.kcWired = "1";

    if (!form.querySelector('input[name="form-name"]') && form.getAttribute("name")) {
      var hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.name = "form-name";
      hidden.value = form.getAttribute("name");
      form.insertBefore(hidden, form.firstChild);
    }

    form.addEventListener("submit", function (e) {
      if (isLiveFormHost()) return;
      e.preventDefault();
      openMailto(form);
    });
  }

  function init() {
    document
      .querySelectorAll("form[data-netlify='true'], form[data-netlify]")
      .forEach(wireForm);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
