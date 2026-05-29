import { Resend } from "resend";
import { EVENT } from "./event";
import type { TicketOrder } from "./db";

function formatMoney(pence: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

function ticketSummary(order: TicketOrder) {
  const lines: string[] = [];
  if (order.ga_qty > 0) {
    lines.push(`General Admission × ${order.ga_qty}`);
  }
  if (order.vip_qty > 0) {
    lines.push(`VIP (tasting + souvenir glass) × ${order.vip_qty}`);
  }
  return lines.join("\n");
}

export function buildConfirmationEmail(order: TicketOrder) {
  const subject = `Your tickets — ${EVENT.name}`;

  const text = [
    `Namaste ${order.customer_name},`,
    "",
    "Thank you — your payment is confirmed. Here are your ticket details:",
    "",
    `Event: ${EVENT.name}`,
    `When: ${EVENT.dateLabel}, ${EVENT.timeLabel}`,
    `Where: ${EVENT.venue}`,
    `(${EVENT.venueDetail})`,
    "",
    ticketSummary(order),
    `Total paid: ${formatMoney(order.total_pence)}`,
    "",
    `Order reference: ${order.id}`,
    "",
    "Please bring this email (or your name) to registration on the door.",
    "",
    "Questions? Reply to info@koshichhyang.com or message @koshichhyang on Instagram.",
    "",
    "Koshi Chhyang",
  ].join("\n");

  const html = `
    <div style="font-family: Georgia, serif; color: #183a37; max-width: 560px; line-height: 1.6;">
      <p>Namaste ${order.customer_name},</p>
      <p>Thank you — your payment is confirmed. Here are your ticket details:</p>
      <table style="margin: 1.5rem 0; border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 0.25rem 0;"><strong>Event</strong></td><td>${EVENT.name}</td></tr>
        <tr><td style="padding: 0.25rem 0;"><strong>When</strong></td><td>${EVENT.dateLabel}<br/>${EVENT.timeLabel}</td></tr>
        <tr><td style="padding: 0.25rem 0;"><strong>Where</strong></td><td>${EVENT.venue}<br/><em>${EVENT.venueDetail}</em></td></tr>
      </table>
      <pre style="background: #f4f2e1; padding: 1rem; border-left: 4px solid #824532; white-space: pre-wrap; font-family: inherit;">${ticketSummary(order)}
Total paid: ${formatMoney(order.total_pence)}</pre>
      <p><strong>Order reference:</strong> ${order.id}</p>
      <p>Please bring this email (or your name) to registration on the door.</p>
      <p style="color: #55737d;">Questions? <a href="mailto:info@koshichhyang.com">info@koshichhyang.com</a></p>
      <p>— Koshi Chhyang</p>
    </div>
  `;

  return { subject, text, html };
}

export async function sendTicketConfirmation(order: TicketOrder) {
  const { subject, text, html } = buildConfirmationEmail(order);
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.TICKET_FROM_EMAIL ||
    "Koshi Chhyang <onboarding@resend.dev>";

  if (!apiKey) {
    console.log("[email:dev] No RESEND_API_KEY — confirmation for", order.customer_email);
    console.log(text);
    return { ok: true as const, dev: true };
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: order.customer_email,
    subject,
    text,
    html,
  });

  if (error) {
    console.error("[email] send failed:", error);
    throw new Error(error.message);
  }

  return { ok: true as const, dev: false };
}
