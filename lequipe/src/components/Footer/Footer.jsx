"use client";

import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <span className={styles.logo}>
          L&apos;ÉQUIPE ·{" "}
          <Link
            className={styles.creditsLink}
            href="/credits"
            onClick={() => {
              try {
                sessionStorage.setItem("credits_autoplay", "1");
              } catch (_) {}
            }}
          >
            Crédits
          </Link>
        </span>
        <span className={styles.copyright}>© 2026 · Equipe</span>
      </div>
    </footer>
  );
}
