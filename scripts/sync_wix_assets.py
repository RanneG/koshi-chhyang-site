"""Copy images from assets/wix-import/ into assets/images/ per wix-image-manifest.json."""
from __future__ import annotations

import json
import shutil
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    Image = None  # type: ignore

if Image is not None:
    try:
        import pillow_avif  # noqa: F401
    except ImportError:
        import subprocess
        import sys

        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "pillow-avif-plugin", "-q"]
        )
        import pillow_avif  # noqa: F401

if Image is None:
    import subprocess
    import sys

    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow", "-q"])
    from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "assets" / "wix-image-manifest.json"


def save_jpg(src: Path, dest: Path, quality: int) -> None:
    img = Image.open(src).convert("RGB")
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "JPEG", quality=quality, optimize=True)
    print(f"  {dest} <- {src.name}")


def main() -> None:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    import_dir = ROOT / "assets" / data.get("import_dir", "wix-import")
    out_dir = ROOT / "assets" / "images"
    quality = int(data.get("quality", 92))
    slots: dict[str, str] = data["slots"]
    aliases: dict[str, list[str]] = data.get("aliases", {})
    exts = (".jpg", ".jpeg", ".png", ".webp", ".avif")

    if not import_dir.is_dir():
        import_dir.mkdir(parents=True)
        print(f"Created {import_dir}")
        print("Add Wix exports (hero.jpg, product-1.jpg, …) then run again.")
        return

    found = 0
    for dest_name, stem in slots.items():
        dest = out_dir / dest_name
        stems = [stem, *aliases.get(dest_name, [])]
        candidates: list[Path] = [import_dir / dest_name]
        for s in stems:
            for ext in exts:
                candidates.append(import_dir / f"{s}{ext}")
        src = next((p for p in candidates if p.is_file()), None)
        if not src:
            print(f"  skip {dest_name} (no file in wix-import)")
            continue
        save_jpg(src, dest, quality)
        found += 1

    if found == 0:
        print("No images copied. Place files in assets/wix-import/ (see manifest).")
    else:
        print(f"Done — {found} image(s). Refresh browser (Ctrl+F5).")


if __name__ == "__main__":
    main()
