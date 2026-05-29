# Koshi Chhyang — ticket checkout

Next.js app for launch tasting ticket sales (Stripe Checkout + Turso/SQLite + Resend).

See **[../docs/TICKETS.md](../docs/TICKETS.md)** for setup, deploy, and Stripe CLI testing.

```bash
cp .env.example .env.local
npm install
npm run db:migrate
npm run dev
```

Open http://localhost:3000/tickets
