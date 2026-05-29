"use client";

import { useEffect, useState } from "react";
import { siteUrl } from "@/lib/event";
import styles from "./SiteHeader.module.css";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/collection.html", label: "Shop" },
  { href: "/visit.html", label: "Visit" },
  { href: "/events.html", label: "Events" },
  { href: "/business.html", label: "Trade" },
  { href: "/heritage.html", label: "Our story" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const base = siteUrl();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Site">
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="site-nav-drawer"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.toggleBars} aria-hidden="true" />
        </button>

        <a href={base + "/"} className={styles.brand}>
          <span className={styles.brandText}>Koshi Chhyang</span>
        </a>

        <div className={styles.links}>
          {NAV.map((item) => (
            <a key={item.href} href={base + item.href}>
              {item.label}
            </a>
          ))}
        </div>

        <a href={base + "/#newsletter"} className={styles.cta}>
          Notify
        </a>
      </nav>

      <div
        className={styles.backdrop}
        data-open={open}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />

      <nav
        id="site-nav-drawer"
        className={styles.drawer}
        aria-label="Menu"
        aria-hidden={!open}
        data-open={open}
      >
        <div className={styles.drawerPanel}>
          {NAV.map((item) => (
            <a key={item.href} href={base + item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
          <a
            href="https://www.instagram.com/koshichhyang/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            Instagram
          </a>
        </div>
      </nav>
    </header>
  );
}
