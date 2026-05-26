# Community notes — real Instagram comments

The home carousel reads **`assets/community-notes.json`**. To use **real @koshichhyang comments** (not placeholders), export from Instagram while logged in, then merge.

## Quick path (recommended)

### A — Instaloader session (fastest repeat runs)

1. Install: `pip install instaloader`
2. Log in once (creates a session file in your home folder):
   ```powershell
   instaloader --login YOUR_IG_USERNAME
   ```
3. Copy the session file into this repo (create folder first):
   ```powershell
   mkdir .secrets
   copy "$env:USERPROFILE\.config\instaloader\session-YOUR_IG_USERNAME" .secrets\session-koshichhyang
   ```
   Or set **`IG_SESSIONID`** in the shell (Instagram cookie `sessionid` while logged in on instagram.com).

4. Fetch + merge:
   ```powershell
   python scripts/fetch_ig_community_comments.py
   python scripts/merge_community_comments.py
   python scripts/build_deploy.py
   git add assets/community-notes.json assets/images/community
   git commit -m "Update community notes from Instagram"
   git push origin main
   ```

### B — Browser snippet (no Python login)

1. Double-click **`Import-CommunityComments.bat`** (opens **`assets/import-comments.html`**).
2. On each @koshichhyang post (comments visible), F12 → Console → paste **Snippet C** → Enter.
3. Paste each JSON object into **`assets/community-comments-export.json`** as an array `[ {...}, {...} ]`.
4. Run:
   ```powershell
   python scripts/merge_community_comments.py
   ```

### C — Saved profile HTML

1. While logged into Instagram, open https://www.instagram.com/koshichhyang/ and save the page as **`ig_profile.html`** at the repo root (Ctrl+S → “Webpage, HTML only”).
2. ```powershell
   python scripts/fetch_ig_community_comments.py --from-html ig_profile.html
   python scripts/merge_community_comments.py
   ```

## Post keys (map comments to carousel images)

| `post` key   | Typical content        |
|-------------|-------------------------|
| `hero`      | Launch / UK intro       |
| `pour`      | Pour reel               |
| `brew`      | Fermentation reel       |
| `product-1` | Heritage / Gurkha       |
| `product-2` | Bottle / branding       |
| `product-3` | Landscape / terroir     |
| `event`     | Launch tasting          |

## Notes

- **`assets/community-comments-export.json`** is gitignored (scratch). **`assets/community-notes.json`** is what ships.
- Instagram blocks fully automated scraping without login — that’s expected.
- After merge, preview at http://localhost:8766/ (not `file://`) for the JSON fetch path; the carousel also has an offline fallback.
