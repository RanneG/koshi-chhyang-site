"""One-time migration: concepts/ -> root URLs. Root HTML is now canonical; concepts/ holds redirects only."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Historical map (concepts/ no longer contains full pages after first run)
MAP = [
    ("concepts/index.html", "index.html"),
    ("concepts/direction-2-editorial-journey.html", "heritage.html"),
    ("concepts/direction-3-terroir-collection.html", "collection.html"),
    ("concepts/business.html", "business.html"),
]

LEGACY = [
    ("concepts/index.html", "../index.html"),
    ("concepts/direction-2-editorial-journey.html", "../heritage.html"),
    ("concepts/direction-3-terroir-collection.html", "../collection.html"),
    ("concepts/business.html", "../business.html"),
    ("concepts/direction-1-heritage-launch.html", "../index.html"),
]


def transform(html: str) -> str:
    html = html.replace("../assets/", "assets/")
    html = html.replace("direction-2-editorial-journey.html", "heritage.html")
    html = html.replace("direction-3-terroir-collection.html", "collection.html")
    html = re.sub(r'href="index\.html"', 'href="/"', html)
    return html


def redirect_stub(target: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0; url={target}" />
  <link rel="canonical" href="{target}" />
  <title>Redirect</title>
</head>
<body>
  <p><a href="{target}">Continue</a></p>
</body>
</html>
"""


def main() -> None:
    for src_rel, dest_rel in MAP:
        src = ROOT / src_rel
        if not src.is_file():
            print(f"  skip missing: {src_rel}")
            continue
        html = src.read_text(encoding="utf-8")
        if "http-equiv" in html and "refresh" in html and len(html) < 500:
            print(f"  skip redirect stub: {src_rel}")
            continue
        (ROOT / dest_rel).write_text(transform(html), encoding="utf-8")
        print(f"  {dest_rel} <- {src_rel}")

    for src_rel, target in LEGACY:
        (ROOT / src_rel).write_text(redirect_stub(target), encoding="utf-8")
        print(f"  redirect {src_rel} -> {target}")


if __name__ == "__main__":
    main()
