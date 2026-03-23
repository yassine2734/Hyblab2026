"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { withBasePath } from "@/lib/withBasePath";
import styles from "./Header.module.css";

export default function Header({ onMenuOpen }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
      if (scrolled) {
        document.body.classList.add("scrolled");
      } else {
        document.body.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.classList.remove("scrolled");
    };
  }, []);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.container}>

        {/* Gauche: Desktop Nav (Hidden on Mobile) / Burger (Mobile Only) */}
        <div className={styles.navSection}>
          <button
            className={styles.burgerBtn}
            onClick={onMenuOpen}
            aria-label="Ouvrir le menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <nav className={styles.desktopNav}>
            <Link href="/" className={styles.navLink}>Accueil</Link>
            <Link href="/archetype" className={styles.navLink}>Choix Profil Fan</Link>
            <div className={styles.navDropdown}>
              <Link href="/interviews" className={styles.navLink}>Interviews</Link>
              <div className={styles.navSubmenu}>
                <Link href="/interviews?mode=extraits" className={styles.navSubLink}>Par extrait</Link>
                <Link href="/articles" className={styles.navSubLink}>Par article</Link>
              </div>
            </div>
            <Link
              href="/credits"
              className={styles.navLink}
              onClick={() => {
                try { sessionStorage.setItem("credits_autoplay", "1"); } catch (_) { }
              }}
            >
              Coulisses
            </Link>
          </nav>
        </div>

        {/* Centre: Logo L'ÉQUIPE */}
        <div className={styles.logoWrapper}>
          <Link href="/" className={styles.logoText}>
            L&apos;ÉQUIPE
          </Link>
        </div>

        {/* Droite: Collection badge */}
        <div className={styles.rightSection}>
          <Link href="/collection" className={styles.collectionLink}>
            <button className={styles.collectionBtn}>
              <img src={withBasePath("/home/images/coupe.png")} alt="" className={styles.collectionIcon} />
              <span className={styles.collectionText}>Collection</span>
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
