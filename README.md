# Koshi Chhyang — Pre-launch site

Static HTML pre-launch site. Open in a browser:

```
index.html
```

Or double-click **`Open-Preview.bat`** and visit **http://localhost:8766/**

## Deploy

Production pages at the **site root** (clean URLs):

| URL | File |
|-----|------|
| `/` | `index.html` |
| `/heritage.html` | Heritage story + team |
| `/collection.html` | Collection preview |
| `/business.html` | Trade enquiries |

**Chosen design:** earth / teal split-screen at the site root (`assets/theme-site.css`). Older formats live under **`archive/`** (classic, concepts, dev previews, social/red palette experiments). Legacy `/concepts/*`, `/dev/*`, and `/legacy/*` URLs redirect via **`dist/_redirects`** (Netlify) or HTML stubs (GitHub Pages).

**Build deploy folder:**

```powershell
python scripts/optimize_images.py   # optional: re-compress JPGs (needs Pillow)
python scripts/build_deploy.py
```

Deploy excludes dev-only assets (import HTML, SVG placeholders, `load-photos.js`, duplicate `hero-splash.jpg`, local `.webp` copies).

**GitHub Pages (production):** Push to **`main`** — Actions runs `build_deploy.py` and publishes **`dist/`**. One-time: repo **Settings → Pages → Source: GitHub Actions**. Live URL (typical): **https://ranneg.github.io/koshi-chhyang-site/** — see **`docs/GITHUB-PAGES.md`**.

**Netlify (optional):** `netlify.toml` still works if you reconnect the repo; the old Netlify site may be paused on the free tier.

**Forms:** [Formspree](https://formspree.io) — customer waiting list + trade enquiry (`business.html`). Set form IDs in **`assets/kc-forms-config.js`**; notifications to **info@koshichhyang.com**. See **`docs/EMAIL-FORMS.md`**.

**What ships:** `index.html`, `heritage.html`, `collection.html`, `business.html`, `assets/`, redirect stubs, `.nojekyll`.

Edit production HTML at the **repo root** (`index.html`, etc.). See **`archive/README.md`** for retired layouts.

## Archive (not production)

| Path | Role |
|------|------|
| `archive/legacy/` | Classic four-page site |
| `archive/concepts/` | Early direction HTML |
| `archive/dev/` | Theme-preview snapshots |
| `archive/palettes/` | Social / earth palette toggles (`?palette=…`) |

Instagram: https://www.instagram.com/koshichhyang/

## Brand system (Wix-aligned)

Typography and colours match the live Wix site — see [docs/PRE-LAUNCH-NOTES.md](docs/PRE-LAUNCH-NOTES.md).

- **Display:** Lucy Rose Personal (Wix) — fallback Cormorant Garamond in [assets/brand.css](assets/brand.css)
- **Body:** Arial / Helvetica (system)
- Optional: add `assets/fonts/LucyRosePersonal-Regular.woff2` for an exact match

### Sync images from Wix

The public Wix URL may return **404** until the site is published. Use either path:

**A — Wix Media Manager (best match to her site)**

1. Download collection / hero images from Wix.
2. Place in `assets/wix-import/` using names from the manifest (e.g. `classic-chhyang.jpg`, `spiced-chhyang.jpg`, or `collection/classic-chhyang.jpg`).
3. `python scripts/sync_wix_assets.py`

**B — Auto-fetch when site is live**

```powershell
python scripts/fetch_wix_images.py
python scripts/sync_wix_assets.py
```

**C — Full-res @koshichhyang posts** (used when Wix is unpublished)

```powershell
python scripts/download_assets.py --from-urls
```

Uses full-size URLs in [assets/image-urls.txt](assets/image-urls.txt) (not 150×150 thumbs).

Manifest: [assets/wix-image-manifest.json](assets/wix-image-manifest.json)

Home landing hero uses **`hero-splash.jpg`** (lifestyle pour); **`hero.jpg`** from Wix/mockup sync is the UK-origin infographic — do not wire the splash to `hero.jpg`.

### Legacy mockup install

```powershell
python scripts/install_brand_photos.py
```

For **live Instagram** posts (community, new bottle shots), they override the mockup JPGs.

**Option A — manual URLs (recommended on Windows):** Open `assets/import-photos.html` in your browser, follow the steps, then in **normal** PowerShell (not Admin):

```powershell
cd C:\Users\ranne\.cursor\projects\empty-window\koshi-chhyang
.\scripts\Import-InstagramUrls.ps1
```

**Option B — automatic:** Close Edge, use **normal** PowerShell (Admin breaks cookie decryption):

```powershell
.\scripts\Sync-InstagramAssets.ps1
```
