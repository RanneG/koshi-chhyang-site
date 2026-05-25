# Email & forms — info@koshichhyang.com

Static site forms use **Netlify Forms** (see `netlify.toml`). Submissions are stored in the Netlify dashboard and should be emailed to **info@koshichhyang.com**.

## Form names

| Form | Page(s) | Purpose |
|------|---------|---------|
| `customer-waitlist` | Home, footer, stockists | Customers waiting for shop / launch news |
| `business-enquiry` | Trade (`business.html#enquire`) | Trade, hospitality, suppliers, and partners — one combined enquiry / waiting-list form |

## Netlify setup (one-time)

1. Deploy the site from this repo (build → `dist/`).
2. Netlify → **Site configuration** → **Forms** — confirm `customer-waitlist` and `business-enquiry` appear after deploy.
3. **Form notifications** → Add notification → Email **info@koshichhyang.com** for each form (or one rule covering both).
4. Optional: enable spam filtering (honeypot field `bot-field` is already in each form).

## Local preview

On `localhost` or when opening HTML files directly, submit uses a **mailto:** fallback to `info@koshichhyang.com` via `assets/kc-forms.js`.

## Contact links

All visible contact addresses on production pages should use **info@koshichhyang.com**.
