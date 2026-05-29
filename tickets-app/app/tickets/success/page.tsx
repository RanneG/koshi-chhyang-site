import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getOrderBySessionId } from "@/lib/db";
import { EVENT } from "@/lib/event";
import styles from "./success.module.css";

export default async function TicketsSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;
  const order = sessionId ? await getOrderBySessionId(sessionId) : null;

  return (
    <>
      <SiteHeader />
      <main className={styles.main} id="main">
        <div className={styles.card}>
          <p className={styles.eyebrow}>Payment received</p>
          <h1>Thank you</h1>
          {order ? (
            <>
              <p>
                Your tickets for <strong>{EVENT.name}</strong> are confirmed.
                We&apos;ve emailed a copy to{" "}
                <strong>{order.customer_email}</strong>.
              </p>
              <dl className={styles.summary}>
                <div>
                  <dt>Reference</dt>
                  <dd>{order.id}</dd>
                </div>
                <div>
                  <dt>Tickets</dt>
                  <dd>
                    {order.ga_qty > 0 && `General Admission × ${order.ga_qty}`}
                    {order.ga_qty > 0 && order.vip_qty > 0 && " · "}
                    {order.vip_qty > 0 && `VIP × ${order.vip_qty}`}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <p>
              Your payment was successful. A confirmation email will arrive
              shortly.
            </p>
          )}
          <Link href="/tickets" className={styles.link}>
            Back to tickets
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
