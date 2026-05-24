# Image slots (theme preview)

**Logo:** see [README-logo.md](README-logo.md). Placeholder SVG wordmarks (`koshi-logo.svg`, `koshi-logo-light.svg`) ship for theme preview until final brand files replace them at the same paths.

## Home (`dev/theme-preview.html`) — one file per major block

| Section | File |
|---------|------|
| Hero photo | `heritage-band.jpg` (CSS on `.preview-hero__photo`; no inline override) |
| Range / Book tour band | `event.jpg` (CSS on `.preview-range-hero`) |
| Community notes carousel | `hero.jpg`, `pour.jpg`, `brew.jpg`, `product-1.jpg`, `product-2.jpg`, `product-3.jpg`, `event.jpg` (via `assets/community-notes.json` → `posts.*.thumb`) |

Home **Community notes** band: horizontal infinite carousel (production `index.html` markup). Card copy and post thumbs load from **`assets/community-notes.json`** (`community-notes.js` + `community-carousel.js`). Import real comments with `Import-CommunityComments.bat` when ready.

| Visit page atmosphere (below hero) | `event.jpg` (CSS on `.preview-visit-atmosphere`; short decorative band, not `<img>`) |

Home **Visit** band is text-only (no image). **heritage-band.jpg** (`product-3`, grain-field) is the **home hero** only — not the Our story band.

**Our story preview** (`dev/theme-preview-heritage.html`): red-room band uses **`product-1.jpg`** (Heritage / Gurkha story, IG `561102938`) on `.preview-heritage-band__bg`. A dedicated soldier portrait export can replace it in `theme-preview-pages.css` when available.

## Lifestyle pool (`download_assets.py` / Instagram)

`hero.jpg`, `pour.jpg`, `product-1.jpg`, `product-2.jpg`, `product-3.jpg`, `brew.jpg`, `event.jpg`, `heritage-band.jpg` (derived from `product-3` when syncing URLs).

## Collection (Wix)

Nine product shots under `collection/*.jpg` — sync from `assets/wix-import/` via `scripts/sync_wix_assets.py` and `assets/wix-image-manifest.json`.

## Team

`team/avash-magar.jpg`, `team/awisha-magar.jpg` — founder portraits (feed tile F uses Avash).

## Captions source

- **Production target:** paste real Instagram captions into `dev/theme-preview.html` (or a future `assets/feed-captions.json` if the feed is wired dynamically).
- **Today:** placeholders aligned with themes in `assets/community-notes.json` (`posts.*.caption` are short labels only, not full IG copy).
