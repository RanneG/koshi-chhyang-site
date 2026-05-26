"""Fetch @koshichhyang comments into community-comments-export.json (Instaloader).

Requires an Instagram login session (Instagram blocks anonymous comment access).

Setup (once):
  pip install instaloader
  instaloader --login YOUR_IG_USERNAME
  copy session file to .secrets/session-koshichhyang  (see docs/COMMUNITY-NOTES-IMPORT.md)

Run:
  python scripts/fetch_ig_community_comments.py
  python scripts/merge_community_comments.py
"""
from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPORT = ROOT / "assets" / "community-comments-export.json"
SECRETS = ROOT / ".secrets"
SESSION = SECRETS / "session-koshichhyang"

# Match import-comments.html post keys via CDN media id fragments in display_url
POST_HINTS: list[tuple[str, str]] = [
    ("hero", "509109336"),
    ("pour", "514470029"),
    ("product-1", "561102938"),
    ("product-2", "655996050"),
    ("product-3", "564908787"),
    ("brew", "688430214"),
    ("event", "505407617"),
]

PROFILE = "koshichhyang"
MAX_POSTS = 12
MAX_COMMENTS_PER_POST = 8


def default_instaloader_session(login_user: str) -> Path | None:
    """Windows: %LOCALAPPDATA%\\Instaloader\\session-<login_user>"""
    local = os.environ.get("LOCALAPPDATA", "")
    if not local:
        return None
    path = Path(local) / "Instaloader" / f"session-{login_user}"
    return path if path.is_file() else None


def resolve_login_user() -> str:
    return os.environ.get("IG_LOGIN", os.environ.get("INSTALOADER_LOGIN", "rannegerodias")).strip()


def resolve_session_path(login_user: str) -> Path | None:
    custom = os.environ.get("IG_SESSION_FILE", "").strip()
    if custom:
        p = Path(custom)
        return p if p.is_file() else None
    if SESSION.is_file():
        return SESSION
    return default_instaloader_session(login_user)


def post_key_from_url(url: str) -> str:
    for key, fragment in POST_HINTS:
        if fragment in (url or ""):
            return key
    return "pour"


def load_loader():
    try:
        import instaloader
    except ImportError as exc:
        raise SystemExit("Install instaloader: pip install instaloader") from exc

    loader = instaloader.Instaloader(
        download_pictures=False,
        download_videos=False,
        download_video_thumbnails=False,
        save_metadata=False,
        compress_json=False,
        max_connection_attempts=2,
    )

    sessionid = os.environ.get("IG_SESSIONID", "").strip()
    if sessionid:
        loader.context._session.cookies.set("sessionid", sessionid, domain=".instagram.com")
        return loader

    login_user = resolve_login_user()
    session_path = resolve_session_path(login_user)
    if session_path:
        loader.load_session_from_file(login_user, str(session_path))
        return loader

    raise SystemExit(
        "No Instagram session.\n"
        f"Log in: python -m instaloader --login {login_user}\n"
        f"Session file (Windows): %LOCALAPPDATA%\\Instaloader\\session-{login_user}\n"
        f"Or copy to: {SESSION}\n"
        "Or set IG_SESSIONID (browser cookie while logged into instagram.com).\n"
        "Manual export: assets/import-comments.html (docs/COMMUNITY-NOTES-IMPORT.md)."
    )


def fetch_blocks() -> list[dict]:
    loader = load_loader()
    import instaloader

    profile = instaloader.Profile.from_username(loader.context, PROFILE)
    blocks: list[dict] = []

    for i, post in enumerate(profile.get_posts()):
        if i >= MAX_POSTS:
            break
        if post.is_video:
            continue

        post_image = post.url or ""
        post_key = post_key_from_url(post_image)
        comments = []
        try:
            for j, comment in enumerate(post.get_comments()):
                if j >= MAX_COMMENTS_PER_POST:
                    break
                handle = (comment.owner.username or "").strip()
                text = (comment.text or "").strip()
                if not handle or not text or handle.lower() == PROFILE:
                    continue
                if len(text) < 3:
                    continue
                comments.append(
                    {
                        "handle": handle,
                        "name": comment.owner.full_name or handle,
                        "text": text,
                        "when": "on Instagram",
                    }
                )
        except Exception as exc:
            print(f"  comments unavailable for {post.shortcode}: {exc}")
            continue

        if not comments:
            continue

        blocks.append(
            {
                "post": post_key,
                "postImage": post_image,
                "shortcode": post.shortcode,
                "comments": comments,
            }
        )
        print(f"  {post.shortcode} -> {post_key}: {len(comments)} comment(s)")

    return blocks


def fetch_from_html(html_path: Path) -> list[dict]:
    text = html_path.read_text(encoding="utf-8", errors="ignore")
    blocks: list[dict] = []
    for block in re.findall(r'<script type="application/json"[^>]*>(.*?)</script>', text, re.DOTALL):
        if "shortcode" not in block or "edge_media_to_comment" not in block:
            continue
        if len(block) > 800000:
            continue
        try:
            data = json.loads(block)
        except json.JSONDecodeError:
            continue
        blob = json.dumps(data)
        if PROFILE not in blob.lower():
            continue
        # Best-effort: pull handle + text pairs
        pairs = re.findall(
            r'"username":"([^"]+)"[^}]{0,500}"text":"([^"]{3,400})"',
            blob,
        )
        if not pairs:
            continue
        shortcodes = re.findall(r'"shortcode":"([A-Za-z0-9_-]+)"', blob)
        post_image = ""
        imgs = re.findall(r"https://[^\"\\]+cdninstagram[^\"\\]+", blob)
        for u in sorted(imgs, key=len, reverse=True):
            if "150x150" not in u and "profile_pic" not in u:
                post_image = u.replace("\\u0026", "&")
                break
        post_key = post_key_from_url(post_image)
        comments = []
        seen = set()
        for handle, raw_text in pairs:
            if handle.lower() == PROFILE:
                continue
            text_clean = raw_text.encode().decode("unicode_escape")
            key = handle + text_clean[:40]
            if key in seen:
                continue
            seen.add(key)
            comments.append(
                {
                    "handle": handle,
                    "name": handle,
                    "text": text_clean,
                    "when": "on Instagram",
                }
            )
            if len(comments) >= MAX_COMMENTS_PER_POST:
                break
        if comments:
            blocks.append(
                {
                    "post": post_key,
                    "postImage": post_image,
                    "shortcode": shortcodes[0] if shortcodes else "",
                    "comments": comments,
                }
            )
    return blocks


def main() -> None:
    SECRETS.mkdir(parents=True, exist_ok=True)
    html_arg = None
    if len(sys.argv) > 1 and sys.argv[1] == "--from-html":
        html_arg = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "ig_profile.html"

    if html_arg:
        if not html_arg.is_file():
            raise SystemExit(f"Missing HTML dump: {html_arg}")
        print(f"Parsing saved HTML: {html_arg}")
        blocks = fetch_from_html(html_arg)
    else:
        print(f"Fetching comments from @{PROFILE}…")
        blocks = fetch_blocks()

    if not blocks:
        raise SystemExit("No comments collected. Use a logged-in session or save ig_profile.html.")

    EXPORT.write_text(json.dumps(blocks, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    total = sum(len(b.get("comments") or []) for b in blocks)
    print(f"Wrote {len(blocks)} post block(s), {total} comment(s) -> {EXPORT.relative_to(ROOT)}")
    print("Next: python scripts/merge_community_comments.py")


if __name__ == "__main__":
    main()
