import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createPendingOrder } from "@/lib/db";
import { appUrl, ticketPrices, EVENT } from "@/lib/event";
import { getStripe } from "@/lib/stripe";
import { checkoutSchema, formatValidationErrors } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: formatValidationErrors(parsed.error) },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const prices = ticketPrices();
    const totalTickets = data.gaQty + data.vipQty;
    const totalPence =
      data.gaQty * prices.ga * 100 + data.vipQty * prices.vip * 100;

    const orderId = randomUUID();
    const stripe = getStripe();
    const base = appUrl();

    const lineItems: {
      price_data: {
        currency: string;
        unit_amount: number;
        product_data: { name: string; description?: string };
      };
      quantity: number;
    }[] = [];

    if (data.gaQty > 0) {
      lineItems.push({
        price_data: {
          currency: "gbp",
          unit_amount: prices.ga * 100,
          product_data: {
            name: "General Admission",
            description: `${EVENT.name} — ${EVENT.dateLabel}`,
          },
        },
        quantity: data.gaQty,
      });
    }

    if (data.vipQty > 0) {
      lineItems.push({
        price_data: {
          currency: "gbp",
          unit_amount: prices.vip * 100,
          product_data: {
            name: "VIP — tasting + souvenir glass",
            description: `${EVENT.name} — ${EVENT.dateLabel}`,
          },
        },
        quantity: data.vipQty,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: data.email,
      line_items: lineItems,
      success_url: `${base}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/tickets?cancelled=1`,
      metadata: {
        orderId,
        customerName: data.fullName,
        wineTriedBefore: data.wineTriedBefore,
        phone: data.phone || "",
        gaQty: String(data.gaQty),
        vipQty: String(data.vipQty),
        totalTickets: String(totalTickets),
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not start checkout" },
        { status: 500 }
      );
    }

    await createPendingOrder({
      id: orderId,
      customerName: data.fullName,
      customerEmail: data.email,
      customerPhone: data.phone,
      wineTriedBefore: data.wineTriedBefore,
      gaQty: data.gaQty,
      vipQty: data.vipQty,
      totalPence,
      stripeSessionId: session.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[create-checkout-session]", err);
    return NextResponse.json(
      { error: "Could not create checkout session" },
      { status: 500 }
    );
  }
}
