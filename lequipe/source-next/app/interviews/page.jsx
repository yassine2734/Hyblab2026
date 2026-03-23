"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCollection } from "@/hooks/useCollection";
import { getInterviewsList } from "@/lib/data/interviews";
import { ARCHETYPES_BY_ID } from "@/lib/data/archetypes";
import { JOUEURS } from "@/lib/data/archetype_joueurs";
import HelpGuide from "@/components/HelpGuide/HelpGuide";
import helpData from "@/data/help_data.json";

/* Mapping nom joueur normalisé → slug interviews-list.json */
function normName(s) {
  return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}
const LIST_SLUG_MAP = (() => {
  const m = {};
  for (const itw of getInterviewsList()) {
    m[normName(itw.joueur)] = itw.slug;
  }
  return m;
})();
const VALID_SLUGS = new Set(getInterviewsList().map(i => i.slug));
function resolveSlug(joueurNom, fallbackSlug) {
  return LIST_SLUG_MAP[normName(joueurNom)] || fallbackSlug;
}
function getDisplayName(player) {
  if (!player) return "";
  if (player.surnom) {
    return `${player.nom} - "${player.surnom}"`;
  }
  return player.nom;
}
import { CATEGORIES, CATEGORIES_BY_ID, MATRICE } from "@/lib/data/categories";
import { withBasePath } from "@/lib/withBasePath";
import styles from "./interviews.module.css";

/* ═══════════════════════════════════════════
   FONTS
   ═══════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Oswald:wght@400;500;600;700;800;900&display=swap');
`;

/* ═══════════════════════════════════════════
   QUOTE MARKS SVG
   ═══════════════════════════════════════════ */
function QuoteIcon({ color, size = 20 }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.78)}
      viewBox="0 0 28 22"
      fill="none"
      className={styles.quoteIcon}
    >
      <path
        d="M0 22V13.2C0 5.86667 3.06667 1.46667 9.2 0L11 3.4C8.46667 4.2 6.86667 5.46667 6.2 7.2C5.8 8.26667 5.73333 9.26667 6 10.2H11.4V22H0ZM16.6 22V13.2C16.6 5.86667 19.6667 1.46667 25.8 0L27.6 3.4C25.0667 4.2 23.4667 5.46667 22.8 7.2C22.4 8.26667 22.3333 9.26667 22.6 10.2H28V22H16.6Z"
        fill={color}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   TRANSITION PHRASES PER THEME
   ═══════════════════════════════════════════ */
const TRANSITION_PHRASES = {
  grands_moments_sportifs: [
    "Schillaci, lui, répond par l\u2019enthousiasme et l\u2019envie de gagner.",
    "Une feinte, une passe lumineuse, un contrôle inattendu : parfois il suffit d\u2019un détail pour transformer un match ordinaire en moment de beauté.",
    "Certains instants dépassent le sport. Voici comment ils les ont vécus.",
    "Quand le stade retient son souffle, seuls les acteurs savent vraiment ce qu\u2019il s\u2019est passé.",
  ],
  technique_jeu: [
    "Une feinte, une passe lumineuse, un contrôle inattendu : parfois il suffit d\u2019un détail pour transformer un match ordinaire en moment de beauté.",
    "Le geste juste au bon moment. Voilà ce qui sépare les grands joueurs des autres.",
    "La technique est un langage. Chacun l\u2019exprime à sa manière.",
  ],
  ressentis_emotions: [
    "Derrière les résultats, il y a des hommes. Leurs émotions racontent une autre histoire du football.",
    "La pression, la joie, la déception : le football se vit d\u2019abord de l\u2019intérieur.",
    "Ce que le score ne dit pas, les mots le révèlent.",
  ],
  parcours_professionnel: [
    "Chaque carrière est un parcours unique, fait de rencontres, de choix et de tournants décisifs.",
    "Du premier ballon aux derniers applaudissements, le chemin est rarement celui qu\u2019on avait imaginé.",
  ],
  vie_equipe: [
    "Un vestiaire, c\u2019est une famille. Avec ses complicités, ses tensions et ses moments de grâce collective.",
    "Le collectif fait la force. Mais il se construit dans les détails du quotidien.",
  ],
  contexte_historique: [
    "Le football s\u2019inscrit dans l\u2019Histoire. Ces témoignages le rappellent.",
    "Au-delà du terrain, c\u2019est une époque tout entière qui se raconte.",
  ],
  ethique_justice: [
    "Le sport pose aussi des questions de justice et d\u2019éthique. Les témoins n\u2019éludent pas.",
    "Fair-play, arbitrage, respect : le football a aussi ses combats moraux.",
  ],
  heritage_posterite: [
    "Que reste-t-il quand les crampons sont raccrochés ? Un héritage, des souvenirs, une trace.",
  ],
  anecdotes_vie_privee: [
    "Les coulisses du football regorgent d\u2019histoires que seuls les acteurs connaissent.",
  ],
  preparation_physique: [
    "Le corps est l\u2019outil du footballeur. L\u2019entretenir, c\u2019est déjà jouer.",
  ],
  connexions: [
    "Le football relie les hommes, les pays, les époques.",
  ],
};

/* ═══════════════════════════════════════════
   GENERAL HELP STEPS (FROM JSON)
   ═══════════════════════════════════════════ */
const GENERAL_HELP_STEPS = helpData.find(p => p.page === "interviews")?.steps || [];

/* ═══════════════════════════════════════════
   PLAYER PHOTOS  (canonical slug → /players/filename)
   ═══════════════════════════════════════════ */

function getTransitionPhrase(themeId, index) {
  const phrases = TRANSITION_PHRASES[themeId] || TRANSITION_PHRASES.grands_moments_sportifs;
  return phrases[index % phrases.length];
}

/* ═══════════════════════════════════════════
   BANNER DATA TOOLING
   ═══════════════════════════════════════════ */
function getReadingTime(text) {
  if (!text) return "1 min";
  const words = text.trim().split(/\s+/).length;
  const time = Math.max(1, Math.ceil(words / 200));
  return `${time} min`;
}

function getBannerData(archetypeId, interviews, activeTheme) {
  const archetype = ARCHETYPES_BY_ID[archetypeId];
  if (!archetype) return null;

  // Pick first interview for metadata if available
  const first = interviews[0];
  if (!first) return { text: `Exploration pour le profil ${archetype.label}. Choisissez un thème pour commencer.` };

  const playerNames = interviews.slice(0, 4).map((i) => i.nom);
  const nameList =
    playerNames.length > 1
      ? playerNames.slice(0, -1).join(", ") + ", et " + playerNames[playerNames.length - 1]
      : playerNames[0] || "";

  const themeLabel = activeTheme ? CATEGORIES_BY_ID[activeTheme]?.label : "nos thématiques";

  return {
    archetypeLabel: archetype.label,
    playerMatch: nameList,
    title: first.titre_interview || "Série Spéciale Mondial",
    date: first.date_publication || "Archives L'Équipe",
    readingTime: getReadingTime(first.displayCitation),
    theme: themeLabel,
    text: `${archetype.label} donc ! Nous vous recommandons sans demi-mesure les citations de ${nameList}.`
  };
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default function InterviewsPage() {
  const router = useRouter();
  const collection = useCollection();
  const [activeTheme, setActiveTheme] = useState(null);
  const [arbStepKey, setArbStepKey] = useState(0);
  const tabsRef = useRef(null);

  /* Removed auto-selection to allow "Show All" mode as default or on reset */

  /* Themes sorted by priority ONLY - ACTIVE theme stays in its rank but we scroll to it */
  const archetypeThemes = useMemo(() => {
    let list = [...CATEGORIES];
    if (collection.archetype && MATRICE[collection.archetype]) {
      const matrice = MATRICE[collection.archetype];
      list.sort((a, b) => (matrice[a.id] ?? 99) - (matrice[b.id] ?? 99));
    }
    return list;
  }, [collection.archetype]);

  /* Scroll active theme into center, or scroll back to start on reset */
  useEffect(() => {
    if (!tabsRef.current) return;

    let target = null;
    if (activeTheme) {
      target = tabsRef.current.querySelector(`.${styles.active}`);
    } else {
      // On reset/initial: target the very first tab
      target = tabsRef.current.firstChild;
    }

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeTheme]);

  const allInterviews = useMemo(() => {
    // 1. Filter players with citations (deduplicate by slug)
    const seen = new Set();
    const playersWithCitations = JOUEURS.filter((p) => {
      if (activeTheme) {
        if (!p.citations?.[activeTheme]?.length) return false;
      } else {
        // Show all if at least one theme has citations
        if (!p.citations || Object.keys(p.citations).length === 0) return false;
      }
      if (seen.has(p.slug)) return false;
      seen.add(p.slug);
      return true;
    });

    // 2. Map and pick best citation + state
    // If activeTheme is null, we pick the citation from the highest priority theme for this archetype
    const mapped = playersWithCitations
      .map((p) => {
        let pool = [];
        let finalTheme = activeTheme;

        if (activeTheme) {
          pool = p.citations[activeTheme] || [];
        } else {
          // Find best theme for this player based on archetype priority
          const bestTheme = archetypeThemes.find(t => p.citations[t.id]?.length > 0);
          if (bestTheme) {
            pool = p.citations[bestTheme.id];
            finalTheme = bestTheme.id;
          }
        }

        if (!pool.length) return null;

        const itemCitation = pool[0]; // Stable for hydration
        const articleSlug = resolveSlug(p.nom, p.slug);
        const isRead = collection.articlesLus.includes(articleSlug);

        return {
          ...p,
          nom: getDisplayName(p),
          slug: articleSlug,
          displayCitation: itemCitation,
          isRead,
          activeTheme: finalTheme, // store which theme was used
        };
      })
      .filter((p) => p !== null && VALID_SLUGS.has(p.slug));

    // 3. Sort: deterministic (safe for SSR hydration)
    const userArchetypeLabel = ARCHETYPES_BY_ID[collection.archetype]?.label;

    return mapped.sort((a, b) => {
      // Priority 1: Unread vs Read (lus en bas)
      if (!a.isRead && b.isRead) return -1;
      if (a.isRead && !b.isRead) return 1;

      // Priority 2: Archetype match (si un archetype est sélectionné)
      if (userArchetypeLabel) {
        const aMatches = a.archetype === userArchetypeLabel;
        const bMatches = b.archetype === userArchetypeLabel;

        // Match unread vs Non-match unread
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
      }

      // Priority 3: Deterministic fallback order
      const aName = normName(a.nom || a.joueur || "");
      const bName = normName(b.nom || b.joueur || "");
      if (aName < bName) return -1;
      if (aName > bName) return 1;
      if (a.slug < b.slug) return -1;
      if (a.slug > b.slug) return 1;
      return 0;
    });
  }, [collection.archetype, collection.articlesLus, activeTheme, archetypeThemes]);

  const archetypeInfo = collection.archetype ? ARCHETYPES_BY_ID[collection.archetype] : null;

  const bannerData = useMemo(() =>
    getBannerData(collection.archetype, allInterviews, activeTheme),
    [collection.archetype, allInterviews, activeTheme]
  );

  /* Arbitre Recommendation Steps */
  const arbitreSteps = useMemo(() => {
    if (!bannerData) return [];
    return [
      {
        text: bannerData.text,
        position: { top: '10%', left: '22%', transform: 'translateX(-50%)' },
        refereeSide: 'left'
      }
    ];
  }, [bannerData]);

  // Open automatically logic
  const [autoOpenArb, setAutoOpenArb] = useState(false);
  const [activeSteps, setActiveSteps] = useState(GENERAL_HELP_STEPS);

  useEffect(() => {
    if (typeof window === 'undefined' || !collection.loaded) return;

    const helpKey = "help_seen_interviews";
    const lastArchKey = "last_archetype_interviews";
    let helpSeen = false;
    let lastArch = null;
    const currentArch = collection.archetype || 'none';

    try {
      helpSeen = window.localStorage.getItem(helpKey) === '1';
      lastArch = window.localStorage.getItem(lastArchKey);
    } catch (e) { }

    const hasBanner = arbitreSteps.length > 0;
    const needHelp = !helpSeen;
    const needBanner = hasBanner && (lastArch !== currentArch);

    if (needHelp || needBanner) {
      // Priorité : Recommandation d'abord si elle existe, puis aide
      let combined = [];
      if (needBanner) {
        combined = [...arbitreSteps];
        // Auto-sélection du thème prioritaire pour cet archétype
        if (archetypeThemes.length > 0) {
          setActiveTheme(archetypeThemes[0].id);
        }
      }
      if (needHelp) combined = [...combined, ...GENERAL_HELP_STEPS];

      if (combined.length > 0) {
        setActiveSteps(combined);
        setAutoOpenArb(true);
        setArbStepKey(prev => prev + 1);
      }

      if (needHelp) {
        try { window.localStorage.setItem(helpKey, '1'); } catch (e) { }
      }
    }

    try { window.localStorage.setItem(lastArchKey, currentArch); } catch (e) { }
  }, [collection.archetype, collection.loaded, arbitreSteps]);

  const handleArbFinish = () => {
    setAutoOpenArb(false);
    // On reset les steps par défaut pour une ouverture manuelle future via le sifflet fixe
    setActiveSteps(GENERAL_HELP_STEPS);
  };

  const CARD_BG = "#FFF1ED";
  const CITATION_COLOR = "#8C6D2F";
  const QUOTE_COLOR = "#8C6D2F";

  return (
    <div className={styles.page}>
      <style>{GLOBAL_CSS}</style>

      {/* ═══ Theme tabs ═══ */}
      <div className={styles.themeTabsContainer}>
        <div className={styles.themesLabelArea}>
          <span className={styles.themesLabel}>Thèmes</span>
          {activeTheme && (
            <button
              className={styles.deselectBtn}
              onClick={() => setActiveTheme(null)}
              title="Réinitialiser le thème"
            >
              <span className={styles.deselectText}>Reset</span>
            </button>
          )}
        </div>
        <div className={styles.themeTabs} ref={tabsRef}>
          {archetypeThemes.map((theme) => {
            const isActive = activeTheme === theme.id;
            return (
              <button
                key={theme.id}
                className={`${styles.themeTab} ${isActive ? styles.active : ""}`}
                onClick={() => setActiveTheme(theme.id)}
              >
                {theme.icon && (
                  <img
                    src={withBasePath(theme.icon)}
                    alt=""
                    className={styles.themeTabIcon}
                  />
                )}
                <span>{theme.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <HelpGuide
        key={arbStepKey}
        steps={activeSteps}
        autoOpen={autoOpenArb}
        onFinish={handleArbFinish}
      />

      {/* ═══ Citations feed ═══ */}
      <main className={styles.feed}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${collection.archetype || "all"}-${activeTheme || "none"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {allInterviews.length > 0 ? (
              allInterviews.map((itw, i) => {
                const photoSrc = itw.image || null;
                return (
                  <div key={itw.slug}>
                    {/* Transition text between cards */}
                    {i > 0 && (
                      <motion.div
                        className={styles.transitionBlock}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 + 0.1 }}
                      >
                        <div className={styles.transitionLine} />
                        <p className={styles.transitionText}>
                          {getTransitionPhrase(itw.activeTheme || "grands_moments_sportifs", i - 1)}
                        </p>
                      </motion.div>
                    )}

                    {/* Citation card */}
                    <motion.article
                      className={`${styles.citationCard} ${itw.isRead ? styles.isRead : ""} ${i % 2 !== 0 ? styles.reverse : ""}`}
                      onClick={() => router.push(`/interviews/${itw.slug}`)}
                      style={{
                        background: CARD_BG,
                      }}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: i * 0.06,
                        duration: 0.35,
                        ease: "easeOut",
                      }}
                    >
                      {/* Player photo */}
                      <div className={styles.photoWrapper}>
                        {photoSrc ? (
                          <img
                            src={withBasePath(photoSrc)}
                            alt={itw.nom}
                            className={styles.photo}
                            loading="lazy"
                          />
                        ) : (
                          <div className={styles.photoPlaceholder}>
                            {itw.nom.charAt(0)}
                          </div>
                        )}
                        {itw.isRead && (
                          <div className={styles.readBadge}>Déjà lu</div>
                        )}
                      </div>

                      {/* Content */}
                      <div className={styles.contentSection}>
                        <div className={styles.cardHeaderMeta}>
                          <h4 className={styles.cardItwTitle}>{itw.titre_interview}</h4>
                          <div className={styles.cardStatsLine}>
                            <span className={styles.cardMetaItem}>{itw.archetype}</span>
                            <span className={styles.cardMetaDivider}>•</span>
                            <span className={styles.cardMetaItem}>{itw.poste}</span>
                            <span className={styles.cardMetaDivider}>•</span>
                            <span className={styles.cardMetaItem}>{itw.temps_lecture || getReadingTime(itw.displayCitation)}</span>
                            <span className={styles.cardMetaDivider}>•</span>
                            <span className={styles.cardMetaItem}>{itw.date_publication}</span>
                          </div>
                        </div>

                        <QuoteIcon color={QUOTE_COLOR} size={22} />
                        <p
                          className={styles.citationText}
                          style={{ color: CITATION_COLOR }}
                        >
                          {itw.displayCitation || "Interview disponible"}
                        </p>

                        <div className={styles.cardFooter}>
                          <div className={styles.playerInfo}>
                            <p className={styles.playerName}>{itw.nom}</p>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  {activeTheme && CATEGORIES_BY_ID[activeTheme]?.emoji}
                </div>
                <h3 className={styles.emptyTitle}>Aucune citation trouvée</h3>
                <p className={styles.emptyText}>
                  Pas encore d&apos;extraits pour le thème{" "}
                  <strong>{activeTheme && CATEGORIES_BY_ID[activeTheme]?.label}</strong>
                  {archetypeInfo && (
                    <> pour le profil <strong>{archetypeInfo.label}</strong></>
                  )}.
                </p>
                <button
                  className={styles.emptyBtn}
                  onClick={() => setActiveTheme(null)}
                >
                  Réinitialiser le filtre
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
