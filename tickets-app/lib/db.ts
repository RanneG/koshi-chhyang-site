import { createClient, type Client } from "@libsql/client";
import { readFileSync } from "fs";
import { join } from "path";

export type OrderStatus = "pending" | "confirmed" | "cancelled" | "failed";

export type TicketOrder = {
  id: string;
  status: OrderStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  wine_tried_before: string;
  ga_qty: number;
  vip_qty: number;
  total_pence: number;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  created_at: string;
  confirmed_at: string | null;
};

let client: Client | null = null;
let migrated = false;

function getClient() {
  if (!client) {
    const url = process.env.DATABASE_URL || "file:./data/tickets.db";
    client = createClient({ url });
  }
  return client;
}

async function ensureMigrated() {
  if (migrated) return;
  const sql = readFileSync(
    join(process.cwd(), "migrations", "001_ticket_orders.sql"),
    "utf8"
  );
  const db = getClient();
  for (const statement of sql
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)) {
    await db.execute(statement);
  }
  migrated = true;
}

export async function createPendingOrder(input: {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  wineTriedBefore: string;
  gaQty: number;
  vipQty: number;
  totalPence: number;
  stripeSessionId: string;
}) {
  await ensureMigrated();
  const db = getClient();
  await db.execute({
    sql: `INSERT INTO ticket_orders (
      id, status, customer_name, customer_email, customer_phone,
      wine_tried_before, ga_qty, vip_qty, total_pence, stripe_session_id
    ) VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      input.id,
      input.customerName,
      input.customerEmail,
      input.customerPhone ?? null,
      input.wineTriedBefore,
      input.gaQty,
      input.vipQty,
      input.totalPence,
      input.stripeSessionId,
    ],
  });
}

export async function getOrderBySessionId(sessionId: string) {
  await ensureMigrated();
  const db = getClient();
  const result = await db.execute({
    sql: "SELECT * FROM ticket_orders WHERE stripe_session_id = ? LIMIT 1",
    args: [sessionId],
  });
  if (result.rows.length === 0) return null;
  return rowToOrder(result.rows[0]);
}

export async function getOrderById(id: string) {
  await ensureMigrated();
  const db = getClient();
  const result = await db.execute({
    sql: "SELECT * FROM ticket_orders WHERE id = ? LIMIT 1",
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToOrder(result.rows[0]);
}

export async function confirmOrder(input: {
  stripeSessionId: string;
  paymentIntentId?: string | null;
}) {
  await ensureMigrated();
  const db = getClient();
  await db.execute({
    sql: `UPDATE ticket_orders
          SET status = 'confirmed',
              stripe_payment_intent = COALESCE(?, stripe_payment_intent),
              confirmed_at = datetime('now')
          WHERE stripe_session_id = ? AND status = 'pending'`,
    args: [input.paymentIntentId ?? null, input.stripeSessionId],
  });
  return getOrderBySessionId(input.stripeSessionId);
}

export async function cancelOrder(stripeSessionId: string) {
  await ensureMigrated();
  const db = getClient();
  await db.execute({
    sql: `UPDATE ticket_orders SET status = 'cancelled'
          WHERE stripe_session_id = ? AND status = 'pending'`,
    args: [stripeSessionId],
  });
}

function rowToOrder(row: Record<string, unknown>): TicketOrder {
  return {
    id: String(row.id),
    status: row.status as OrderStatus,
    customer_name: String(row.customer_name),
    customer_email: String(row.customer_email),
    customer_phone: row.customer_phone ? String(row.customer_phone) : null,
    wine_tried_before: String(row.wine_tried_before),
    ga_qty: Number(row.ga_qty),
    vip_qty: Number(row.vip_qty),
    total_pence: Number(row.total_pence),
    stripe_session_id: row.stripe_session_id
      ? String(row.stripe_session_id)
      : null,
    stripe_payment_intent: row.stripe_payment_intent
      ? String(row.stripe_payment_intent)
      : null,
    created_at: String(row.created_at),
    confirmed_at: row.confirmed_at ? String(row.confirmed_at) : null,
  };
}
