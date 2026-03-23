"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { withBasePath } from "@/lib/withBasePath";
import styles from "./Menu.module.css";

const MENU_LINKS = [
  { label: "Accueil", href: "/", icon: "/navbar/home.svg" },
  { label: "Choix profil fan", href: "/archetype", icon: "/navbar/fan.svg" },
  {
    label: "Interviews",
    href: "/interviews",
    icon: "/navbar/interviews.svg",
    children: [
      { label: "Par extrait", href: "/interviews?mode=extraits" },
      { label: "Par article", href: "/articles" },
    ],
  },
  { label: "Collection", href: "/collection", icon: "/navbar/collection.svg" },
  { label: "Crédits", href: "/credits", icon: "/navbar/credits.svg" },
];

export default function Menu({ isOpen, onClose }) {
  const [openSubmenu, setOpenSubmenu] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) setOpenSubmenu(null);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          {/* Panel */}
          <motion.nav
            className={styles.panel}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            {/* Header du menu */}
            <div className={styles.header}>
              <span className={styles.logo}>
                L&apos;ÉQUIPE
              </span>
              <button
                onClick={onClose}
                className={styles.closeBtn}
                aria-label="Fermer le menu"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Links */}
            <div className={styles.linksContainer}>
              {MENU_LINKS.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                >
                  {link.children ? (
                    <button
                      type="button"
                      onClick={() =>
                        setOpenSubmenu(prev => (prev === link.label ? null : link.label))
                      }
                      className={styles.navLink}
                      aria-expanded={openSubmenu === link.label}
                    >
                      <span className={styles.iconWrapper}>
                        <img src={withBasePath(link.icon)} alt="" className={styles.icon} />
                      </span>
                      <span>{link.label}</span>
                      <span className={styles.submenuChevron}>
                        {openSubmenu === link.label ? "—" : "+"}
                      </span>
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={() => {
                        onClose();
                        if (link.href === "/credits") {
                          try { sessionStorage.setItem("credits_autoplay", "1"); } catch (_) { }
                        }
                      }}
                      className={styles.navLink}
                    >
                      <span className={styles.iconWrapper}>
                        <img src={withBasePath(link.icon)} alt="" className={styles.icon} />
                      </span>
                      <span>{link.label}</span>
                    </Link>
                  )}

                  {link.children && (
                    <div
                      className={`${styles.submenu} ${openSubmenu === link.label ? styles.submenuOpen : ""}`}
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          className={styles.submenuLink}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Footer du menu */}
            <div className={styles.footer}>
              <p className={styles.copyright}>© 2026 Equipe · Interviews exclusives</p>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
