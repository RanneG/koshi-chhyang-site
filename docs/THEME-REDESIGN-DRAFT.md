# Koshi Chhyang — theme & content redesign (draft)

**Status:** Draft for review with brand owner (Awisha). Not implemented on the live site yet.  
**Live site:** https://ranneg.github.io/koshi-chhyang-site/ (GitHub Pages; Netlify backup may be paused)  
**References:** Owner mood board (retro hospitality / poster collage) · [Hana Makgeolli](https://www.hanamakgeolli.com/) (craft drinks site structure) · Current Wix-aligned tokens in `assets/brand.css`

---

## 1. One decision to make first

| Direction | Look & feel | Best if… |
|-----------|-------------|----------|
| **A — Poster / night-out** (mood board) | Cream + **bold red** + black, cobalt panels, heavy sans headlines, script accents, social dining photos | Launch is marketed as a **party, invitation, Folkestone night**; Instagram-led, youthful hospitality |
| **B — Heritage craft** (current site) | Slate blue + cream + gold, Cormorant serif, editorial chapters | Brand leads with **Himalayan story & premium craft**; events support the product |
| **C — Hybrid** (recommended to discuss) | Cream base + **red for CTAs/events only**; keep serif for story pages; sans for nav/shop; Hana-style **section structure** | Keep heritage credibility while feeling **warmer and more “join us”** |

Until A/B/C is chosen, treat the tokens below as **Direction A/C** proposals, not final production values.

---

## 2. Colour — current vs proposed

### Current (production)

| Token | Hex | Use |
|-------|-----|-----|
| `--primary` | `#5e718b` | Nav, links, headings |
| `--primary-b` | `#55737a` | Heritage variant |
| `--cream` | `#f0ede5` | Page background |
| `--accent` | `#c78f57` | Highlights, hover |
| `--text` | `#2c2c2a` | Body |

### Owner palette — red room (in theme preview)

| Token | Hex | Use in preview |
|-------|-----|----------------|
| `--onyx` | `#0b090a` | Nav, body text |
| `--carbon-black` | `#161a1d` | Guide / dark band |
| `--dark-garnet` | `#660708` | Deep red, cards on dark band, footer rule |
| `--mahogany-red` | `#a4161a` | Primary red, borders, sitemap chips |
| `--mahogany-red-2` | `#ba181b` | Mid gradient, buttons |
| `--strawberry-red` | `#e5383b` | Marquee, CTA hover, accents |
| `--silver` | `#b1a7a6` | Muted labels on dark |
| `--dust-grey` | `#d3d3d3` | Community band (breathing room) |
| `--white-smoke` | `#f5f3f4` | Cream sections, footer |
| `--white` | `#ffffff` | Type on red, button fills |

See `assets/theme-preview.css` + `assets/theme-preview-pages.css` on:

| Page | Preview URL | Production compare |
|------|-------------|-------------------|
| Hub | http://localhost:8767/dev/theme-preview-index.html | — |
| Home | http://localhost:8767/dev/theme-preview.html | `index.html` |
| Our story | http://localhost:8767/dev/theme-preview-heritage.html | `heritage.html` |
| Shop | http://localhost:8767/dev/theme-preview-collection.html | `collection.html` |
| Visit | http://localhost:8767/dev/theme-preview-visit.html | `index.html#event` |
| Guide | http://localhost:8767/dev/theme-preview-guide.html | *(new)* |
| Events | http://localhost:8767/dev/theme-preview-events.html | *(new)* |
| Where to buy | http://localhost:8767/dev/theme-preview-stockists.html | *(new)* |
| Trade | http://localhost:8767/dev/theme-preview-business.html | `business.html` |

### Earlier draft (superseded in preview by owner palette)

| Token | Hex (draft) | Use |
|-------|-------------|-----|
| `--cream` | `#f4f0e6` | Base (slightly warmer paper) |
| `--ink` | `#1a1a1a` | Headlines, outlines, line art |
| `--red` | `#c41e2a` | Hero blocks, primary buttons, poster panels |

**Migration map (when implementing):**

| Old | New (hybrid C) |
|-----|----------------|
| `--primary` on nav | `--ink` or `--cobalt` (nav bar); avoid slate on cream hero |
| `--accent` CTAs | `--red` for launch/RSVP; gold only on heritage |
| `--text` | `--ink` |
| Heritage `--primary-b` | Keep or shift to `--cobalt` for one chapter band |

### Draft CSS variables (paste into `brand.css` when approved)

```css
:root {
  /* Poster palette (draft) */
  --cream: #f4f0e6;
  --ink: #1a1a1a;
  --red: #c41e2a;
  --red-dark: #9e1822;
  --cobalt: #1e3a5f;
  --white: #faf9f6;
  --muted: #5c5c58;

  /* Legacy aliases — remove after full migration */
  --primary: var(--cobalt);
  --accent: var(--red);
  --text: var(--ink);
  --site-nav-bg: var(--ink);
  --site-nav-active: var(--cream);
}
```

---

## 3. Typography — current vs proposed

### Current

| Role | Stack |
|------|--------|
| Display | Lucy Rose Personal → **Cormorant Garamond** |
| Body / UI | **Arial**, uppercase eyebrows |

### Proposed (Direction A or C)

| Role | Draft stack | Mood board / Hana fit |
|------|-------------|------------------------|
| **Poster headline** | **Bebas Neue** or **Oswald** (600) — Google Fonts | All-caps event titles, marquee |
| **Editorial** | **Cormorant Garamond** (keep) | Story, heritage, long copy |
| **UI / body** | **DM Sans** or **Outfit** (400, 500, 600) | Hana-like clarity; replace Arial |
| **Warm accent** | **Caveat** or **Pacifico** (sparingly) | “Your table is ready”, RSVP sublines |

**Rules of thumb**

- One **shouty** face (Bebas/Oswald) per viewport — hero + section labels only.
- Script **never** for body paragraphs or legal text.
- Marquee / promo strip: poster sans, not Cormorant.

**Draft Google Fonts link (when implementing):**

```
family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;600&family=Caveat:wght@400
```

---

## 4. Visual language

| Element | Mood board | Add to Koshi |
|---------|------------|--------------|
| **Layouts** | Poster blocks, red/cream/blue bands | Home: 2–3 **colour-block** sections (not only photo hero) |
| **Line art** | Red/white hands, bottles, glasses | SVG icons for “RSVP”, “Tasting”, “Follow” — optional illustration set |
| **Photography** | Candid tables, pours, low-light warmth | Brief owner: shoot or license **social dining**; complement product shots |
| **Texture** | Paper grain, aged cream | Subtle CSS noise or background texture on cream sections (performance-light) |
| **Motion** | Static posters | Keep countdown + community marquee; add **promo ticker** only if copy exists |

**Keep from current site:** heritage chapter structure, collection “Choose your pour”, community notes marquee, mobile nav drawer.

---

## 5. Content — gap analysis vs Hana Makgeolli

Hana models a **mature drinks brand** (shop + visit + club + discover). Koshi pre-launch is **launch-first** — gaps are expected; this table marks what to **add when**.

| Hana section | Koshi today | Phase |
|--------------|-------------|-------|
| Shop + promos (shipping marquee) | Collection preview only | **Post-launch** — shop + honest shipping line |
| Visit / Tasting Room + Resy | Single launch event (18 Jul 2026) | **Pre-launch:** strengthen event block · **Post-launch:** Visit page + hours |
| Private events / tours | Mention in event copy | **Phase 2** — `events.html` or section on Visit |
| Membership club | — | **Later** — only if product cadence supports it |
| Where to buy / store locator | — | **Post-launch** — stockists map or list |
| Sool / product guide | Stats on heritage | **Phase 1b** — “Guide to chhyang” (serve temp, pairings, ABV) |
| Newsletter | RSVP anchors only | **Phase 1** — footer signup (Mailchimp / Formspree) |
| Instagram | Link + community notes | **Keep** — strongest social proof on site |
| About / Our story | `heritage.html` | **Keep** — maybe rename nav to “Our story” |
| Events calendar | One date | **Pre-launch:** launch only · **Later:** list |
| Press / FAQ | — | **Phase 2** — footer links |
| Footer: address, hours, legal | Minimal footer tabs | **Phase 1** — contact block + Privacy/Terms placeholders |
| Trade / wholesale | `business.html` | **Keep** |

---

## 6. Proposed information architecture

### Nav (pre-launch — Direction C hybrid)

**Top bar (theme preview, May 2026):** `Home` · `Our story` · `Shop` · `Visit` · `Trade` + **RSVP** pill. No Instagram in the bar — footer only.

**Mobile drawer “More”:** Guide · Events · Where to buy · Community (`#community` on home). Secondary pages also linked from footer and home explore text row.

| Label | Target | Notes |
|-------|--------|-------|
| Home | `/` | Hero + range + visit + newsletter + explore |
| Our story | `heritage.html` | Optional rename from “Heritage” |
| Shop | `collection.html` | Preview / notify |
| Visit | `visit.html` or `/#visit` | Launch + offers inline (notify, RSVP, stockists) |
| Trade | `business.html` | B2B |
| **RSVP** (CTA) | `#rsvp` or visit page | Keep prominent |
| Guide / Events / Stockists / Community | drawer + footer + home “Also” links | Not in primary bar |

### Nav (post-launch — Hana-aligned)

`Home` · `Shop` · `Visit` · `Our story` · **More** (Events, Where to buy, Guide) · `Trade` · Cart icon · Instagram in footer

### New pages / sections (draft)

| Slug | Purpose | Priority |
|------|---------|----------|
| `visit.html` | Launch + future tasting room, hours, map, book link | P1 after owner confirms venue |
| `guide.html` | How we brew, how to serve, food pairings | P1b |
| `events.html` | Calendar beyond launch | P2 |
| `stockists.html` | Where to buy | Post-launch |
| Footer newsletter | Email capture | P1 |

---

## 7. Page-by-page change sketch

### `index.html` (home)

| Block | Now | Draft change |
|-------|-----|--------------|
| Hero | Photo + serif headline | Option: **red or cobalt band** + bold sans headline; script subline for date |
| Promo | — | Thin **marquee** (“Launch 18 July · Folkestone · Limited seats”) |
| Countdown | Yes | Keep; restyle units in `--red` / `--ink` |
| Event | Cream section | **Invitation** layout — line art, “Be our guest” tone |
| Community | IG notes | Keep; optional warmer card borders (red accent) |
| Footer | Tab nav only | Add **email signup** + one-line contact |

**Theme preview home (`dev/theme-preview.html`) — Hana-style order (May 2026):**

1. Hero + brand promise (“Patiently fermented” + honest pre-launch note)
2. Craft stats band (0 sugar · 5–7% ABV · 14+ days · 9 expressions)
3. Range overview (3 category cards + link to shop preview — no cart)
4. Visit band (smoke — launch details + inline notify / RSVP / stockists / trade links)
5. Newsletter band (garnet gradient)
6. Explore — **4 primary cards** (Our story · Shop · Visit · Trade) + “Also” text links (Guide · Events · Where to buy · Community)
7. **From the feed** (single motion band)
8. Community notes (compact band)
9. RSVP CTA band (single primary action; notify as text link)
10. Footer (Instagram + secondary pages)

### `heritage.html`

- Keep editorial flow; optional **cobalt** chapter instead of slate `theme-heritage`.
- Family section: keep photos; align card borders to new tokens.

### `collection.html`

- Product cards: red **Notify at launch** buttons; sans category labels.
- Stat row: keep (0 sugar, ABV, ferment) — strong vs Hana’s “naturally fermented” band.

### `business.html`

- Minimal palette shift; don’t poster-ify B2B page.

---

## 8. Implementation phases (dev)

| Phase | Scope | Effort (rough) |
|-------|--------|----------------|
| **0** | Owner picks A / B / C; sign off hex values + 1 headline font | Meeting |
| **1a** | `brand.css` tokens + nav/footer colours + button variants | Small |
| **1b** | Google Fonts swap; eyebrow/label styles | Small |
| **1c** | Home hero + event block poster layout | Medium |
| **2** | `visit.html` stub, footer newsletter, contact block | Medium |
| **3** | `guide.html`, line-art assets, grain texture | Medium |
| **4** | Post-launch shop, stockists, events, legal | Large (out of static preview) |

**Local preview:** double-click **`Preview-Theme.bat`** or run `python -m http.server 8767` from repo root. Opens home preview; use the **Theme preview — all pages** hub on home, **theme-preview-index.html**, or each page’s footer compare strip. Full URL list in §2 table and `dev/README.md`.

### Motion / feed (Instagram — static, no API)

| Approach | Where | Notes |
|----------|--------|--------|
| **Static gallery (now)** | `dev/theme-preview.html` “From the feed” | Four `<img>` slots: `pour.jpg`, `product-1.jpg`, `heritage-band.jpg`, `product-2.jpg` under `assets/images/`. No autoplay; reduced-motion friendly by default. |
| **Visit hero (now)** | `dev/theme-preview-visit.html` | Wide still: `product-2.jpg` only (no reel strip). |
| **Self-hosted MP4 (deferred)** | `assets/videos/feed-01.mp4` … | Owner exports reels from [@koshichhyang](https://www.instagram.com/koshichhyang/); see **`assets/videos/README.md`**. Re-enable after sign-off if loops are wanted on production. |
| **Instagram embed** | Per-post `blockquote` + embed.js | Viable for one-off posts; less control than MP4 for loops and palette. |
| **Production** | `index.html` / future `visit.html` | After Direction sign-off, copy the image-only feed band first; add MP4s only if/when clips ship. |

`*.mp4` in `assets/videos/` are **gitignored** so exports are not committed by mistake.

---

## 9. Copy & tone (aligned with mood board)

- Prefer **invitation language**: “Join us”, “Be there for the first pour”, “Your seat at the table”.
- Short **poster lines** on colour blocks; longer serif paragraphs only on heritage.
- British English; say **rice wine / chhyang** plainly (see `PRE-LAUNCH-NOTES.md`).
- Avoid implying shop/checkout until live.

### Age gate (UK 18+)

Full-screen modal on first visit per browser tab: **`assets/age-gate.js`** + **`assets/age-gate.css`**, included on production pages and all **`dev/theme-preview*.html`**. Verified users get **`sessionStorage`** key **`kc_age_verified=1`** (no cookie; under-18 does not set storage). Date of birth uses day / month / year fields; must be a real calendar date, not in the future, and **18+ as of today** (eighteenth birthday on or before today). To retest: DevTools → Application → Session Storage → remove **`kc_age_verified`**, or `sessionStorage.removeItem('kc_age_verified')` in the console, then reload.

---

## 10. Open questions for brand owner

1. **Direction A, B, or C?** (poster vs heritage vs hybrid)
2. Is **bold red** on-brand for Koshi long-term, or launch-only?
3. **Folkestone launch** — final venue name, address, booking link (Eventbrite, Form, Resy)?
4. **Newsletter** — provider and consent copy?
5. Post-launch: **physical tasting room** or pop-ups only?
6. **Stockists** — any confirmed retailers for “Where to buy”?
7. Photography: new shoot for **social/dining** mood board shots, or IG-only?
8. **Membership / club** — planned yes/no (affects nav)?

---

## 11. References

- Mood board: owner-provided collage (cream, red, cobalt, line art, dining photography).
- [Hana Makgeolli](https://www.hanamakgeolli.com/) — structure reference (Shop, Visit, Club, Events, newsletter, footer ops).
- Current tokens: `assets/brand.css`
- Pre-launch rules: `docs/PRE-LAUNCH-NOTES.md`

---

*Last updated: draft for Ranne ↔ owner review. Implement only after sign-off on §1 and §10.*
