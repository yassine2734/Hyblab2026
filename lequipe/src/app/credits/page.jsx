"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { withBasePath } from "@/lib/withBasePath";
import styles from "./Credits.module.css";

// Disposition identique à l'accueil (collage fixe)
const BG_PLAYERS = [
  { id: "platini", src: "/home/images/platini.png", style: { width: "46%", height: "42%", top: "calc(-7% - 10px)", left: "calc(24% - 5px)", zIndex: 10 } },
  { id: "leboeuf", src: "/home/images/leboeuf.png", style: { width: "46%", height: "42%", top: "calc(11% - 65px)", right: "calc(5% + 40px)", zIndex: 12 } },
  { id: "zidane", src: "/home/images/zidane.png", style: { width: "60%", height: "53%", top: "calc(9% - 30px)", left: "calc(5% - 5px)", zIndex: 13 } },
  { id: "perrocheau", src: "/home/images/perrocheau.png", style: { width: "72%", height: "60%", top: "calc(35% - 90px)", left: "calc(-16% + 110px)", zIndex: 16 } },
  { id: "lloris", src: "/home/images/lloris.png", style: { width: "56%", height: "56%", top: "calc(31% - 85px)", right: "calc(-10% - 25px)", zIndex: 18 } },
  { id: "amarildo", src: "/home/images/Amarildo.png", style: { width: "66%", height: "58%", top: "calc(28% - 90px)", left: "calc(21% - 165px)", zIndex: 17 } },
  { id: "sparwasser", src: "/home/images/sparwasser.png", style: { width: "58%", height: "54%", top: "calc(30% - 110px)", right: "calc(-8% + 30px)", zIndex: 14 } },
  { id: "mila", src: "/home/images/mila.png", style: { width: "68%", height: "60%", top: "calc(30% - 5px)", left: "calc(-5% - 10px)", zIndex: 21 } },
  { id: "rattin", src: "/home/images/Rattin.png", style: { width: "64%", height: "55%", bottom: "calc(2% + 20px)", right: "calc(-12% - 50px)", zIndex: 26 } },
  { id: "martin", src: "/home/images/martin.png", style: { width: "70%", height: "64%", bottom: "calc(5% - 55px)", left: "calc(50% + 30px)", transform: "translateX(-50%)", zIndex: 25 } },
  { id: "goycoechea", src: "/home/images/Goycoechea.png", style: { width: "52%", height: "46%", bottom: "calc(0% + 70px)", left: "calc(-8% - 50px)", zIndex: 24 } },
  { id: "pele", src: "/home/images/pelé.png", style: { width: "76%", height: "66%", bottom: "-140px", left: "-12%", zIndex: 31 } },
  { id: "schillaci", src: "/home/images/schillaci.png", style: { width: "64%", height: "54%", bottom: "-80px", right: "-5%", zIndex: 30 } },
];

const TEAM_NAME = "La VAR";

const TEAM = [
  { id: "marie", name: "Marie BAGUELIN", role: "Design", link: "https://www.linkedin.com/in/marie-baguelin/", photo: "/credits/Marie.png" },
  { id: "yassine", name: "Yassine EL MAGHRAOUI", role: "Développement & données", link: "https://www.linkedin.com/in/yassine-el-maghraoui/", photo: "/credits/Yassine.png", photoScale: 0.88 },
  { id: "juliette", name: "Juliette MATELOT", role: "Design", link: "https://www.linkedin.com/in/juliettematelot/", photo: "/credits/Juliette.png" },
  { id: "moutassim", name: "Moutassim DJODALLAH", role: "Architecture & Développement", link: "https://www.linkedin.com/in/mdjodallah/", photo: "/credits/Moutassim.png" },
  { id: "olivier", name: "Olivier AHEHEHINNOU", role: "Design", link: "https://www.linkedin.com/in/olivier-ahehehinnou-0035801bb/", photo: "/credits/olivier.png" },
  { id: "amine", name: "Amine TIGHIOUART", role: "Développement", link: "https://www.linkedin.com/in/amine-tighiouart-523051330/", photo: "/credits/Amine.png" },
  { id: "denis", name: "Denis-Marius VLADU", role: "Développement", link: "https://www.linkedin.com/in/dennis-marius-vladu/", photo: "/credits/Denis.png" },
  { id: "ayman", name: "Ayman MELLAS", role: "Développement", link: "https://www.linkedin.com/in/ayman-mellas-570b63131/", photo: "/credits/Ayman.png" },
];

const PORTEUR = { name: "Maxime MALÉCOT", role: "Porteur du projet", link: "https://www.linkedin.com/in/maximemalecot/", link_web: "https://www.lequipe.fr/", photo: "/credits/Maxime.png" };

const PARTNERS_H1 = [
  { id: "hyblab", name: "Hyblab", src: "/credits/hyblab.png", link: null, h: 54 },
];

const PARTNERS_H2 = [
  { id: "polytech", name: "Polytech Nantes", src: "/credits/polytech.png", link: "https://polytech.univ-nantes.fr/", h: 44 },
  { id: "ecoledesign", name: "L’École de Design", src: "/credits/EDNA.png", link: "https://lecolededesign.com/", h: 50 },
];

const PARTNERS_H3 = [
  { id: "nantesu", name: "Nantes Université", src: "/credits/nantes_universite.png", link: "https://www.univ-nantes.fr/", h: 44 },
];

const PARTNERS_OTHERS = [
  { id: "ouestmedialab", name: "Ouest Medialab", src: "/credits/ouest_medialab.png", link: "https://www.ouestmedialab.fr/", h: 64 },
  { id: "nantesmetropole", name: "Nantes Métropole", src: "/credits/nantes_metropole.png", link: "https://metropole.nantes.fr/", h: 48 },
  { id: "osi", name: "Open Source Initiative", src: "/credits/open_source_initiative.png", link: "https://opensource.org/", h: 56 },
  { id: "cc", name: "Creative Commons", src: "/credits/creative_commons.png", link: "https://creativecommons.org/licenses/by/3.0/fr/", h: 44 },
];

export default function CreditsPage() {
  const audioRef = useRef(null);
  const teamSectionRef = useRef(null);
  const porteurSectionRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scale, setScale] = useState(1);
  const [headerH, setHeaderH] = useState(64);
  const [visibleCount, setVisibleCount] = useState(0);
  const [teamVisible, setTeamVisible] = useState(false);
  const [porteurVisible, setPorteurVisible] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.6;

    // 1. Tentative d'autoplay si autorisé (navigation depuis le site)
    const checkAutoplay = async () => {
      try {
        const allowTarget = sessionStorage.getItem("credits_autoplay") === "1";
        if (allowTarget) {
          audio.muted = false;
          await audio.play();
          setIsPlaying(true);
          sessionStorage.removeItem("credits_autoplay");
        }
      } catch (_) {
        // Bloqué par le navigateur
      }
    };
    checkAutoplay();

    // 2. Fallback sur interaction (scroll ou toucher)
    const handleInteraction = () => {
      if (audio && audio.paused) {
        audio.muted = false;
        audio.play().then(() => setIsPlaying(true)).catch(() => { });
      }
    };

    window.addEventListener("scroll", handleInteraction, { once: true });
    window.addEventListener("pointerdown", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("pointerdown", handleInteraction);
    };
  }, []);

  useEffect(() => {
    const measureHeader = () => {
      const headerEl = document.querySelector("header");
      if (headerEl) {
        setHeaderH(Math.round(headerEl.getBoundingClientRect().height));
      } else {
        setHeaderH(64);
      }
    };

    const handleResize = () => {
      measureHeader();
      const REF_W = 413;
      const REF_H = 580;
      const availableW = window.innerWidth;
      const availableH = window.innerHeight - headerH;
      const scaleW = availableW / REF_W;
      const scaleH = (availableH * 0.95) / REF_H;
      let newScale = Math.min(scaleW, scaleH);
      if (window.innerWidth <= 980) {
        newScale = newScale * 1.05;
      } else if (window.innerWidth > 1024) {
        newScale = Math.min(newScale, 1.2);
      }
      setScale(newScale);
    };

    measureHeader();
    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, [headerH]);

  const orderIndex = (() => {
    const ordered = [...BG_PLAYERS].reverse();
    const map = {};
    ordered.forEach((p, i) => {
      map[p.id] = i;
    });
    return map;
  })();

  useEffect(() => {
    const step = 60;
    const startOffset = 40;
    let userIntentToScroll = false;
    let revealBaseY = null;

    // Aucun joueur en fond au chargement initial.
    setVisibleCount(0);

    const markScrollIntent = () => {
      userIntentToScroll = true;
    };

    const onKeydown = (event) => {
      const keys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
      if (keys.includes(event.key)) {
        userIntentToScroll = true;
      }
    };

    const onScroll = () => {
      const y = Math.max(window.scrollY || 0, 0);

      // Ignore les scrolls "techniques" (restauration au refresh, ancre, etc.)
      // tant qu'il n'y a pas eu une intention de scroll utilisateur.
      if (!userIntentToScroll) {
        setVisibleCount(0);
        return;
      }

      if (revealBaseY === null) {
        revealBaseY = y;
        setVisibleCount(0);
        return;
      }

      const distance = Math.max(y - revealBaseY, 0);
      if (distance < startOffset) {
        setVisibleCount(0);
        return;
      }

      const count = Math.min(Math.floor((distance - startOffset) / step) + 1, BG_PLAYERS.length);
      setVisibleCount(Math.max(count, 0));
    };

    window.addEventListener("wheel", markScrollIntent, { passive: true });
    window.addEventListener("touchstart", markScrollIntent, { passive: true });
    window.addEventListener("keydown", onKeydown);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", markScrollIntent);
      window.removeEventListener("touchstart", markScrollIntent);
      window.removeEventListener("keydown", onKeydown);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      setTeamVisible(true);
      setPorteurVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const section = entry.target.getAttribute("data-credits-section");
          if (section === "team") setTeamVisible(true);
          if (section === "porteur") setPorteurVisible(true);
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.24,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    if (teamSectionRef.current) observer.observe(teamSectionRef.current);
    if (porteurSectionRef.current) observer.observe(porteurSectionRef.current);

    return () => observer.disconnect();
  }, []);


  return (
    <div className={styles.page}>
      {visibleCount > 0 ? (
        <div
          className={styles.bgLayer}
          style={{ top: `${headerH}px`, height: `calc(100vh - ${headerH}px)` }}
        >
          <div className={styles.bgCollage} style={{ transform: `scale(${scale})` }}>
            {BG_PLAYERS.map((p) => (
              <div key={p.id} className={styles.bgItem} style={p.style}>
                <img
                  className={`${styles.bgImg} ${orderIndex[p.id] < visibleCount ? styles.bgImgVisible : ""}`}
                  src={withBasePath(p.src)}
                  alt=""
                  style={{
                    transitionDelay: `${(orderIndex[p.id] ?? 0) * 0.08}s`,
                  }}
                />
              </div>
            ))}
          </div>
          <div className={styles.bgVeil} />
        </div>
      ) : null}

      <main className={styles.content}>
        <div className={styles.headerIntro}>
          <h1 className={styles.title}>Crédits</h1>
          <p className={styles.subtitle}>L&apos;histoire derrière la légende · {TEAM_NAME}</p>
        </div>

        <section
          ref={teamSectionRef}
          data-credits-section="team"
          className={`${styles.card} ${styles.membersSection} ${teamVisible ? styles.membersSectionVisible : ""}`}
        >
          <h2 className={styles.sectionTitle}>La VAR — Équipe Créative</h2>
          <div className={styles.peopleGrid}>
            {TEAM.map((m, index) => (
              <div
                key={m.id}
                className={styles.person}
                style={{ "--member-delay": `${index * 0.09}s` }}
              >
                {m.photo ? (
                  <div className={styles.memberStickerWrap}>
                    {m.link ? (
                      <Link
                        className={styles.memberStickerLink}
                        href={m.link}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Voir le profil LinkedIn de ${m.name}`}
                      >
                        <img
                          className={styles.memberSticker}
                          src={withBasePath(m.photo)}
                          alt={m.name}
                          style={m.photoScale ? { transform: `scale(${m.photoScale})`, transformOrigin: "center bottom" } : undefined}
                        />
                      </Link>
                    ) : (
                      <img
                        className={styles.memberSticker}
                        src={withBasePath(m.photo)}
                        alt={m.name}
                        style={m.photoScale ? { transform: `scale(${m.photoScale})`, transformOrigin: "center bottom" } : undefined}
                      />
                    )}
                  </div>
                ) : null}
                {m.link ? (
                  <Link className={styles.personLink} href={m.link} target="_blank" rel="noreferrer">
                    {m.name}
                  </Link>
                ) : (
                  <span className={styles.personName}>{m.name}</span>
                )}
                <span className={styles.role}>{m.role}</span>
              </div>
            ))}
          </div>
        </section>

        <section
          ref={porteurSectionRef}
          data-credits-section="porteur"
          className={`${styles.card} ${styles.porteurSection} ${porteurVisible ? styles.porteurSectionVisible : ""}`}
        >
          <h2 className={styles.sectionTitle}>Porteur de Projet</h2>
          <div className={`${styles.person} ${styles.porteurPerson}`}>
            {PORTEUR.photo ? (
              <div className={styles.porteurStickerWrap}>
                <Link
                  className={styles.memberStickerLink}
                  href={PORTEUR.link}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Voir le profil de ${PORTEUR.name}`}
                >
                  <img className={styles.porteurSticker} src={withBasePath(PORTEUR.photo)} alt={PORTEUR.name} />
                </Link>
              </div>
            ) : null}
            <Link className={styles.personLink} href={PORTEUR.link} target="_blank" rel="noreferrer">
              {PORTEUR.name}
            </Link>
            <span className={styles.role}>{PORTEUR.role}</span>
            <div className={styles.porteurLogo}>
              <Link href={PORTEUR.link_web} target="_blank" rel="noreferrer" className={styles.equipeLogoLink}>
                <span className={styles.equipeLogoText}>L’ÉQUIPE</span>
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Partenaires Médias & Institutionnels</h2>
          <div className={styles.logos}>
            {[PARTNERS_H1, PARTNERS_H2, PARTNERS_H3, PARTNERS_OTHERS].map((row, i) => (
              <div key={i} className={styles.logosRow}>
                {row.map((p) => {
                  const img = <img className={styles.logoImg} src={withBasePath(p.src)} alt={p.name} style={{ height: p.h || 32 }} />;
                  return (
                    <div key={p.id} className={styles.logoBox}>
                      {p.link ? (
                        <Link href={p.link} target="_blank" rel="noreferrer" className={styles.logoLink}>{img}</Link>
                      ) : img}
                      <span className={styles.logoLabel}>{p.name}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        <div className={styles.creditsRoll}>
          <h3 className={styles.rollTitle}>Dédicace</h3>
          <p className={styles.rollLine}>À tous les passionnés qui font vibrer le sport.</p>
          <p className={styles.rollLine}>Merci d&apos;avoir exploré cette immersion.</p>
          <p className={styles.rollLine}>Hyblab · Édition 2026</p>
          <p className={styles.rollLine}>L&apos;ÉQUIPE x POLYTECH NANTES x ÉCOLE DE DESIGN NANTES ATLANTIQUE</p>
        </div>

      </main>

      <audio ref={audioRef} src={withBasePath("/home/sons/apparition.mp3")} loop />
    </div>
  );
}
