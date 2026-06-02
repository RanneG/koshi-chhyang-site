"""Add kc-grainy-bg.css after theme-site.css on production pages."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = [
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
NEEDLE = '<link rel="stylesheet" href="assets/theme-site.css" />'
INSERT = NEEDLE + '\n  <link rel="stylesheet" href="assets/kc-grainy-bg.css" />'


def main() -> None:
    for name in PAGES:
        path = ROOT / name
        if not path.is_file():
            print(f"  skip missing: {name}")
            continue
        text = path.read_text(encoding="utf-8")
        if "kc-grainy-bg.css" in text:
            print(f"  unchanged: {name}")
            continue
        if NEEDLE not in text:
            print(f"  no theme-site: {name}")
            continue
        path.write_text(text.replace(NEEDLE, INSERT, 1), encoding="utf-8")
        print(f"  updated: {name}")


if __name__ == "__main__":
    main()
