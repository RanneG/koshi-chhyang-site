"""Install brand photography from assets/brand-photos/ into assets/images/."""
from __future__ import annotations

import json
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    import subprocess
    import sys

    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow", "-q"])
    from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "assets" / "brand-photos-manifest.json"
OUT = ROOT / "assets" / "images"


def parse_aspect(value: str) -> float:
    a, b = value.split(":")
    return int(a) / int(b)


def center_crop(img: Image.Image, target_ratio: float) -> Image.Image:
    w, h = img.size
    current = w / h
    if abs(current - target_ratio) < 0.02:
        return img
    if current > target_ratio:
        new_w = int(h * target_ratio)
        left = (w - new_w) // 2
        return img.crop((left, 0, left + new_w, h))
    new_h = int(w / target_ratio)
    top = (h - new_h) // 2
    return img.crop((0, top, w, top + new_h))


def fit_width(img: Image.Image, max_width: int) -> Image.Image:
    if img.width <= max_width:
        return img
    ratio = max_width / img.width
    size = (max_width, max(1, int(img.height * ratio)))
    return img.resize(size, Image.Resampling.LANCZOS)


def process_slot(src: Path, dest: Path, aspect: str, quality: int, max_width: int) -> None:
    img = Image.open(src).convert("RGB")
    img = center_crop(img, parse_aspect(aspect))
    img = fit_width(img, max_width)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "JPEG", quality=quality, optimize=True)
    print(f"  {dest.relative_to(ROOT)} <- {src.name} ({img.width}x{img.height})")


def main() -> None:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    src_dir = ROOT / "assets" / data.get("sources_dir", "brand-photos")
    quality = int(data.get("quality", 88))
    max_width = int(data.get("max_width", 1920))
    slots: dict = data["slots"]

    if not src_dir.is_dir():
        raise SystemExit(f"Missing {src_dir} — copy brand photos there first.")

    count = 0
    for dest_name, spec in slots.items():
        filename = spec["file"]
        src = src_dir / filename
        if not src.is_file():
            print(f"  skip {dest_name} (missing {filename})")
            continue
        dest = OUT / dest_name
        process_slot(src, dest, spec.get("aspect", "4:3"), quality, max_width)
        count += 1

    if count == 0:
        raise SystemExit("No images installed.")
    print(f"Done — {count} slot(s) in assets/images/. Hard-refresh the site (Cmd+Shift+R).")


if __name__ == "__main__":
    main()
