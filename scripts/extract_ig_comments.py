"""Extract post shortcodes and comment snippets from saved ig_profile.html."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "ig_profile.html"


def main() -> None:
    text = HTML.read_text(encoding="utf-8", errors="ignore")
    codes = list(dict.fromkeys(re.findall(r'"shortcode":"([A-Za-z0-9_-]+)"', text)))
    print("shortcodes", len(codes), codes[:15])

    for pat in (
        r'"text":"([^"]{8,240})"[^}]{0,240}"username":"([^"]+)"',
        r'"username":"([^"]+)"[^}]{0,400}"text":"([^"]{8,240})"',
    ):
        hits = re.findall(pat, text)
        print("pattern hits", len(hits))
        for row in hits[:20]:
            if pat.startswith('"text"'):
                print(f"  @{row[1]}: {row[0][:100]}")
            else:
                print(f"  @{row[0]}: {row[1][:100]}")

    # Try JSON script blobs
    for block in re.findall(r'<script type="application/json"[^>]*>(.*?)</script>', text, re.DOTALL):
        if "shortcode" not in block and "comment" not in block.lower():
            continue
        if len(block) > 500000:
            continue
        try:
            data = json.loads(block)
        except json.JSONDecodeError:
            continue
        blob = json.dumps(data)
        if "koshichhyang" in blob.lower() or "comment" in blob.lower():
            print("json blob size", len(blob))


if __name__ == "__main__":
    main()
