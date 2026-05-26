# Email & forms — Formspree → info@koshichhyang.com

The site uses **[Formspree](https://formspree.io)** (free tier: 50 submissions/month per form). Works on any static host (GitHub Pages, Netlify, etc.) — no host-specific form backend required.

## 1. Create two forms on Formspree

1. Sign up at [formspree.io](https://formspree.io).
2. **+ New form** → name it **Customer waiting list**.
   - **Settings → Email** → `info@koshichhyang.com`
   - Copy the form ID from the URL: `https://formspree.io/f/`**`abcxyz`** → `abcxyz`
3. Create a second form → **Business enquiry** (trade / suppliers).
   - Same notification email: `info@koshichhyang.com`
   - Copy its form ID.

## 2. Add IDs to the site

Edit **`assets/kc-forms-config.js`**:

```javascript
window.KC_FORMSPREE = {
  customerWaitlist: "YOUR_CUSTOMER_FORM_ID",
  businessEnquiry: "YOUR_BUSINESS_FORM_ID",
};
```

Commit, push, and redeploy (or refresh locally).

**Every page with a form** must load both scripts **in this order** (config before `kc-forms.js`):

```html
<script src="assets/kc-forms-config.js"></script>
<script src="assets/kc-forms.js"></script>
```

Without `kc-forms-config.js`, submits fall back to opening the visitor’s email app (`mailto:`).

## 3. What each form does

| Config key | Where it appears | Purpose |
|------------|------------------|---------|
| `customerWaitlist` | Home `#newsletter`, footer, stockists | Email signup for shop / launch |
| `businessEnquiry` | `business.html#enquire` | Trade, hospitality, supplier enquiries |

After submit, visitors are redirected to **`thank-you.html`**.

## 4. Fix: mail goes to the wrong inbox (e.g. Outlook instead of info@)

The HTML only sends data to Formspree. **Who receives email is chosen in the Formspree dashboard**, not in `kc-forms-config.js`.

1. Log in at [formspree.io](https://formspree.io) → open the form (e.g. **KoshiChhyang** / `xqejdrjv`).
2. **Settings** → **Email** (or **Notifications**).
3. Set the notification address to **`info@koshichhyang.com`** and remove or replace `rannegerodias@outlook.com`.
4. Confirm the verification email Formspree sends to **info@** (inbox must accept it).
5. Submit a test trade enquiry on the live site.

Until that setting is changed, every submission (waiting list + trade) will keep going to whatever address Formspree has on file.

**Waiting list:** `customerWaitlist` → `mdbzoyw` ([formspree.io/f/mbdbzoyw](https://formspree.io/f/mbdbzoyw)). **Trade:** `businessEnquiry` → `xykvneqj` ([formspree.io/f/xykvneqj](https://formspree.io/f/xykvneqj)). Confirm both have **info@koshichhyang.com** in Formspree **Settings → Email**.

## 5. Test

1. Open the live site → **Trade** → fill **Enquire** → submit.
2. Check Formspree **Submissions** and **info@koshichhyang.com**.

If IDs in `kc-forms-config.js` are still empty, submit opens a **mailto:** fallback to info@ (for local preview only).

## 6. Optional Formspree settings

- **Redirect** — handled by hidden `_next` (set automatically by `kc-forms.js`).
- **reCAPTCHA** — enable in Formspree dashboard if you get spam.
- **Custom subject** — already sent as `_subject` per form type.

## Hosting

Deploy as usual (`python scripts/build_deploy.py` → `dist/`). Formspree does not need Netlify Forms enabled.
