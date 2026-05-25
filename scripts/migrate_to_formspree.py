#!/usr/bin/env python3
"""Convert Netlify forms to Formspree (data-kc-form + shared scripts)."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PAGES = [
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

SCRIPTS = """  <script src="assets/kc-forms-config.js"></script>
  <script src="assets/kc-forms.js"></script>
"""

# Strip netlify registry block on index
REGISTRY_RE = re.compile(
    r"\s*<!-- Netlify form registry.*?</form>\s*</form>\s*",
    re.DOTALL,
)

CUSTOMER_FORM_RE = re.compile(
    r"<form[^>]*name=\"customer-waitlist\"[^>]*>.*?</form>",
    re.DOTALL,
)

def customer_form_replacement(match: re.Match) -> str:
    inner = match.group(0)
    # Preserve inputs/buttons, strip netlify attrs from opening tag
    opening = re.search(r"<form[^>]*>", inner)
    if not opening:
        return match.group(0)
    # Extract content between first > and last </form>
    content = inner[opening.end() : inner.rfind("</form>")]
    content = re.sub(r"<input[^>]*name=\"form-name\"[^>]*/>\s*", "", content)
    content = re.sub(r"<input[^>]*name=\"list\"[^>]*/>\s*", "", content)
    content = re.sub(
        r'<p class="kc-form__hp"[^>]*>.*?</p>\s*',
        '<input type="text" name="_gotcha" class="kc-form__hp" tabindex="-1" autocomplete="off" aria-hidden="true" />\n',
        content,
        flags=re.DOTALL,
    )
    if "_gotcha" not in content:
        content = (
            '          <input type="text" name="_gotcha" class="kc-form__hp" tabindex="-1" autocomplete="off" aria-hidden="true" />\n'
            + content
        )
    classes = "preview-newsletter kc-form"
    if "preview-newsletter--inline" in inner:
        classes = "preview-newsletter preview-newsletter--inline preview-newsletter--light kc-form"
    elif "preview-form" in inner:
        classes = "preview-form kc-form"
    return (
        f'<form class="{classes}" data-kc-form="customer" name="customer-waitlist" method="POST">\n'
        + content
        + "        </form>"
    )


def patch_business(text: str) -> str:
    text = re.sub(
        r'<form id="business-form"[^>]*>',
        '<form id="business-form" class="preview-form kc-form" data-kc-form="business" name="business-enquiry" method="POST">',
        text,
        count=1,
    )
    text = re.sub(r'\s*data-netlify="true"', "", text)
    text = re.sub(r'\s*data-netlify-honeypot="[^"]*"', "", text)
    text = re.sub(r'\s*action="thank-you\.html"', "", text)
    text = re.sub(r'<input type="hidden" name="form-name" value="business-enquiry" />\s*', "", text)
    text = re.sub(
        r'<p class="kc-form__hp"[^>]*>\s*<label>Don\'t fill this out: <input name="bot-field"[^>]*/></label>\s*</p>',
        '<input type="text" name="_gotcha" class="kc-form__hp" tabindex="-1" autocomplete="off" aria-hidden="true" />',
        text,
        count=1,
    )
    return text


def add_scripts(text: str) -> str:
    if "kc-forms-config.js" in text:
        return text
    if "design-switcher.js" in text:
        return text.replace(
            '  <script src="assets/design-switcher.js"></script>',
            SCRIPTS + '  <script src="assets/design-switcher.js"></script>',
            1,
        )
    return text.replace("</body>", SCRIPTS + "</body>", 1)


def add_css(text: str) -> str:
    if "kc-forms.css" in text:
        return text
    if "theme-preview.css" in text:
        return text.replace(
            '  <link rel="stylesheet" href="assets/theme-preview.css" />',
            '  <link rel="stylesheet" href="assets/theme-preview.css" />\n  <link rel="stylesheet" href="assets/kc-forms.css" />',
            1,
        )
    return text


def patch_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    orig = text

    if path.name == "index.html":
        text = REGISTRY_RE.sub("\n  ", text)

    if "customer-waitlist" in text:
        text = CUSTOMER_FORM_RE.sub(customer_form_replacement, text)

    if path.name == "business.html":
        text = patch_business(text)

    text = add_css(text)
    text = add_scripts(text)

    if text != orig:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for name in PAGES:
        p = ROOT / name
        if p.exists() and patch_file(p):
            changed.append(name)
    print("Migrated:", ", ".join(changed) if changed else "(none)")


if __name__ == "__main__":
    main()
