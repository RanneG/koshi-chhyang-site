"""One-off: flatten earth palette to theme-site.css; update production HTML; fix archive paths."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"

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

ARCHIVE_LINK = (
    '  <p class="site-archive-link"><a href="archive/">Earlier design experiments</a></p>\n'
)


def flatten_earth_css(src: Path, dest: Path) -> None:
    text = src.read_text(encoding="utf-8")
    text = re.sub(
        r"/\*\*[\s\S]*?\*/\s*\n",
        "/**\n * Production site theme (earth / teal split-screen).\n */\n\n",
        text,
        count=1,
    )
    text = text.replace("html.page-theme-preview--earth ", "")
    text = text.replace("html.page-theme-preview--earth\n", "")
    text = text.replace("html.page-theme-preview--earth", "html")
    dest.write_text(text, encoding="utf-8")
    print(f"  wrote {dest.relative_to(ROOT)}")


def patch_production_html(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    orig = text

    text = re.sub(
        r'\s*<script src="assets/palette-warm\.js"></script>\s*\n',
        "\n",
        text,
    )
    if 'href="assets/theme-site.css"' not in text:
        text = text.replace(
            '<link rel="stylesheet" href="assets/theme-preview.css" />',
            '<link rel="stylesheet" href="assets/theme-preview.css" />\n'
            '  <link rel="stylesheet" href="assets/theme-site.css" />',
            1,
        )
    text = re.sub(
        r'\s*<link rel="stylesheet" href="assets/design-switcher\.css" />\s*\n',
        "\n",
        text,
    )
    text = re.sub(
        r'<p class="design-switcher" data-design-switcher>[\s\S]*?</p>\s*',
        ARCHIVE_LINK,
        text,
    )
    text = re.sub(
        r'\s*<script src="assets/design-switcher\.js"></script>\s*\n',
        "\n",
        text,
    )

    if text != orig:
        path.write_text(text, encoding="utf-8")
        print(f"  patched {path.relative_to(ROOT)}")


def patch_archive_legacy_paths(base: Path) -> None:
    for html in base.rglob("*.html"):
        text = html.read_text(encoding="utf-8")
        new = text.replace('href="../assets/', 'href="../../assets/')
        new = new.replace('src="../assets/', 'src="../../assets/')
        new = new.replace('href="../index.html', 'href="../../index.html')
        if new != text:
            html.write_text(new, encoding="utf-8")
            print(f"  archive paths {html.relative_to(ROOT)}")


def main() -> None:
    earth = ROOT / "archive" / "palettes" / "theme-palette-earth.css"
    if not earth.is_file():
        earth = ASSETS / "theme-palette-earth.css"
    if earth.is_file():
        flatten_earth_css(earth, ASSETS / "theme-site.css")
    for name in PAGES:
        p = ROOT / name
        if p.is_file():
            patch_production_html(p)
    legacy = ROOT / "archive" / "legacy"
    if legacy.is_dir():
        patch_archive_legacy_paths(legacy)
    dev = ROOT / "archive" / "dev"
    if dev.is_dir():
        for html in dev.rglob("*.html"):
            t = html.read_text(encoding="utf-8")
            n = t.replace('href="../assets/', 'href="../../assets/')
            n = n.replace('src="../assets/', 'src="../../assets/')
            n = n.replace('href="../index.html', 'href="../../index.html')
            if n != t:
                html.write_text(n, encoding="utf-8")
                print(f"  archive paths {html.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
