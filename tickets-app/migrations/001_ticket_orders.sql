-- Ticket orders for Koshi Chhyang launch events
-- Compatible with SQLite / Turso (libSQL)

CREATE TABLE IF NOT EXISTS ticket_orders (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'failed')),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  wine_tried_before TEXT NOT NULL,
  ga_qty INTEGER NOT NULL DEFAULT 0 CHECK (ga_qty >= 0),
  vip_qty INTEGER NOT NULL DEFAULT 0 CHECK (vip_qty >= 0),
  total_pence INTEGER NOT NULL CHECK (total_pence > 0),
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_ticket_orders_email ON ticket_orders (customer_email);
CREATE INDEX IF NOT EXISTS idx_ticket_orders_status ON ticket_orders (status);
CREATE INDEX IF NOT EXISTS idx_ticket_orders_stripe_session ON ticket_orders (stripe_session_id);
