"""Merge browser-exported IG comments into assets/community-notes.json."""
from __future__ import annotations

import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NOTES = ROOT / "assets" / "community-notes.json"
EXPORT = ROOT / "assets" / "community-comments-export.json"
COMMUNITY_DIR = ROOT / "assets" / "images" / "community"


def download_post_image(url: str, post_key: str) -> str | None:
    if not url or "cdninstagram" not in url and "fbcdn.net" not in url:
        return None
    COMMUNITY_DIR.mkdir(parents=True, exist_ok=True)
    dest = COMMUNITY_DIR / f"{post_key}.jpg"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
    if len(data) < 2000:
        return None
    dest.write_bytes(data)
    rel = f"community/{post_key}.jpg"
    print(f"  saved post thumb {rel} ({len(data) // 1024} KB)")
    return rel


def main() -> None:
    if not EXPORT.is_file():
        raise SystemExit(
            f"Missing {EXPORT.name}. Export comments via assets/import-comments.html first."
        )

    data = json.loads(NOTES.read_text(encoding="utf-8"))
    exports = json.loads(EXPORT.read_text(encoding="utf-8"))
    if isinstance(exports, dict):
        exports = [exports]

    posts = data.get("posts") or {}
    merged: list[dict] = []

    for block in exports:
        post_key = block.get("post", "")
        if post_key not in posts:
            print(f"skip unknown post key: {post_key!r}")
            continue

        post_image = block.get("postImage") or ""
        if post_image:
            try:
                rel = download_post_image(post_image, post_key)
                if rel:
                    posts[post_key]["thumb"] = rel
            except Exception as exc:
                print(f"  post image download failed for {post_key}: {exc}")

        for c in block.get("comments") or []:
            handle = str(c.get("handle", "")).lstrip("@").strip()
            text = str(c.get("text", "")).strip()
            if not handle or not text:
                continue
            merged.append(
                {
                    "handle": handle,
                    "name": c.get("name") or handle,
                    "post": post_key,
                    "text": text,
                    "when": c.get("when") or "on Instagram",
                }
            )

    if not merged:
        raise SystemExit("No comments merged — check export JSON shape.")

    data["posts"] = posts
    data["comments"] = merged
    data["note"] = (
        "Updated from community-comments-export.json via merge_community_comments.py"
    )
    NOTES.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(merged)} comment(s) to {NOTES}")


if __name__ == "__main__":
    main()
