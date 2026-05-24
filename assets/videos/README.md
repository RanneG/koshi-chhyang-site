# Instagram reel videos (static site)

> **Deferred:** Theme preview uses **static images only** for the “From the feed” band and visit hero (`dev/theme-preview.html`, `dev/theme-preview-visit.html`). Keep this folder for when you are ready to export MP4s; wiring will return in a later pass.

Short **muted loop** clips for production home / visit pages (after sign-off). No Instagram API or server-side scraping at deploy time.

**Profile:** https://www.instagram.com/koshichhyang/

## 1. Export reels (owner / Ranne)

Use a method you are comfortable with and that respects Instagram’s terms and your rights to the footage:

| Method | Notes |
|--------|--------|
| **Instagram app** | Your own posts → share / save video where the app allows, or screen-record only if you own the content and accept quality limits. |
| **Creator Studio / Meta** | If the business account has download access for owned media, export from there. |
| **Desktop save** | Some teams use “Save video” browser extensions on **your** post page while logged in — same trust model as `assets/import-photos.html` (manual, no API key in repo). |

Do **not** commit third-party or licensed music tracks without clearance. Prefer clips you filmed or approved for the brand.

## 2. Drop files here

Copy exports into this folder with **fixed names** (theme preview expects these):

| File | Used on | Suggested content |
|------|---------|-------------------|
| `feed-01.mp4` | Home “From the feed” slot 1 | Pour / serve / glass |
| `feed-02.mp4` | Home slot 2 | Launch / table / event energy |
| `feed-03.mp4` | Home slot 3 | Product / bottle / batch |

Optional visit-page accent:

| File | Used on |
|------|---------|
| `visit-hero.mp4` | `dev/theme-preview-visit.html` (wide strip) |

Until files exist, pages show **poster images** from `assets/images/` (see HTML `poster=` attributes).

## 3. Encode for web (recommended)

Target **under ~3–8 MB** per clip for Netlify static hosting.

**ffmpeg** (install from https://ffmpeg.org/ or `winget install ffmpeg`):

```powershell
cd assets\videos
ffmpeg -i feed-01-source.mp4 -an -vf "scale=-2:720" -c:v libx264 -crf 28 -movflags +faststart feed-01.mp4
```

Repeat for `feed-02`, `feed-03`, `visit-hero`. `-an` strips audio (site uses `muted` anyway).

**WebM** (optional second source): same scale, `-c:v libvpx-vp9 -b:v 0 -crf 35 feed-01.webm` — only add if you update HTML `<source type="video/webm">`.

## 4. Wire-up checklist (when clips return)

1. Place `feed-01.mp4` … `feed-03.mp4` in `assets/videos/`.
2. Re-wire `<video>` on theme preview / production pages (currently **image-only** on `dev/theme-preview.html`).
3. After theme sign-off, mirror markup on `index.html` / `visit.html` (paths: `assets/videos/feed-01.mp4` from site root).
4. Run `python scripts/build_deploy.py` before deploy so `dist/` includes `assets/videos/`.

## 5. Instagram embed (alternative)

For a **single** post without hosting MP4, you can embed on a page (loads Instagram’s widget; less control over autoplay / palette):

```html
<blockquote class="instagram-media" data-instagram-permalink="https://www.instagram.com/p/POST_ID/" data-instagram-version="14"></blockquote>
<script async src="//www.instagram.com/embed.js"></script>
```

Prefer **self-hosted MP4** for hero loops and `prefers-reduced-motion` behaviour.

## 6. Git

`*.mp4` / `*.webm` / `*.mov` in this folder are gitignored so exports are not committed by mistake. Commit this README and `.gitkeep` only unless the owner explicitly wants a small licensed clip in the repo.
