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

Legacy `/concepts/*` paths redirect via **`dist/_redirects`** (Netlify / Cloudflare Pages).

**Build deploy folder:**

```powershell
python scripts/optimize_images.py   # optional: re-compress JPGs (needs Pillow)
python scripts/build_deploy.py
```

Deploy excludes dev-only assets (import HTML, SVG placeholders, `load-photos.js`, duplicate `hero-splash.jpg`, local `.webp` copies).

Upload **`dist/`** to your static host. Entry URL: **`/`**

**Netlify (recommended):** Connect this repo at [app.netlify.com](https://app.netlify.com) → Import from GitHub → `RanneG/koshi-chhyang-site`. Build settings come from **`netlify.toml`** (`python scripts/build_deploy.py` → `dist/`). Or drag **`dist/`** onto Deploy manually after running the build locally.

**Forms:** Customer waiting list (home) and one combined trade/supplier enquiry form (`business.html`) submit via Netlify Forms to **info@koshichhyang.com** — see **`docs/EMAIL-FORMS.md`** for notification setup after deploy.

**What ships:** `index.html`, `heritage.html`, `collection.html`, `business.html`, `assets/`, `_redirects`.

Edit production HTML at the **repo root** (`index.html`, etc.). The `concepts/` folder holds redirects only for old bookmarks.

## Pages (development)

| File | Role |
|------|------|
| `dev/concepts-hub.html` | Internal design review (not deployed) |

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
