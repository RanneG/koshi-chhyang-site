# Dev folder (local only)

Production pages live at the **repo root** (`index.html`, `collection.html`, etc.). This folder keeps the original preview filenames for reference; **Netlify does not deploy `dev/`**.

- Local preview: run **`Preview-Theme.bat`** from the repo root (serves `http://localhost:8767/`).
- Classic backup site: **`/legacy/`** (e.g. `http://localhost:8767/legacy/index.html`).
- Switch designs via the footer link on any page.

Old `/dev/theme-preview*.html` URLs redirect to root in production (`_redirects`).
