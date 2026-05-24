"""One-time: snapshot classic root pages to legacy/, promote dev previews to root."""
from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEGACY = ROOT / "legacy"
LEGACY_ASSETS = LEGACY / "assets"

CLASSIC_PAGES = ["index.html", "heritage.html", "collection.html", "business.html"]

CLASSIC_LOCAL_ASSETS = {
    "layout.css",
    "images.css",
    "page-loader.css",
    "page-loader.js",
    "landing.css",
    "landing.js",
    "btn-playful.css",
    "btn-playful.js",
    "family-card.css",
    "site-footer.css",
}

PROMOTE_MAP = [
    ("dev/theme-preview.html", "index.html"),
    ("dev/theme-preview-collection.html", "collection.html"),
    ("dev/theme-preview-heritage.html", "heritage.html"),
    ("dev/theme-preview-business.html", "business.html"),
    ("dev/theme-preview-visit.html", "visit.html"),
    ("dev/theme-preview-events.html", "events.html"),
    ("dev/theme-preview-guide.html", "guide.html"),
    ("dev/theme-preview-stockists.html", "stockists.html"),
]

URL_REPLACEMENTS = [
    ("theme-preview-stockists.html", "stockists.html"),
    ("theme-preview-collection.html", "collection.html"),
    ("theme-preview-heritage.html", "heritage.html"),
    ("theme-preview-business.html", "business.html"),
    ("theme-preview-events.html", "events.html"),
    ("theme-preview-visit.html", "visit.html"),
    ("theme-preview-guide.html", "guide.html"),
    ("theme-preview.html", "index.html"),
    ("theme-preview-index.html", "index.html"),
]

TITLE_REPLACEMENTS = [
    ("Theme preview (Direction C)", "Koshi Chhyang"),
    ("Theme preview —", "Koshi Chhyang —"),
    (" · Theme preview", ""),
]

DEV_FOOTER_PATTERNS = [
    re.compile(r"\s*<p class=\"preview-banner\">.*?</p>\s*", re.DOTALL),
    re.compile(r"\s*<p class=\"preview-compare[^\"]*\">.*?</p>\s*", re.DOTALL),
    re.compile(r"\s*<p class=\"preview-hub__meta\">.*?</p>\s*", re.DOTALL),
]


def rewrite_asset_path(path: str, *, legacy: bool) -> str:
    """assets/foo -> ../assets/foo or legacy/assets/foo for classic-only files."""
    if not path.startswith("assets/"):
        return path
    rest = path[7:]
    if legacy and rest.split("/")[0] in CLASSIC_LOCAL_ASSETS or rest in CLASSIC_LOCAL_ASSETS:
        return path
    if legacy:
        return "../" + path
    return path


def transform_classic_html(html: str) -> str:
    def sub_attr(match: re.Match[str]) -> str:
        prefix, path, suffix = match.group(1), match.group(2), match.group(3)
        return prefix + rewrite_asset_path(path, legacy=True) + suffix

    html = re.sub(
        r'(href|src)=(["\'])assets/([^"\']+)\2',
        lambda m: f'{m.group(1)}={m.group(2)}{rewrite_asset_path("assets/" + m.group(3), legacy=True)}{m.group(2)}',
        html,
    )
    html = html.replace('href="/"', 'href="index.html"')
    html = html.replace("href='/''", "href='index.html'")
    html = re.sub(r'data-nav="home"[^>]*href="[^"]*"', 'data-nav="home" href="index.html"', html, count=1)
    return html


def transform_preview_html(html: str) -> str:
    html = html.replace("../assets/", "assets/")
    html = html.replace("../docs/", "docs/")
    for old, new in URL_REPLACEMENTS:
        html = html.replace(old, new)
    for old, new in TITLE_REPLACEMENTS:
        html = html.replace(old, new)
    for pat in DEV_FOOTER_PATTERNS:
        html = pat.sub("\n", html)
    html = html.replace(
        'aria-label="Site (preview nav)"',
        'aria-label="Site"',
    )
    html = re.sub(
        r"<title>Koshi Chhyang — Koshi Chhyang",
        "<title>Koshi Chhyang",
        html,
    )
    return html


def copy_legacy_assets() -> None:
    LEGACY_ASSETS.mkdir(parents=True, exist_ok=True)
    for name in CLASSIC_LOCAL_ASSETS:
        if name == "site-footer.css":
            if (LEGACY_ASSETS / name).is_file():
                print(f"  legacy asset {name} (kept)")
            continue
        dest = LEGACY_ASSETS / name
        if name == "landing.css" and dest.is_file():
            print(f"  legacy asset {name} (kept)")
            continue
        src = ROOT / "assets" / name
        if not src.is_file():
            continue
        shutil.copy2(src, dest)
        if name == "landing.css":
            text = dest.read_text(encoding="utf-8")
            text = text.replace('url("images/', 'url("../../assets/images/')
            dest.write_text(text, encoding="utf-8")
        print(f"  legacy asset {name}")


def snapshot_legacy() -> None:
    LEGACY.mkdir(parents=True, exist_ok=True)
    copy_legacy_assets()
    for name in CLASSIC_PAGES:
        src = ROOT / name
        if not src.is_file():
            raise FileNotFoundError(src)
        html = transform_classic_html(src.read_text(encoding="utf-8"))
        (LEGACY / name).write_text(html, encoding="utf-8")
        print(f"  legacy/{name}")


def promote_previews() -> None:
    for src_rel, dest_name in PROMOTE_MAP:
        src = ROOT / src_rel
        if not src.is_file():
            raise FileNotFoundError(src)
        html = transform_preview_html(src.read_text(encoding="utf-8"))
        (ROOT / dest_name).write_text(html, encoding="utf-8")
        print(f"  {dest_name}")


SWITCHER_CSS_ROOT = '  <link rel="stylesheet" href="assets/design-switcher.css" />\n'
SWITCHER_CSS_LEGACY = '  <link rel="stylesheet" href="../assets/design-switcher.css" />\n'
SWITCHER_BLOCK_ROOT = """
  <p class="design-switcher" data-design-switcher>
    <a href="#" data-design-switch-target>View classic site</a>
  </p>
  <script src="assets/design-switcher.js"></script>
"""
SWITCHER_BLOCK_LEGACY = """
  <p class="design-switcher" data-design-switcher>
    <a href="#" data-design-switch-target>View new site</a>
  </p>
  <script src="../assets/design-switcher.js"></script>
"""


def inject_design_switcher(path: Path, *, legacy: bool) -> None:
    html = path.read_text(encoding="utf-8")
    if "data-design-switcher" in html:
        return
    css = SWITCHER_CSS_LEGACY if legacy else SWITCHER_CSS_ROOT
    block = SWITCHER_BLOCK_LEGACY if legacy else SWITCHER_BLOCK_ROOT
    if css.strip() not in html and "design-switcher.css" not in html:
        html = html.replace("</head>", css + "</head>", 1)
    html = re.sub(
        r"</body>\s*</html>\s*$",
        block.strip() + "\n</body>\n</html>\n",
        html,
        count=1,
        flags=re.IGNORECASE,
    )
    path.write_text(html, encoding="utf-8")
    print(f"  switcher {path.relative_to(ROOT)}")


def inject_all_switchers() -> None:
    for name in CLASSIC_PAGES:
        inject_design_switcher(LEGACY / name, legacy=True)
    for _, dest in PROMOTE_MAP:
        inject_design_switcher(ROOT / dest, legacy=False)


def main() -> None:
    print("Snapshot classic -> legacy/")
    snapshot_legacy()
    print("\nPromote previews -> root")
    promote_previews()
    print("\nInject design switcher")
    inject_all_switchers()
    print("\nDone. Run: python scripts/build_deploy.py")


if __name__ == "__main__":
    main()
