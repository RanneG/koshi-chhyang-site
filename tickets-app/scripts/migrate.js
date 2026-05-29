import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL || "file:./data/tickets.db";

if (url.startsWith("file:")) {
  const filePath = url.replace("file:", "");
  mkdirSync(join(process.cwd(), dirname(filePath)), { recursive: true });
}

const client = createClient({ url });

const sql = readFileSync(
  join(process.cwd(), "migrations", "001_ticket_orders.sql"),
  "utf8"
);

const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const statement of statements) {
  await client.execute(statement);
}

console.log("Migration complete:", url);
