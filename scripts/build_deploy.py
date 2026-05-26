"""Build a lightweight dist/ folder ready for static hosting."""
from __future__ import annotations

import os
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"

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

ASSET_SKIP = {
    "import-photos.html",
    "import-comments.html",
    "btn-playful-icons.html",
    "_shop.html",
    "wix-image-manifest.json",
    "team-wix-urls.json",
    "image-urls.txt",
    "community-comments-export.json",
    "load-photos.js",
    "hero-splash.jpg",
    "theme-preview-feed-sticky.js",
    "theme-preview-promise-swiper.js",
    "theme-preview-promise-swiper.css",
    "theme-preview-promise-stack.js",
    "palette-warm.js",
    "theme-palette-warm.css",
    "theme-palette-earth.css",
    "design-switcher.js",
    "design-switcher.css",
}

ASSET_SKIP_DIRS = {"wix-import"}

# Netlify _redirects format: /from /to 301 (to may be / or /page.html)
REDIRECTS = """# Legacy concept paths (bookmarks)
/concepts/index.html / 301
/concepts/direction-2-editorial-journey.html /heritage.html 301
/concepts/direction-3-terroir-collection.html /collection.html 301
/concepts/business.html /business.html 301
/concepts/direction-1-heritage-launch.html / 301

# Old theme-preview dev URLs
/dev/theme-preview.html / 301
/dev/theme-preview-collection.html /collection.html 301
/dev/theme-preview-heritage.html /heritage.html 301
/dev/theme-preview-business.html /business.html 301
/dev/theme-preview-visit.html /visit.html 301
/dev/theme-preview-events.html /events.html 301
/dev/theme-preview-guide.html /guide.html 301
/dev/theme-preview-stockists.html /stockists.html 301
/dev/theme-preview-index.html / 301

# Classic-site paths no longer published
/legacy/index.html / 301
/legacy/heritage.html /heritage.html 301
/legacy/collection.html /collection.html 301
/legacy/business.html /business.html 301
"""

REDIRECT_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="0; url={target}" />
  <link rel="canonical" href="{target}" />
  <title>Redirecting…</title>
</head>
<body>
  <p>Redirecting… <a href="{target}">Continue</a></p>
</body>
</html>
"""


def copy_tree(src: Path, dest: Path) -> None:
    if src.is_dir():
        if src.name in ASSET_SKIP_DIRS:
            return
        dest.mkdir(parents=True, exist_ok=True)
        for child in src.iterdir():
            copy_tree(child, dest / child.name)
        return
    if src.name in ASSET_SKIP:
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)


def parse_redirects() -> list[tuple[str, str]]:
    rules: list[tuple[str, str]] = []
    for line in REDIRECTS.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split()
        if len(parts) < 2:
            continue
        src, dest = parts[0], parts[1]
        if dest == "/":
            dest = "index.html"
        elif dest.startswith("/"):
            dest = dest.lstrip("/")
        rules.append((src.lstrip("/"), dest))
    return rules


def relative_href(from_rel: str, to_rel: str) -> str:
    """Relative URL from one dist HTML path to another."""
    from_dir = Path(from_rel).parent
    rel = os.path.relpath(to_rel, from_dir)
    return rel.replace("\\", "/")


def write_redirect_stubs() -> None:
    import os

    count = 0
    for src, dest in parse_redirects():
        target = relative_href(src, dest)
        out = DIST / src
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(
            REDIRECT_HTML.format(target=target),
            encoding="utf-8",
        )
        count += 1
        print(f"  redirect {src} -> {dest}")
    print(f"  {count} redirect stubs (GitHub Pages)")


def copy_page(rel: str) -> None:
    src = ROOT / rel
    if not src.is_file():
        print(f"  skip missing page: {rel}")
        return
    dest = DIST / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)
    print(f"  page {rel}")


def main() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()

    for rel in PAGES:
        copy_page(rel)

    assets_src = ROOT / "assets"
    assets_dest = DIST / "assets"
    for child in assets_src.iterdir():
        copy_tree(child, assets_dest / child.name)

    (DIST / "_redirects").write_text(REDIRECTS, encoding="utf-8")
    print("  _redirects")

    (DIST / ".nojekyll").touch()
    print("  .nojekyll")

    write_redirect_stubs()

    print(f"\nDone — deploy contents of: {DIST}")
    print("Entry URL: /")
    print("Design archive excluded from deploy.")


if __name__ == "__main__":
    main()
