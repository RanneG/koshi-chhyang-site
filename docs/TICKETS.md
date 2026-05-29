# Ticket checkout (Stripe)

The marketing site on **GitHub Pages** is static — it cannot run Stripe secrets or webhooks. Ticket sales live in **`tickets-app/`**, a Next.js app you deploy separately (Vercel, Railway, Fly.io, etc.).

## Architecture

| Piece | Where |
|-------|--------|
| Marketing pages | GitHub Pages (`koshichhyang.com`) |
| Ticket UI + API | `tickets-app` → e.g. `tickets.koshichhyang.com` |
| Payments | Stripe Checkout |
| Orders DB | SQLite file locally, [Turso](https://turso.tech) in production |
| Confirmation email | [Resend](https://resend.com) |

## Setup

```bash
cd tickets-app
cp .env.example .env.local
npm install
npm run db:migrate
npm run dev
```

Open http://localhost:3000/tickets

### Environment variables

See `tickets-app/.env.example`. Required for live checkout:

- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL` — ticket app URL (no trailing slash)
- `NEXT_PUBLIC_SITE_URL` — main site (`https://koshichhyang.com`)
- `DATABASE_URL` — `file:./data/tickets.db` or Turso connection string
- `RESEND_API_KEY`, `TICKET_FROM_EMAIL` — confirmation emails

Prices default to **£25 GA / £45 VIP** (override with `TICKET_GA_PRICE_GBP`, `TICKET_VIP_PRICE_GBP`).

## Stripe webhook (local)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` secret into `.env.local` as `STRIPE_WEBHOOK_SECRET`, restart `npm run dev`, then complete a test checkout.

Test card: `4242 4242 4242 4242`, any future expiry, any CVC.

## Production deploy (Vercel example)

1. Import `tickets-app` as a new Vercel project (root directory: `tickets-app`).
2. Add env vars from `.env.example`.
3. Create a Turso database; set `DATABASE_URL`.
4. In Stripe Dashboard → Webhooks → add endpoint  
   `https://YOUR-APP.vercel.app/api/webhooks/stripe`  
   Events: `checkout.session.completed`, `checkout.session.expired`.
5. Set custom domain e.g. `tickets.koshichhyang.com`.
6. Update `tickets.html` on the static site (or env in build) to point at the live ticket URL.

## Static site links

- `tickets.html` — redirect stub to the ticket app
- `visit.html` / `events.html` — “Get tickets” CTAs

## Database

Migration: `tickets-app/migrations/001_ticket_orders.sql`

Flow:

1. **POST /api/create-checkout-session** — validates form, inserts `pending` order, returns Stripe Checkout URL.
2. **Stripe webhook** `checkout.session.completed` — marks order `confirmed`, sends email.
3. **GET /tickets/success** — thank-you page with order reference.

## Event copy

Edit `tickets-app/lib/event.ts` for name, date, venue. Current defaults match `visit.html` (18 July 2026, Folkestone).
