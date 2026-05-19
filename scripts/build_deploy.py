"""Build a lightweight dist/ folder ready for static hosting."""
from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"

PAGES = [
    "index.html",
    "heritage.html",
    "collection.html",
    "business.html",
]

ASSET_SKIP = {
    "import-photos.html",
    "import-comments.html",
    "_shop.html",
    "wix-image-manifest.json",
    "team-wix-urls.json",
    "image-urls.txt",
    "community-comments-export.json",
    "load-photos.js",
    "hero-splash.jpg",
}

ASSET_SKIP_DIRS = {"wix-import"}
ASSET_SKIP_SUFFIXES = {".svg", ".webp"}

REDIRECTS = """# Legacy concept paths (Netlify / Cloudflare Pages)
/concepts/index.html / 301
/concepts/direction-2-editorial-journey.html /heritage.html 301
/concepts/direction-3-terroir-collection.html /collection.html 301
/concepts/business.html /business.html 301
/concepts/direction-1-heritage-launch.html / 301
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
    if src.suffix.lower() in ASSET_SKIP_SUFFIXES:
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)


def main() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()

    for rel in PAGES:
        src = ROOT / rel
        if not src.is_file():
            print(f"  skip missing page: {rel}")
            continue
        shutil.copy2(src, DIST / rel)
        print(f"  page {rel}")

    assets_src = ROOT / "assets"
    assets_dest = DIST / "assets"
    for child in assets_src.iterdir():
        copy_tree(child, assets_dest / child.name)

    (DIST / "_redirects").write_text(REDIRECTS, encoding="utf-8")
    print("  _redirects (legacy /concepts/* paths)")

    print(f"\nDone — deploy contents of: {DIST}")
    print("Entry URL: /")


if __name__ == "__main__":
    main()
