import { siteUrl } from "@/lib/event";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  const base = siteUrl();

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div>
          <p className={styles.mark}>Koshi Chhyang</p>
          <address className={styles.address}>
            Folkestone, Kent
            <br />
            United Kingdom
          </address>
        </div>
        <div>
          <h3>Launch event</h3>
          <p>
            18 July 2026
            <br />
            Doors 6pm · last pour 10pm
          </p>
        </div>
        <nav aria-label="Explore">
          <h3>Explore</h3>
          <a href={base + "/"}>Home</a>
          <a href={base + "/visit.html"}>Visit</a>
          <a href={base + "/events.html"}>Events</a>
        </nav>
        <nav aria-label="More">
          <h3>More</h3>
          <a href={base + "/business.html"}>Trade</a>
          <a
            href="https://www.instagram.com/koshichhyang/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
        </nav>
      </div>
      <div className={styles.legal}>
        <span>&copy; Koshi Chhyang</span>
        <a href="mailto:info@koshichhyang.com">info@koshichhyang.com</a>
      </div>
    </footer>
  );
}
