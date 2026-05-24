# Koshi Chhyang logo

Drop the brand logo here so theme preview and production pages can load it.

**Placeholder (dev):** `koshi-logo.svg` and `koshi-logo-light.svg` are simple text wordmarks until final brand assets land. Replace both files (and add `koshi-logo.png` if you need a raster fallback) without renaming paths referenced in `dev/theme-preview*.html`.

## Expected filenames

| File | Use |
|------|-----|
| `koshi-logo.svg` | Default / light backgrounds (footer, light nav) |
| `koshi-logo.png` | Raster alternative if you only have PNG |
| `koshi-logo-light.svg` | Light/white mark for **dark** nav (`--onyx` bar in theme preview) |

Prefer **SVG** when possible. PNG is fine at 2× resolution (e.g. 280×72 for a wide wordmark).

## Wix export

If the logo came from the old site, export from Wix Media Manager into `assets/wix-import/`, then copy/rename to one of the names above. `scripts/fetch_wix_images.py` does not pick logos automatically — name the file explicitly.

## After adding files

1. Hard-refresh the browser (`Ctrl+F5`).
2. Theme preview nav tries `koshi-logo-light.svg`, then `koshi-logo.svg`, then the text **Koshi Chhyang**.
3. Footer mark tries `koshi-logo.svg`, then the **KC** monogram fallback.

## Favicon

Theme preview `<head>` links `koshi-logo.svg` as `rel="icon"`. Browsers need a real file at that path.
