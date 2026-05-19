"""Fetch high-res images from a published Wix site (static.wixstatic.com).

Usage:
  python scripts/fetch_wix_images.py
  python scripts/fetch_wix_images.py --url https://jingyikongwork.wixsite.com/koshi-chhyang

Writes to assets/wix-import/ then runs sync_wix_assets mapping.
"""
from __future__ import annotations

import argparse
import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMPORT_DIR = ROOT / "assets" / "wix-import"
MANIFEST = ROOT / "assets" / "wix-image-manifest.json"

WIX_MEDIA_RE = re.compile(
    r"https://static\.wixstatic\.com/media/[a-f0-9_~.-]+\.(?:jpg|jpeg|png|webp)(?:/[^\"'\s]*)?",
    re.I,
)


def fetch_html(url: str) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml",
        },
    )
    with urllib.request.urlopen(req, timeout=45) as resp:
        return resp.read().decode("utf-8", "replace")


def normalize_wix_url(url: str) -> str:
    """Prefer fill/w_1920,h_1920,al_c,q_90 style over tiny thumbs."""
    base = url.split("/v1/")[0].split("?")[0]
    if base.endswith((".jpg", ".jpeg", ".png", ".webp")):
        return f"{base}/v1/fill/w_1920,h_1920,al_c,q_92,usm_0.66_1.00_0.01/{base.rsplit('/', 1)[-1]}"
    return url


def download(url: str, dest: Path) -> bool:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = resp.read()
        if len(data) < 2000:
            return False
        dest.write_bytes(data)
        return True
    except Exception as exc:
        print(f"  fail {dest.name}: {exc}")
        return False


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--url",
        default="https://jingyikongwork.wixsite.com/koshi-chhyang",
        help="Published Wix site URL",
    )
    args = parser.parse_args()

    print(f"Fetching {args.url} ...")
    try:
        html = fetch_html(args.url)
    except Exception as exc:
        print(f"Could not fetch site: {exc}")
        print("Export images from Wix Media Manager into assets/wix-import/ manually.")
        return

    raw_urls = list(dict.fromkeys(WIX_MEDIA_RE.findall(html)))
    if not raw_urls:
        print("No static.wixstatic.com/media URLs found in page HTML.")
        print("Site may be unpublished (404) or password-protected.")
        return

    # Largest-first heuristic: longer URLs often include transform params; dedupe by media id
    by_id: dict[str, str] = {}
    for u in raw_urls:
        mid = u.split("/media/")[-1].split("/")[0].split("?")[0]
        if mid not in by_id or len(u) > len(by_id[mid]):
            by_id[mid] = u

    urls = [normalize_wix_url(u) for u in by_id.values()]
    urls.sort(key=len, reverse=True)
    print(f"Found {len(urls)} unique Wix media asset(s).")

    IMPORT_DIR.mkdir(parents=True, exist_ok=True)
    slots = list(json.loads(MANIFEST.read_text(encoding="utf-8"))["slots"].keys())

    ok = 0
    for i, slot in enumerate(slots):
        if i >= len(urls):
            break
        dest = IMPORT_DIR / slot
        hi = urls[i]
        print(f"  {slot} <- {hi[:80]}...")
        if download(hi, dest):
            ok += 1

    print(f"Downloaded {ok}/{min(len(slots), len(urls))} to {IMPORT_DIR}")
    if ok:
        print("Run: python scripts/sync_wix_assets.py")


if __name__ == "__main__":
    main()
