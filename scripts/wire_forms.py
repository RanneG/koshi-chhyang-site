#!/usr/bin/env python3
"""Wire Netlify forms and info@ email across production HTML pages."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

CUSTOMER_FORM = """<form
          class="preview-newsletter kc-form"
          name="customer-waitlist"
          method="POST"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          action="thank-you.html"
        >
          <input type="hidden" name="form-name" value="customer-waitlist" />
          <input type="hidden" name="list" value="customer" />
          <p class="kc-form__hp" aria-hidden="true">
            <label>Don't fill this out: <input name="bot-field" tabindex="-1" autocomplete="off" /></label>
          </p>"""

CUSTOMER_FORM_FOOTER = CUSTOMER_FORM.replace(
    "preview-newsletter kc-form",
    "preview-newsletter kc-form",
)

OLD_NEWSLETTER_RE = re.compile(
    r'<form class="preview-newsletter[^"]*" action="#" method="get" onsubmit="alert\([^)]+\); return false;">',
    re.DOTALL,
)

OLD_NEWSLETTER_SIMPLE = re.compile(
    r'<form class="preview-newsletter" action="#" method="get" onsubmit="alert\([^)]+\); return false;">',
)

NETLIFY_REGISTRY = """
  <!-- Netlify form registry (build-time detection) -->
  <form name="customer-waitlist" method="POST" data-netlify="true" data-netlify-honeypot="bot-field" hidden>
    <input type="hidden" name="form-name" value="customer-waitlist" />
    <input name="bot-field" />
    <input name="email" type="email" />
    <input name="list" value="customer" />
  </form>
  <form name="business-enquiry" method="POST" data-netlify="true" data-netlify-honeypot="bot-field" hidden>
    <input type="hidden" name="form-name" value="business-enquiry" />
    <input name="bot-field" />
    <input name="name" />
    <input name="business" />
    <input name="type" />
    <input name="email" type="email" />
    <textarea name="message"></textarea>
  </form>
"""

KC_ASSETS_HEAD = '  <link rel="stylesheet" href="assets/kc-forms.css" />\n'
KC_ASSETS_SCRIPT = '  <script src="assets/kc-forms.js"></script>\n'


def patch_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    orig = text

    text = text.replace("hello@koshichhyang.com", "info@koshichhyang.com")
    text = text.replace("(TBC)", "")

    if "kc-forms.css" not in text and "theme-preview.css" in text:
        text = text.replace(
            '  <link rel="stylesheet" href="assets/theme-preview.css" />',
            '  <link rel="stylesheet" href="assets/theme-preview.css" />\n' + KC_ASSETS_HEAD,
            1,
        )

    if "kc-forms.js" not in text and "design-switcher.js" in text:
        text = text.replace(
            '  <script src="assets/design-switcher.js"></script>',
            KC_ASSETS_SCRIPT + '  <script src="assets/design-switcher.js"></script>',
            1,
        )
    elif "kc-forms.js" not in text and "</body>" in text and path.name != "thank-you.html":
        text = text.replace("</body>", KC_ASSETS_SCRIPT + "</body>", 1)

    def repl_form(m: re.Match) -> str:
        cls = m.group(0)
        if "preview-newsletter--inline" in cls or "preview-newsletter--light" in cls:
            return (
                '<form class="preview-newsletter preview-newsletter--inline '
                'preview-newsletter--light kc-form" name="customer-waitlist" '
                'method="POST" data-netlify="true" data-netlify-honeypot="bot-field" '
                'action="thank-you.html">'
                '\n          <input type="hidden" name="form-name" value="customer-waitlist" />'
                '\n          <input type="hidden" name="list" value="customer" />'
                '\n          <p class="kc-form__hp" aria-hidden="true">'
                '\n            <label>Don\'t fill this out: <input name="bot-field" tabindex="-1" autocomplete="off" /></label>'
                '\n          </p>'
            )
        return CUSTOMER_FORM

    text = OLD_NEWSLETTER_RE.sub(repl_form, text)
    text = OLD_NEWSLETTER_SIMPLE.sub(
        lambda _: CUSTOMER_FORM.replace("preview-newsletter kc-form", "preview-newsletter kc-form"),
        text,
    )

    if path.name == "index.html" and "Netlify form registry" not in text:
        text = text.replace("<body", NETLIFY_REGISTRY + "\n<body", 1)

    if path.name == "index.html":
        text = text.replace(
            "Get launch updates by email",
            "Join the customer waiting list",
        )
        text = text.replace(
            '<button type="submit" class="btn-preview btn-preview--red">Sign up</button>',
            '<button type="submit" class="btn-preview btn-preview--red">Join waiting list</button>',
            1,
        )

    if text != orig:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def patch_business() -> None:
    """Business page form is maintained in business.html (single enquire form)."""
    pass


def main() -> None:
    pages = [
        "index.html",
        "heritage.html",
        "collection.html",
        "how-to-order.html",
        "how-to-drink.html",
        "how-to-store.html",
        "business.html",
        "visit.html",
        "events.html",
        "guide.html",
        "stockists.html",
        "thank-you.html",
    ]
    patch_business()
    changed = []
    for name in pages:
        p = ROOT / name
        if p.exists() and patch_file(p):
            changed.append(name)
    print("Updated:", ", ".join(changed) if changed else "(none)")


if __name__ == "__main__":
    main()
