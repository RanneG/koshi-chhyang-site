import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TicketCheckoutForm } from "@/components/TicketCheckoutForm";

export default function TicketsPage({
  searchParams,
}: {
  searchParams: { cancelled?: string };
}) {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <TicketCheckoutForm cancelled={searchParams.cancelled === "1"} />
      </main>
      <SiteFooter />
    </>
  );
}
