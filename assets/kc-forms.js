/**
 * Koshi Chhyang forms — Formspree (see kc-forms-config.js).
 * If IDs are empty, submit falls back to mailto: info@koshichhyang.com
 */
(function () {
  "use strict";

  var TO_EMAIL = "info@koshichhyang.com";
  var cfg = window.KC_FORMSPREE || {};

  function formId(key) {
    var id = (cfg[key] || "").trim();
    return id.replace(/^https?:\/\/formspree\.io\/f\//i, "").replace(/\/$/, "");
  }

  function thankYouUrl() {
    var path = "thank-you.html";
    if (window.location.protocol === "file:") return path;
    return window.location.origin + window.location.pathname.replace(/[^/]*$/, "") + path;
  }

  function formspreeAction(id) {
    return "https://formspree.io/f/" + id;
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
      if (!node.name || node.name.charAt(0) === "_" || node.type === "submit") return;
      if (node.name === "_gotcha") return;
      if (node.type === "radio" && !node.checked) return;
      if (node.type === "checkbox" && !node.checked) return;
      data[node.name] = (node.value || "").trim();
    });
    return data;
  }

  function mailtoSubject(formName) {
    if (formName === "customer-waitlist") return "Customer waiting list — Koshi Chhyang";
    if (formName === "business-enquiry") return "Trade & supplier enquiry — Koshi Chhyang";
    return "Website form — Koshi Chhyang";
  }

  function mailtoBody(formName, fields) {
    var lines = ["Form: " + formName, "—", ""];
    Object.keys(fields).forEach(function (key) {
      lines.push(key + ": " + fields[key]);
    });
    lines.push("", "Sent from: " + window.location.href);
    return lines.join("\n");
  }

  function openMailto(form) {
    var name = form.getAttribute("name") || "website-form";
    var fields = formFields(form);
    window.location.href =
      "mailto:" +
      TO_EMAIL +
      "?subject=" +
      encodeURIComponent(mailtoSubject(name)) +
      "&body=" +
      encodeURIComponent(mailtoBody(name, fields));
    showStatus(
      form,
      "Formspree is not configured yet — opening your email app. Or email " + TO_EMAIL + " directly.",
      true
    );
  }

  function ensureHidden(form, name, value) {
    var el = form.querySelector('input[name="' + name + '"]');
    if (!el) {
      el = document.createElement("input");
      el.type = "hidden";
      el.name = name;
      form.insertBefore(el, form.firstChild);
    }
    el.value = value;
  }

  function submitFormspree(form) {
    var btn = form.querySelector('[type="submit"]');
    var hp = form.querySelector('input[name="_gotcha"]');
    if (hp && hp.value) return;

    if (btn) {
      btn.disabled = true;
      if (!btn.dataset.kcLabel) btn.dataset.kcLabel = btn.textContent;
      btn.textContent = "Sending…";
    }
    showStatus(form, "Sending…", true);

    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (res.ok) {
            window.location.href = thankYouUrl();
            return;
          }
          var msg =
            (data && data.error) ||
            (data && data.errors && data.errors[0] && data.errors[0].message) ||
            "Could not send your message.";
          throw new Error(msg);
        });
      })
      .catch(function (err) {
        showStatus(
          form,
          (err && err.message ? err.message + " — " : "") +
            "Please try again or email " +
            TO_EMAIL +
            " directly.",
          false
        );
      })
      .finally(function () {
        if (btn) {
          btn.disabled = false;
          if (btn.dataset.kcLabel) btn.textContent = btn.dataset.kcLabel;
        }
      });
  }

  function wireFormspree(form, id, subject) {
    form.method = "POST";
    form.removeAttribute("data-netlify");
    form.removeAttribute("data-netlify-honeypot");
    form.action = formspreeAction(id);
    ensureHidden(form, "_next", thankYouUrl());
    if (subject) ensureHidden(form, "_subject", subject);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitFormspree(form);
    });
  }

  function wireForm(form) {
    if (!form || form.dataset.kcWired === "1") return;
    form.dataset.kcWired = "1";

    var kind = form.getAttribute("data-kc-form");
    var fsId =
      kind === "business"
        ? formId("businessEnquiry")
        : kind === "customer" || kind === "venue"
          ? formId("customerWaitlist")
          : "";

    if (fsId) {
      var subject =
        kind === "business"
          ? "Koshi Chhyang — trade enquiry"
          : kind === "venue"
            ? "Koshiyali Launch Tasting — venue address notification"
            : kind === "customer"
              ? "Koshi Chhyang — customer waiting list"
              : "";
      wireFormspree(form, fsId, subject);
      return;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      openMailto(form);
    });
  }

  function init() {
    document.querySelectorAll("form[data-kc-form]").forEach(wireForm);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
