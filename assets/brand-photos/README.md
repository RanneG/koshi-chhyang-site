# Brand photography (Ranne)

Original PNG exports from tastings, bar shots, lifestyle sessions, and process stills (e.g. `fermented-rice-container.png` from the ferment reel).

## Install into the site

```bash
python3 scripts/install_brand_photos.py
python3 scripts/build_deploy.py
```

That writes optimised JPEGs to `assets/images/` per `assets/brand-photos-manifest.json` (hero, event band, shop range, etc.). **Team portraits** are separate: `python scripts/fetch_wix_team.py`.

## Add or swap a photo

1. Drop the file here (keep the filename or update the manifest).
2. Edit `assets/brand-photos-manifest.json` → `slots` entry.
3. Re-run `install_brand_photos.py`.

Files listed under `archive_in_sources` in the manifest are kept for reference but not wired to the site yet.
