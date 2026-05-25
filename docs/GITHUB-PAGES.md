# GitHub Pages hosting

The live site is deployed from **`dist/`** via GitHub Actions (`.github/workflows/deploy-pages.yml`).

## One-time setup (repo owner)

1. Open **https://github.com/RanneG/koshi-chhyang-site**
2. **Settings** → **Pages**
3. Under **Build and deployment**:
   - **Source:** GitHub Actions (not “Deploy from branch”)
4. Push to **`main`** — the workflow builds and deploys automatically.
5. After the first successful run, the site URL is shown on the Pages settings page, typically:
   - **https://ranneg.github.io/koshi-chhyang-site/**

## Custom domain (optional)

1. **Settings** → **Pages** → **Custom domain** → e.g. `koshichhyang.com`
2. At your domain registrar, add DNS records GitHub shows (usually `A` + `CNAME` for `www`).
3. Enable **Enforce HTTPS**.

Formspree redirect after submit uses your current site URL automatically (`thank-you.html` on the same host).

## Local build (same as CI)

```bash
python scripts/build_deploy.py
```

Output: `dist/` (includes `.nojekyll` and HTML redirect stubs for old `/concepts/*` and `/dev/*` URLs).

## Forms

Still **[Formspree](https://formspree.io)** — see **`docs/EMAIL-FORMS.md`**. IDs in **`assets/kc-forms-config.js`**.

## Netlify

`netlify.toml` and `dist/_redirects` remain for reference or a backup host; **GitHub Pages is the primary** deploy path.
