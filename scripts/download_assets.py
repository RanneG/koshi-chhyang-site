"""Download brand images into assets/images/*.jpg for concept pages.

Usage:
  python scripts/download_assets.py --from-urls
  python scripts/download_assets.py --from-instaloader

Instagram (logged in on Edge, normal PowerShell):
  .\\scripts\\Import-InstagramUrls.ps1
"""
from __future__ import annotations

import argparse
import shutil
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "images"
IG_DIR = ROOT / "assets" / "instagram"
URLS_FILE = ROOT / "assets" / "image-urls.txt"

# Slot order for generic fallback (first N URLs)
SLOTS = [
    "hero.jpg",
    "pour.jpg",
    "product-1.jpg",
    "product-2.jpg",
    "product-3.jpg",
    "brew.jpg",
    "event.jpg",
]

# Prefer these @koshichhyang post IDs when present in image-urls.txt
SLOT_HINTS: list[tuple[str, str]] = [
    ("hero.jpg", "509109336"),
    ("pour.jpg", "514470029"),
    ("product-1.jpg", "561102938"),
    ("product-2.jpg", "655996050"),
    ("product-3.jpg", "564908787"),
    ("brew.jpg", "688430214"),
    ("event.jpg", "505407617"),
    ("heritage-band.jpg", "564908787"),
]


def download_url(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
    if len(data) < 2000:
        raise ValueError(f"Download too small ({len(data)} bytes) — likely blocked or thumbnail")
    dest.write_bytes(data)
    print(f"  {dest.name} ({len(data) // 1024} KB)")


def _url_priority(url: str) -> int:
    u = url.lower()
    if "profile_pic" in u:
        return -100
    if "s150x150" in u:
        return -50
    if "ig_cache_key" in u:
        return 20
    if "dst-jpg_e35" in u or "dst-jpg_e15" in u:
        return 15
    if "/v/t51.75761-15/" in u or "/v/t51.82787-15/" in u:
        return 10
    return 0


def read_url_list() -> list[str]:
    if not URLS_FILE.exists():
        return []
    lines: list[str] = []
    for line in URLS_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        lines.append(line)
    lines.sort(key=_url_priority, reverse=True)
    seen: set[str] = set()
    unique: list[str] = []
    for u in lines:
        if u not in seen:
            seen.add(u)
            unique.append(u)
    return unique


def map_urls_to_slots(urls: list[str]) -> dict[str, str]:
    used: set[str] = set()
    out: dict[str, str] = {}

    for slot, hint in SLOT_HINTS:
        for u in urls:
            if hint in u and u not in used:
                out[slot] = u
                used.add(u)
                break

    for slot in SLOTS:
        if slot in out:
            continue
        for u in urls:
            if u not in used:
                out[slot] = u
                used.add(u)
                break

    return out


def from_instaloader() -> list[Path]:
    if not IG_DIR.exists():
        return []
    return sorted(
        [p for p in IG_DIR.rglob("*") if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}],
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )


def _refresh_hero_splash() -> None:
    """Home landing uses hero-splash.jpg; hero.jpg slot may be the Wix UK infographic."""
    pour = ASSETS / "pour.jpg"
    splash = ASSETS / "hero-splash.jpg"
    if pour.is_file():
        shutil.copy2(pour, splash)
        print(f"  {splash.name} <- pour.jpg (landing hero)")


def _refresh_heritage_band() -> None:
    """Heritage panel + home hero backdrop."""
    src = ASSETS / "product-3.jpg"
    if not src.is_file():
        src = ASSETS / "pour.jpg"
    band = ASSETS / "heritage-band.jpg"
    if src.is_file():
        shutil.copy2(src, band)
        print(f"  {band.name} <- {src.name}")


def map_slots(sources: list[Path]) -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    if not sources:
        print("No source images found.")
        return
    for i, slot in enumerate(SLOTS):
        src = sources[min(i, len(sources) - 1)]
        dest = ASSETS / slot
        shutil.copy2(src, dest)
        print(f"  {dest.name} <- {src.name}")
    _refresh_hero_splash()
    _refresh_heritage_band()


def from_urls(urls: list[str]) -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    mapping = map_urls_to_slots(urls)
    if not mapping:
        print("No URLs to download.")
        return
    print(f"Downloading {len(mapping)} image(s)...")
    for slot, url in mapping.items():
        download_url(url, ASSETS / slot)
    _refresh_hero_splash()
    _refresh_heritage_band()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--from-instaloader", action="store_true")
    parser.add_argument("--from-urls", action="store_true")
    args = parser.parse_args()

    if args.from_instaloader:
        sources = from_instaloader()
        if sources:
            print(f"Mapping {len(sources)} file(s) to {len(SLOTS)} slots:")
            map_slots(sources)
            return
        print("No files in assets/instagram. Run scripts/Sync-InstagramAssets.ps1 first.")
        return

    if args.from_urls:
        urls = read_url_list()
        if not urls:
            print(f"Add image URLs to {URLS_FILE} (one per line), then re-run.")
            return
        from_urls(urls)
        return

    print("Specify --from-urls or --from-instaloader. See script docstring.")


if __name__ == "__main__":
    main()
