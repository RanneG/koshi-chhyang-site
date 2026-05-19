# Koshi Chhyang — pre-launch notes

Short brand and UX notes for the static pre-release site (root HTML). Not a full style guide.

## Wix source of truth

Reference site: [jingyikongwork.wixsite.com/koshi-chhyang](https://jingyikongwork.wixsite.com/koshi-chhyang)

| Token | Value |
|-------|--------|
| Display font | **Lucy Rose Personal** (Wix `orig_lucy_rose_personal_regular`) — fallback: Cormorant Garamond via Google Fonts |
| Body font | `Arial, Helvetica, sans-serif` |
| Primary | `#5e718b` |
| Primary B (heritage) | `#55737a` |
| Cream | `#f0ede5` |
| Accent | `#c78f57` |
| Text | `#2c2c2a` |

**Lucy Rose licensing:** Personal free / commercial via Ellen Luff or Adobe Fonts. Drop `LucyRosePersonal-Regular.woff2` into `assets/fonts/` for pixel-perfect match; until then Cormorant Garamond is used.

**Refresh images from Wix:** Export from Wix Media Manager → `assets/wix-import/` → `python scripts/sync_wix_assets.py`

Shared styles: `assets/brand.css` (all concept pages).

## Open question (TBD with brand owner)

**Tone:** casual community vibe vs firm professional — decide before final copy pass and social voice. Current pages lean warm heritage with concise product facts; either pole can work if applied consistently.

## What’s working (keep)

- **Theme / palette** — slate blue (`#5e718b`), cream (`#f0ede5`), accent gold (`#c78f57`); reads premium without feeling cold.
- **Heritage story** — Direction 2 editorial journey; basin origin, fermentation patience, Folkestone launch event.
- **Collection page (Direction 3)** — “Choose your pour”, stat row (0 sugar, 5–7% ABV, 14+ day ferment, 3 expressions), selection layout.
- **Landing (index)** — RSVP strip, countdown, launch tasting block; **community notes** (Instagram-style quotes) + link to collection.

## Pre-launch copy principles

- **Clear and concise** — short lines, concrete numbers; avoid filler.
- **RSVP urgency** — launch 18 July 2026 · 6pm · Folkestone; “Notify me at launch”, “Join the list”, “RSVP now” over shop language.
- **Honest availability** — use “Coming soon”, “Notify at launch”, “Preview collection”; do not imply live cart or checkout.
- **Avoid jargon confusion** — say rice wine / chhyang / marcha ferment in plain context; do not revert to matcha/tea framing (addressed in Direction 2 — keep that clarity).
- **British English** where already used (e.g. flavour → keep consistent if extended).

## Surfaces (current)

| Page | Role |
|------|------|
| `index.html` | Landing — hero, countdown, event RSVP, community notes |
| `collection.html` | Collection preview — pre-launch CTAs only |
| `heritage.html` | Heritage narrative |
| `business.html` | Trade enquiries |

**Deploy:** `python scripts/build_deploy.py` → upload **`dist/`** (or Netlify build from `netlify.toml`). Run `scripts/optimize_images.py` after swapping photos. Heritage page skips playful button JS/CSS. Capybara loader on all pages.

## Post-launch checklist

When e-commerce goes live:

1. **Direction 3** — Replace pre-launch product CTAs (search `PRE-LAUNCH:` in HTML) with **Add to cart** and wire cart/checkout.
2. **Header badge** — e.g. “Coming soon” → “Shop the collection” or “Available now” as appropriate.
3. **Hero / collection CTAs** — “Notify me at launch” / “Join the list” → shop paths (cart, catalogue, account).
4. **Private orders** — Restore B2B/quote flow if separate from retail cart.
5. **Nav** — Add Shop (or Cart) if needed; keep Heritage / Collection story pages if still useful.
6. **Landing index** — Product cards: optional “Shop now” links; remove or repurpose “coming soon” subcopy.
7. **Legal / ops** — shipping, age verification, payment, stock — out of scope for static HTML but required for real checkout.

## Dev hint

Pre-launch CTA swaps in `collection.html` are marked:

```html
<!-- PRE-LAUNCH: replace with add-to-cart post-launch -->
```
