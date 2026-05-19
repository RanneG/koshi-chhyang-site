"""Compress JPG/PNG under assets/images for lighter deploy (requires Pillow)."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "assets" / "images"
MAX_EDGE = 1920
JPEG_QUALITY = 82
WEBP_QUALITY = 80


def main() -> None:
    try:
        from PIL import Image
    except ImportError:
        print("Install Pillow: pip install Pillow")
        sys.exit(1)

    if not IMAGES.is_dir():
        print(f"Missing {IMAGES}")
        sys.exit(1)

    saved = 0
    for path in sorted(IMAGES.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
            continue

        before = path.stat().st_size
        img = Image.open(path)
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")

        w, h = img.size
        if max(w, h) > MAX_EDGE:
            scale = MAX_EDGE / max(w, h)
            img = img.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)

        if path.suffix.lower() in {".jpg", ".jpeg"}:
            img.save(path, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        else:
            img.save(path, "PNG", optimize=True)

        webp_path = path.with_suffix(".webp")
        img.save(webp_path, "WEBP", quality=WEBP_QUALITY, method=6)

        after = path.stat().st_size
        saved += before - after
        webp_kb = webp_path.stat().st_size / 1024
        print(f"  {path.relative_to(ROOT)}  {before // 1024}KB -> {after // 1024}KB  (+webp {webp_kb:.0f}KB)")

    print(f"\nSaved ~{saved // 1024}KB on JPEG/PNG sources. WebP siblings added for optional <picture> use.")


if __name__ == "__main__":
    main()
