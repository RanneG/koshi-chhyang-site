/** Launch event configuration — edit here or override via env. */

export const EVENT = {
  name: "First Pour — Launch Tasting",
  dateLabel: "Saturday 18 July 2026",
  timeLabel: "6:00pm – 10:00pm (Europe/London)",
  venue: "Folkestone, Kent",
  venueDetail: "Street address confirmed by email before the event",
  description:
    "Limited seats for our launch night: tasting flight, music, and first-access pre-orders.",
} as const;

export const WINE_OPTIONS = ["Gold", "Classic", "Spiced", "None yet"] as const;

export function ticketPrices() {
  return {
    ga: Number(process.env.TICKET_GA_PRICE_GBP || "25"),
    vip: Number(process.env.TICKET_VIP_PRICE_GBP || "45"),
    maxPerOrder: Number(process.env.TICKET_MAX_PER_ORDER || "6"),
  };
}

export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://koshichhyang.com").replace(
    /\/$/,
    ""
  );
}
