# Design archive

Alternate site formats kept for reference or a future project. **Production** is the earth / teal split-screen site at the repo root (`index.html` + `assets/theme-site.css`).

## Contents

| Path | What it is |
|------|------------|
| **`legacy/`** | Original four-page classic site (landing layout, playful buttons). |
| **`concepts/`** | Early three HTML directions + hub (mostly redirects). |
| **`dev/`** | Theme-preview HTML copies used during the red-room build. |
| **`palettes/`** | Opt-in palette loader (`palette-warm.js`) + **social/crimson** and **earth** CSS overrides. Use `?palette=social` or `?palette=earth` when previewing pages that still load the script. |
| **`design-switcher.js`** | Footer toggle between production and `legacy/` (archive paths). |
| **`Preview-*.bat`** | Local servers for old palette experiments (Windows). |

## Preview locally

From repo root:

```powershell
python -m http.server 8767
```

- Production: http://localhost:8767/
- Classic: http://localhost:8767/archive/legacy/
- Social palette (dev pages with script): add `?palette=social` on pages that include `archive/palettes/palette-warm.js`

Deployed URLs mirror this under `/archive/` on Netlify/GitHub Pages.
