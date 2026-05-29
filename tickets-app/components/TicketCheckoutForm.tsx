"use client";

import { useMemo, useState } from "react";
import { EVENT, WINE_OPTIONS, ticketPrices } from "@/lib/event";
import styles from "./TicketCheckoutForm.module.css";

type FieldErrors = Record<string, string>;

const prices = ticketPrices();

function clampQty(value: number) {
  return Math.max(0, Math.min(prices.maxPerOrder, value));
}

export function TicketCheckoutForm({ cancelled }: { cancelled?: boolean }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [wineTriedBefore, setWineTriedBefore] = useState<string>("None yet");
  const [gaQty, setGaQty] = useState(1);
  const [vipQty, setVipQty] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalTickets = gaQty + vipQty;
  const totalPence = gaQty * prices.ga * 100 + vipQty * prices.vip * 100;

  const totalLabel = useMemo(
    () =>
      new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      }).format(totalPence / 100),
    [totalPence]
  );

  function adjustGa(delta: number) {
    setGaQty((q) => clampQty(q + delta));
    setErrors((e) => ({ ...e, gaQty: "" }));
  }

  function adjustVip(delta: number) {
    setVipQty((q) => clampQty(q + delta));
    setErrors((e) => ({ ...e, gaQty: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone: phone || undefined,
          wineTriedBefore,
          gaQty,
          vipQty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        setFormError(data.error || "Could not start checkout");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setFormError("Could not start checkout");
    } catch {
      setFormError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  const atMax = totalTickets >= prices.maxPerOrder;

  return (
    <div className={styles.wrap}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Launch tasting</p>
        <h1>{EVENT.name}</h1>
        <p className={styles.lead}>{EVENT.description}</p>
        <dl className={styles.facts}>
          <div>
            <dt>When</dt>
            <dd>
              {EVENT.dateLabel}
              <br />
              {EVENT.timeLabel}
            </dd>
          </div>
          <div>
            <dt>Where</dt>
            <dd>
              {EVENT.venue}
              <br />
              <span className={styles.meta}>{EVENT.venueDetail}</span>
            </dd>
          </div>
        </dl>
      </header>

      {cancelled && (
        <p className={styles.banner} role="status">
          Checkout was cancelled — your tickets are still available below.
        </p>
      )}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <section className={styles.section} aria-labelledby="tickets-heading">
          <h2 id="tickets-heading">Choose tickets</h2>
          <p className={styles.hint}>
            Maximum {prices.maxPerOrder} tickets per order.
          </p>

          <article className={styles.ticketRow}>
            <div>
              <h3>General Admission</h3>
              <p className={styles.price}>£{prices.ga}</p>
            </div>
            <div className={styles.qty}>
              <button
                type="button"
                aria-label="Remove General Admission ticket"
                onClick={() => adjustGa(-1)}
                disabled={gaQty === 0 || submitting}
              >
                −
              </button>
              <span aria-live="polite">{gaQty}</span>
              <button
                type="button"
                aria-label="Add General Admission ticket"
                onClick={() => adjustGa(1)}
                disabled={atMax || submitting}
              >
                +
              </button>
            </div>
          </article>

          <article className={styles.ticketRow}>
            <div>
              <h3>VIP</h3>
              <p className={styles.ticketSub}>
                Includes rice wine tasting + souvenir glass
              </p>
              <p className={styles.price}>£{prices.vip}</p>
            </div>
            <div className={styles.qty}>
              <button
                type="button"
                aria-label="Remove VIP ticket"
                onClick={() => adjustVip(-1)}
                disabled={vipQty === 0 || submitting}
              >
                −
              </button>
              <span aria-live="polite">{vipQty}</span>
              <button
                type="button"
                aria-label="Add VIP ticket"
                onClick={() => adjustVip(1)}
                disabled={atMax || submitting}
              >
                +
              </button>
            </div>
          </article>

          {errors.gaQty && (
            <p className={styles.fieldError} role="alert">
              {errors.gaQty}
            </p>
          )}

          <p className={styles.total} aria-live="polite">
            Total ({totalTickets} ticket{totalTickets === 1 ? "" : "s"}):{" "}
            <strong>{totalLabel}</strong>
          </p>
        </section>

        <section className={styles.section} aria-labelledby="details-heading">
          <h2 id="details-heading">Your details</h2>

          <label htmlFor="fullName" className={styles.label}>Full name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            className={styles.input}
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
          />
          {errors.fullName && (
            <p id="fullName-error" className={styles.fieldError} role="alert">
              {errors.fullName}
            </p>
          )}

          <label htmlFor="email" className={styles.label}>Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            className={styles.input}
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className={styles.fieldError} role="alert">
              {errors.email}
            </p>
          )}

          <label htmlFor="phone" className={styles.label}>
            Phone <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className={styles.input}
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <label htmlFor="wineTriedBefore" className={styles.label}>
            Which Koshi Chhyang rice wine have you tried before?
          </label>
          <select
            id="wineTriedBefore"
            name="wineTriedBefore"
            className={styles.select}
            required
            value={wineTriedBefore}
            onChange={(e) => setWineTriedBefore(e.target.value)}
            aria-invalid={!!errors.wineTriedBefore}
          >
            {WINE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {errors.wineTriedBefore && (
            <p className={styles.fieldError} role="alert">
              {errors.wineTriedBefore}
            </p>
          )}
        </section>

        {formError && (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        )}

        <button
          type="submit"
          className={styles.submit}
          disabled={submitting || totalTickets < 1}
        >
          {submitting ? "Redirecting to secure checkout…" : "Continue to payment"}
        </button>

        <p className={styles.secure}>
          Secure payment via Stripe. You&apos;ll receive a confirmation email
          after payment.
        </p>
      </form>
    </div>
  );
}
