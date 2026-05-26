# Image slots (production)

**Canonical sources:** Instagram exports as **`.webp`** under this folder (paired **`.jpg`** files are fallbacks for older browsers). Do not regenerate `.webp` from `install_brand_photos.py` — that script only refreshes JPEG fallbacks from `assets/brand-photos/`.

## Slot map

| Slot | WebP (Instagram) | Used on |
|------|------------------|---------|
| `hero-splash.webp` | Home hero | `index.html` — `.preview-hero__photo` |
| `hero.webp` | Brand intro | Community carousel (`community-notes.json` → `hero`) |
| `product-1.webp` | Heritage / team story | `heritage.html` — `.preview-heritage-band__bg` |
| `heritage-band.webp` | Heritage atmosphere | `landing.css` bands |
| `event.webp` | Launch / bar | Visit atmosphere, range hero, carousel |
| `pour.webp`, `brew.webp`, `product-2.webp`, `product-3.webp` | Feed pool | Carousel + misc |
| `collection/limited-edition-chhyang.webp` | Shop hero product | `collection.html` spotlight |

## Refresh JPEG fallbacks (optional)

```bash
python scripts/install_brand_photos.py
```

## Team portraits

`team/awisha-magar.jpg` + `.webp`, `team/avash-magar.jpg` + `.webp` — from Wix via `python scripts/fetch_wix_team.py` (not `install_brand_photos.py`).

## Logo

See [README-logo.md](README-logo.md).
