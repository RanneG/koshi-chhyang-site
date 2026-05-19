"""Copy Ranne's Koshi brand mockup images into assets/images/*.jpg."""
from __future__ import annotations

import shutil
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    import subprocess
    import sys

    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow", "-q"])
    from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "images"
SRC = Path(
    r"C:\Users\ranne\AppData\Roaming\Cursor\User\workspaceStorage\empty-window\images"
)

# hero.jpg = Wix UK-origin infographic; home hero uses hero-splash.jpg (from pour).
SOURCES = {
    "hero.jpg": "image-0fb40b06-7f3f-4c33-8e92-7936ffca057a.png",
    "brew.jpg": "image-0fb40b06-7f3f-4c33-8e92-7936ffca057a.png",
    "event.jpg": "image-9feff1de-8239-42fa-871a-78e71455a4dc.png",
    "product-1.jpg": "image-ac83c999-d9c6-4cad-a4ed-8cf9f23d7a98.png",
    "product-2.jpg": "image-0fb40b06-7f3f-4c33-8e92-7936ffca057a.png",
    "product-3.jpg": "image-3bd6ca8d-1a45-4891-9c05-f7c0a493e842.png",
}

# Crop: brass bowl + milky chhyang from preferred Canva card (middle-left, palette A)
BOWL_CROP = (0.28, 0.41, 0.46, 0.56)  # brass bowl + milky chhyang only


def save_jpg(src: Path, dest: Path, crop: tuple[float, float, float, float] | None = None) -> None:
    img = Image.open(src).convert("RGB")
    if crop:
        w, h = img.size
        box = (int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h))
        img = img.crop(box)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "JPEG", quality=92, optimize=True)
    print(f"  {dest.name} <- {src.name}" + (" (cropped)" if crop else ""))


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Source folder missing: {SRC}")

    ASSETS.mkdir(parents=True, exist_ok=True)
    canva = SRC / SOURCES["product-1.jpg"]

    for slot, filename in SOURCES.items():
        path = SRC / filename
        if not path.exists():
            raise SystemExit(f"Missing: {path}")
        dest = ASSETS / slot
        if slot == "product-1.jpg" and canva.exists():
            save_jpg(canva, dest, BOWL_CROP)
        else:
            save_jpg(path, dest)

    # Dedicated product hero: full lifestyle pour
    save_jpg(SRC / SOURCES["product-2.jpg"], ASSETS / "pour.jpg")
    shutil.copy2(ASSETS / "pour.jpg", ASSETS / "hero-splash.jpg")
    print("  hero-splash.jpg <- pour.jpg (home landing; not hero.jpg)")

    print("Done. Refresh concepts in browser (Ctrl+F5).")


if __name__ == "__main__":
    main()
