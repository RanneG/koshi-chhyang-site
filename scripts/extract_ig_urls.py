"""Extract image URLs from saved Instagram profile HTML."""
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote

html_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / "ig_profile.html"
html = html_path.read_text(encoding="utf-8", errors="ignore")

urls: list[str] = []

# JSON embedded in script tags
for match in re.finditer(r'"display_url":"([^"]+)"', html):
    urls.append(unquote(match.group(1).encode().decode("unicode_escape")))

for match in re.finditer(r'"thumbnail_src":"([^"]+)"', html):
    urls.append(unquote(match.group(1).encode().decode("unicode_escape")))

for match in re.finditer(r'https://[^"\s]+cdninstagram\.com[^"\s\\]+', html):
    u = match.group(0)
    if "150x150" not in u and "profile" not in u.lower():
        urls.append(u)

# Dedupe preserving order
seen: set[str] = set()
unique: list[str] = []
for u in urls:
    if u not in seen:
        seen.add(u)
        unique.append(u)

print(json.dumps(unique[:20], indent=2))
