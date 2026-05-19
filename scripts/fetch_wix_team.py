"""Download Heritage team portraits from Wix CDN URLs."""
from __future__ import annotations

import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
URLS = ROOT / "assets" / "team-wix-urls.json"
OUT = ROOT / "assets" / "images" / "team"


def download(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
    if len(data) < 1500:
        raise ValueError(f"download too small ({len(data)} bytes)")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    print(f"  {dest.name} ({len(data) // 1024} KB)")


def main() -> None:
    data = json.loads(URLS.read_text(encoding="utf-8"))
    ok = 0
    for member in data.get("members", []):
        url = member.get("src")
        file = member.get("file")
        if not url or not file:
            print(f"  skip {member.get('name', '?')} (no src)")
            continue
        try:
            download(url, OUT / file)
            ok += 1
        except Exception as exc:
            print(f"  fail {file}: {exc}")
    print(f"Done — {ok} portrait(s) in {OUT}")


if __name__ == "__main__":
    main()
