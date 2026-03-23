"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCollection } from "@/hooks/useCollection";
import { getInterviewBySlug, getTexteBrut, getInterviewsList } from "@/lib/data/interviews";
import { filterSectionsForArchetype, CATEGORIES_BY_ID } from "@/lib/data/categories";
import { getArchetypeColor, getArchetypeLabel, ARCHETYPES_BY_ID } from "@/lib/data/archetypes";
import { QUIZ_DATA } from "@/lib/data/quiz";
import HelpGuide from "@/components/HelpGuide/HelpGuide";
import HELP_DATA from "@/data/help_data.json";
import { withBasePath } from "@/lib/withBasePath";
import { CARD_IMAGES } from "@/lib/data/card_images";

/* ─ Design tokens ─────────────────────────────── */
const BG = "#3A3635";
const BG_CARD = "#2C2A29";
const TEXT = "#CCCCCC";
const TEXT_MUTED = "#888888";
const GOLD = "#BA9546";
const SEPARATOR = "rgba(255,255,255,0.10)";
const FONT_TITLE = "'Anek Expanded', 'AnekExpanded', 'DM Sans', sans-serif";
const FONT_BODY = "'DM Sans', sans-serif";
const FONT_INTERTEXT = "'DIN Regular', 'DIN Alternate', 'Bahnschrift', 'Arial Narrow', sans-serif";
const ARTICLE_BG_TEXTURE = withBasePath("/fonts/Fond_antracite.png");
const ARTICLE_FONT_ANEK = withBasePath("/fonts/AnekDevanagari_Expanded-ExtraBold.ttf");

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;0,900;1,400;1,700;1,900&display=swap');
  @font-face {
    font-family: 'Anek Expanded';
    src: url('${ARTICLE_FONT_ANEK}') format('truetype');
    font-weight: 800;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'DIN Regular';
    src: local('DIN Regular'), local('DIN-Regular'), local('DIN Next LT Pro Regular');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
  * { box-sizing: border-box; }
  body { background: ${BG}; font-family: ${FONT_BODY}; }
  .back-btn:hover { color: #fff !important; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  /* Float images for magazine layout */
  .float-img-left {
    float: left;
    width: 42%;
    margin: 4px 20px 12px 0;
    shape-outside: margin-box;
  }
  .float-img-right {
    float: right;
    width: 42%;
    margin: 4px 0 12px 20px;
    shape-outside: margin-box;
  }
  .float-img-left img, .float-img-right img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: contain;
  }

  /* Hero layout: side-by-side on desktop, stacked on mobile */
  .hero-pele {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }
  .hero-pele-text { flex: 1 1 0; min-width: 0; }
  .hero-pele-photo { flex-shrink: 0; width: 42%; max-width: 260px; }
  .hero-pele-photo img { width: 100%; height: auto; display: block; object-fit: contain; }

  /* Side-quote + photo: 2 columns on desktop */
  .side-quote-block {
    display: flex;
    gap: 16px;
    align-items: flex-end;
    margin: 24px 0;
  }
  .side-quote-text { flex: 1 1 55%; }
  .side-quote-photo { flex-shrink: 0; width: 42%; max-width: 240px; }
  .side-quote-photo img { width: 100%; height: auto; object-fit: contain; display: block; }

  /* Mobile overrides */
  @media (max-width: 600px) {
    .float-img-left {
      float: left;
      width: 38%;
      margin: 4px 14px 10px 0;
    }
    .float-img-right {
      float: right;
      width: 38%;
      margin: 4px 0 10px 14px;
    }
    .float-img-left img, .float-img-right img {
      max-height: 280px;
    }
    .hero-pele {
      flex-direction: column;
    }
    .hero-pele-photo {
      width: 60%;
      max-width: 220px;
      margin: 0 auto;
    }
    .side-quote-block {
      flex-direction: column;
      align-items: stretch;
    }
    .side-quote-photo {
      width: 60%;
      max-width: 200px;
      margin: 8px auto 0;
    }
  }
  /* Clearfix */
  .clearfix::after { content: ''; display: table; clear: both; }

  /* Zico citation blocks */
  .zico-quote-block {
    display: flex;
    gap: 20px;
    align-items: center;
  }
  .zico-quote-text { flex: 1 1 55%; }
  .zico-quote-photo { flex-shrink: 0; width: 38%; max-width: 220px; }
  .zico-quote-photo img { width: 100%; height: auto; object-fit: contain; display: block; }
  @media (max-width: 600px) {
    .zico-quote-block { flex-direction: column; align-items: stretch; }
    .zico-quote-photo { width: 65%; max-width: 180px; margin: 12px auto 0; }
  }
`;

/* ─ Photo helpers ──────────────────────────────── */
const PELE_PHOTOS = [
    'pelé-itw-0.png',
    'pelé-itw-1.png',
    'pelé-itw-2.png',
    'pelé-itw-3.png',
    'pelé-itw-4.png',
].map(f => withBasePath(`/photoArticle/Pele/${encodeURIComponent(f)}`));

const ZICO_PHOTOS = [
    'Zica-B.png',
    'zico-1.png',
    'Zico-c.png',
    'Zico-d.png',
    'zico-e.png',
].map(f => withBasePath(`/photoArticle/Zico/${encodeURIComponent(f)}`));

const PLATINI_PHOTOS = [
    'platini.png',
    'platini-2.png',
    'platini-3a.png',
    'platini-2.png',
    'platini-3a.png',
].map(f => withBasePath(`/photoArticle/Platini/${encodeURIComponent(f)}`));

const ZICO_BLUE = "#4A5AFF";
const ZICO_CITATIONS = [
    { key: "ce penalty manqué ne m", text: "Ce penalty manqué ne m'a jamais empêché de dormir", photo: withBasePath("/photoArticle/Zico/Zica-B.png"), side: "right" },
    { key: "par moments, il faut une maturité", text: "Par moments, il faut une maturité et une stratégie pour atteindre un résultat précis. En 1986, c'était spécial. Cette Coupe du monde, je ne voulais pas la jouer…", photo: withBasePath("/photoArticle/Zico/zico-1.png"), side: "left" },
    { key: "tout ça pour dire que le foot", text: "Tout ça pour dire que le foot est ainsi : vous êtes un héros un jour et un mauvais le lendemain.", photo: withBasePath("/photoArticle/Zico/Zico-c.png"), side: "right" },
    { key: "c'est une belle galerie de joueurs", text: "C'est une belle galerie de joueurs offensifs, à laquelle on peut ajouter Ferenc Puskas, l'attaquant de la Hongrie des années 1950.", photo: withBasePath("/photoArticle/Zico/Zico-d.png"), side: "left" },
    { key: "mais le foot, depuis, a évolué", text: "Mais le foot, depuis, a évolué vers plus de technique collective.", photo: withBasePath("/photoArticle/Zico/zico-e.png"), side: "right" },
    { key: "pour savoir quelle trace a laissé", text: "Pour savoir quelle trace a laissé un joueur, il faut voir son palmarès, mais aussi sa régularité et les difficultés qu'il a surmontées.", photo: withBasePath("/photoArticle/Zico/Zica-B.png"), side: "left" },
];

const PLATINI_CITATIONS = [
    {
        text: "Je ne faisais pas le malin. Je m'en souviens comme si c'était hier. Je n'avais rien à gagner dans cette affaire, j'avais tout à perdre.",
        photo: withBasePath("/photoArticle/Platini/platini-2.png"),
        side: "right",
    },
    {
        text: "En 1982, j'avais une pubalgie.",
        photo: withBasePath("/photoArticle/Platini/platini-3a.png"),
        side: "left",
    },
    {
        text: "En 1986, j'avais un œuf de pigeon sur le pied. J'avais coupé le haut de ma chaussure pour ne pas que ça frotte. Mais je ne pouvais pas m'arrêter, parce qu'on jouait le titre avec la Juventus.",
        photo: withBasePath("/photoArticle/Platini/platini.png"),
        side: "right",
    },
    {
        text: "Ce n'est pas facile d'aller à une Coupe du monde en étant le meilleur joueur du monde et en sachant qu'on ne va pas être bon.",
        photo: withBasePath("/photoArticle/Platini/platini-2.png"),
        side: "left",
    },
];

function getPlayerPhotoUrls(slug) {
    const s = (slug || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (s.includes('pele') || s.includes('pelé')) return PELE_PHOTOS;
    if (s.includes('zico')) return ZICO_PHOTOS;
    if (s.includes('platini')) return PLATINI_PHOTOS;
    return [];
}

/* ─ Text parsing ───────────────────────────────── */
function extractInlineCitations(text) {
    if (!text) return [];
    const patterns = [/«\s*([^»]{30,}?)\s*»/g, /"\s*([^"]{30,}?)\s*"/g];
    const accepted = [];
    for (const pattern of patterns) {
        let m;
        while ((m = pattern.exec(text)) !== null) {
            const cit = m[1].trim();
            if (cit.length >= 30 && cit.length <= 300) {
                const norm = s => s.toLowerCase().replace(/[^a-z0-9àâçéèêëîïôûùüÿñæœ]/g, '');
                if (!accepted.some(e => norm(e).includes(norm(cit)) || norm(cit).includes(norm(e)))) {
                    accepted.push(cit);
                }
            }
        }
    }
    return accepted.slice(0, 6);
}

function parseInlineQAFromContinuousText(text) {
    const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
    if (!cleaned) return [];

    const qaDelim = /\?\s*[–—-]\s*/g;
    const delimiters = [];
    let match;
    while ((match = qaDelim.exec(cleaned)) !== null) {
        delimiters.push({ qMarkIdx: match.index, delimEndIdx: qaDelim.lastIndex });
    }
    if (!delimiters.length) return [];

    const questionStarts = [];
    for (let i = 0; i < delimiters.length; i += 1) {
        const prevBoundary = i === 0 ? 0 : delimiters[i - 1].delimEndIdx;
        const qEnd = delimiters[i].qMarkIdx + 1;
        const segment = cleaned.slice(prevBoundary, qEnd);

        let bestStartLocal = 0;
        const sentenceBreak = /(?:[.!?…]|»)\s+(?=[A-ZÀ-ÖØ-Ý«"(])/g;
        let b;
        while ((b = sentenceBreak.exec(segment)) !== null) {
            bestStartLocal = b.index + b[0].length;
        }

        const candidate = segment.slice(bestStartLocal).trim();
        const useCandidate = candidate.length >= 12 && candidate.length <= 420;
        questionStarts.push(useCandidate ? prevBoundary + bestStartLocal : prevBoundary);
    }

    const items = [];
    if (questionStarts[0] > 0) {
        const intro = cleaned.slice(0, questionStarts[0]).trim();
        if (intro) items.push({ type: 'text', content: intro });
    }

    for (let i = 0; i < delimiters.length; i += 1) {
        const qStart = questionStarts[i];
        const qEnd = delimiters[i].qMarkIdx + 1;
        const q = cleaned.slice(qStart, qEnd).trim();
        if (q) items.push({ type: 'question', content: q });

        const rStart = delimiters[i].delimEndIdx;
        const rEnd = i + 1 < delimiters.length ? questionStarts[i + 1] : cleaned.length;
        const r = cleaned.slice(rStart, rEnd).trim();
        if (r) items.push({ type: 'response', content: r });
    }

    return items;
}

function parseArticleText(text) {
    if (!text) return [];
    let cleaned = text;
    const start = cleaned.search(/DE NOTRE ENVOYÉ|DE NOTRE ENVOYÉE|SPÉCIAL\s+«/i);
    if (start > 0 && start < 1500) cleaned = cleaned.substring(start);

    if (/\?\s*[–—-]\s*/.test(cleaned)) {
        const collapsed = cleaned.replace(/\n+/g, ' ');
        const qaItems = parseInlineQAFromContinuousText(collapsed);
        if (qaItems.length >= 2) return qaItems;
    }

    const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);
    const paras = [];
    let cur = { type: 'text', content: '' };
    let past = false;

    for (const line of lines) {
        if (!past) {
            if (line.match(/^(Média|Rubrique|Catégorie|Date|Page\s*\d|Visualiser|ARTICLE|\d+-\d+-\d+-\d+)/i)) continue;
            if (line.match(/^\d+ (janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i)) continue;
            if (line.match(/^(Portrait|Entretien|FOOTBALL|L'Equipe)/i) && line.length < 80) continue;
            if (line.match(/^\| Date\s*:/)) continue;
            if (line.match(/^[A-Z\s:.|–\-]{3,}$/) && line.length < 60) continue;
            if (line.length > 40) past = true;
        }
        const isQ = line.endsWith('?') && !line.startsWith('–') && !line.startsWith('—');
        const isR = line.startsWith('–') || line.startsWith('— ');

        if (isQ) {
            if (cur.content) paras.push({ ...cur });
            cur = { type: 'question', content: line };
        } else if (isR) {
            if (cur.content) paras.push({ ...cur });
            cur = { type: 'response', content: line.replace(/^[–—]\s*/, '') };
        } else {
            if (cur.type === 'response' || cur.type === 'question') {
                cur.content += ' ' + line;
            } else {
                if (cur.content) paras.push({ ...cur });
                cur = { type: 'text', content: line };
            }
        }
    }
    if (cur.content) paras.push({ ...cur });
    return paras;
}

/* ─ Skeleton ───────────────────────────────────── */
function ArticleSkeleton() {
    return (
        <div style={{ padding: "24px 20px" }}>
            {[100, 60, 90, 80, 100, 40, 85].map((w, i) => (
                <motion.div key={i}
                    style={{ height: i % 3 === 0 ? 14 : 11, width: `${w}%`, background: "#2a2a2a", borderRadius: 2, marginBottom: i % 3 === 0 ? 18 : 8 }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.08 }}
                />
            ))}
        </div>
    );
}

/* ─ Reward Screen ──────────────────────────────── */
function RewardScreen({ interview, color, onCollection, onBack }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsFlipped(true);
            if (audioRef.current) {
                audioRef.current.volume = 0.4;
                audioRef.current.play().catch(e => console.log("Audio play blocked", e));
            }
        }, 400);
        return () => clearTimeout(timer);
    }, []);
    const cardUrl = interview?.slug ? withBasePath(`/cartes/${CARD_IMAGES[interview.slug]}`) : null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: "fixed", inset: 0, zIndex: 9999,
                background: "radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "32px 24px",
                fontFamily: FONT_BODY,
                overflow: "hidden"
            }}
        >
            {/* Ambient Background Glow */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{
                    position: "absolute", width: 400, height: 400,
                    borderRadius: "50%", background: color,
                    filter: "blur(120px)", pointerEvents: "none", zIndex: 0
                }}
            />

            <motion.p
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", color: color, textTransform: "uppercase", marginBottom: 8, zIndex: 1 }}
            >
                Nouveau Trésor Débloqué
            </motion.p>

            <motion.h2
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                style={{ fontSize: 32, fontWeight: 900, color: "#fff", textTransform: "uppercase", textAlign: "center", marginBottom: 40, fontFamily: FONT_TITLE, zIndex: 1 }}
            >
                {interview?.joueur}
            </motion.h2>

            {/* Sound Effect */}
            <audio ref={audioRef} src={withBasePath("/home/sons/tadam.mp3")} preload="auto" />

            {/* Premium Card Display */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    rotateY: isFlipped ? 0 : 180,
                    y: [0, -10, 0]
                }}
                transition={{
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.3 },
                    rotateY: { duration: 0.8, ease: "easeOut" },
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{
                    width: 280, height: 400,
                    position: "relative",
                    zIndex: 2,
                    perspective: 1000,
                    marginBottom: 48,
                    transformStyle: "preserve-3d"
                }}
            >
                {/* Back of the card */}
                <div style={{
                    position: "absolute", inset: 0,
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    zIndex: isFlipped ? 1 : 2
                }}>
                    <img
                        src={withBasePath("/cartes/Dos de carte collection.png")}
                        alt="Back of card"
                        style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 16 }}
                    />
                </div>

                {/* Front of the card */}
                <div style={{
                    position: "absolute", inset: 0,
                    backfaceVisibility: "hidden",
                    zIndex: isFlipped ? 2 : 1,
                    opacity: isFlipped ? 1 : 0,
                    transition: "opacity 0.3s ease-in-out"
                }}>
                    {/* Shiny Effect Overlay */}
                    <motion.div
                        animate={{ x: ["-100%", "100%", "100%"], opacity: [0, 0.8, 0] }}
                        transition={{ repeat: Infinity, duration: 3, delay: 1.5 }}
                        style={{
                            position: "absolute", inset: 0,
                            background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
                            zIndex: 3, pointerEvents: "none",
                            transform: "skewX(-20deg)",
                            borderRadius: 16
                        }}
                    />

                    <img
                        src={cardUrl}
                        alt={interview?.joueur}
                        style={{
                            width: "100%", height: "100%",
                            objectFit: "contain",
                            filter: "drop-shadow(0 0 30px rgba(0,0,0,0.8))",
                            borderRadius: 16
                        }}
                        onError={(e) => {
                            e.target.src = withBasePath("/cartes/Dos de carte collection.png");
                        }}
                    />
                </div>

                {/* Outer Glow */}
                <div style={{
                    position: "absolute", inset: -2, border: `2px solid ${color}40`,
                    borderRadius: 18, pointerEvents: "none", zIndex: 1,
                    boxShadow: `0 0 50px ${color}30`
                }} />
            </motion.div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 300, zIndex: 3 }}>
                <motion.button
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                    onClick={onCollection}
                    style={{
                        padding: "16px 24px", background: color, color: "#fff",
                        border: "none", borderRadius: 12, fontSize: 18, fontWeight: 700,
                        cursor: "pointer", boxShadow: `0 8px 32px ${color}40`,
                        fontFamily: FONT_BODY, transition: "transform 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                    Conserver dans ma collection
                </motion.button>

                <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 1 }}
                    onClick={onBack}
                    style={{
                        padding: "12px", background: "transparent", color: "#fff",
                        border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12,
                        fontSize: 14, fontWeight: 500, cursor: "pointer",
                        fontFamily: FONT_BODY
                    }}
                >
                    Retour à l'interview
                </motion.button>
            </div>
        </motion.div>
    );
}

/* ─ Quiz Section Component ────────────────────── */
function QuizSection({ quiz, onWin, color }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isWrong, setIsWrong] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    if (!quiz || !quiz.questions || quiz.questions.length === 0) return null;

    const currentQuestion = quiz.questions[currentStep];

    const handleOptionSelect = (key) => {
        if (isWrong || isFinished) return;
        setSelectedOption(key);

        if (key === currentQuestion.reponse) {
            if (currentStep < quiz.questions.length - 1) {
                setTimeout(() => {
                    setCurrentStep(prev => prev + 1);
                    setSelectedOption(null);
                }, 600);
            } else {
                setIsFinished(true);
                setTimeout(onWin, 800);
            }
        } else {
            setIsWrong(true);
            setTimeout(() => {
                setIsWrong(false);
                setSelectedOption(null);
            }, 1000);
        }
    };

    return (
        <div style={{ padding: "40px 20px", background: "rgba(0,0,0,0.2)", borderRadius: 16, marginTop: 40 }}>
            <div style={{ textAlign: "center", marginBottom: 30 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: color, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Quiz de connaissance
                </span>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginTop: 8, fontFamily: FONT_TITLE }}>
                    Répondez juste pour gagner la carte
                </h3>
                <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
                    {quiz.questions.map((_, i) => (
                        <div key={i} style={{
                            width: 24, height: 4,
                            background: i <= currentStep ? color : "rgba(255,255,255,0.1)",
                            borderRadius: 2,
                            transition: "all 0.3s"
                        }} />
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <p style={{ fontSize: 22, color: "#fff", fontWeight: 500, marginBottom: 24, textAlign: "center", lineHeight: 1.4 }}>
                        {currentQuestion.question}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {Object.entries(currentQuestion.options).map(([key, text]) => {
                            const isSelected = selectedOption === key;
                            const isCorrect = isSelected && key === currentQuestion.reponse;
                            const isError = isSelected && key !== currentQuestion.reponse;

                            return (
                                <button
                                    key={key}
                                    onClick={() => handleOptionSelect(key)}
                                    style={{
                                        padding: "16px 20px",
                                        borderRadius: 12,
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        background: isCorrect ? "#2e7d32" : (isError ? "#c62828" : "rgba(255,255,255,0.05)"),
                                        color: "#fff",
                                        textAlign: "left",
                                        fontSize: 18,
                                        cursor: isFinished ? "default" : "pointer",
                                        transition: "all 0.2s",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        fontFamily: FONT_BODY
                                    }}
                                >
                                    <span style={{
                                        width: 28, height: 28, borderRadius: "50%",
                                        background: "rgba(255,255,255,0.1)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 14, fontWeight: 700
                                    }}>
                                        {key}
                                    </span>
                                    {text}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

/* ─ Main component ─────────────────────────────── */
export default function InterviewDetailPage() {
    const params = useParams();
    const router = useRouter();
    const collection = useCollection();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [texteBrut, setTexteBrut] = useState(null);
    const [textLoading, setTextLoading] = useState(false);
    const [activeSection, setActiveSection] = useState(null);
    const [showReward, setShowReward] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [navHeight, setNavHeight] = useState(64);
    const [showHalftimeFlash, setShowHalftimeFlash] = useState(false);
    const [isReadingDone, setIsReadingDone] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const halftimeShownRef = useRef(false);

    const slug = params.slug;

    const listIndex = useMemo(() => {
        const list = getInterviewsList();
        const entry = list.find(i => i.slug === slug);
        return entry?.index ?? null;
    }, [slug]);

    const quizData = useMemo(() => {
        if (!slug) return null;
        // Search by inclusion to handle slugs like 'pele-1958' vs 'pele'
        return QUIZ_DATA.find(q =>
            slug === q.slug ||
            slug.startsWith(q.slug + '-') ||
            q.slug === slug.split('-')[0]
        );
    }, [slug]);

    // Scroll progress + navbar height tracker
    useEffect(() => {
        const onScroll = () => {
            const scrolled = window.scrollY;
            const total = document.documentElement.scrollHeight - window.innerHeight;
            const progress = total > 0 ? Math.min(scrolled / total, 1) : 0;
            setScrollProgress(progress);
            if (progress > 0.90) setIsReadingDone(true);
            const nav = document.querySelector('header');
            if (nav) setNavHeight(nav.offsetHeight);
        };
        // measure on mount
        const nav = document.querySelector('header');
        if (nav) setNavHeight(nav.offsetHeight);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Trigger halftime flash once when crossing 45'
    useEffect(() => {
        const minute = Math.round(scrollProgress * 90);
        if (!halftimeShownRef.current && minute >= 45 && minute < 90) {
            halftimeShownRef.current = true;
            setShowHalftimeFlash(true);
        }
    }, [scrollProgress]);

    // Auto-hide halftime flash after 1.5s
    useEffect(() => {
        if (!showHalftimeFlash) return;
        const timer = setTimeout(() => setShowHalftimeFlash(false), 1500);
        return () => clearTimeout(timer);
    }, [showHalftimeFlash]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getInterviewBySlug(slug).then(data => {
            if (!cancelled) { setInterview(data); setLoading(false); }
        });
        return () => { cancelled = true; };
    }, [slug]);

    useEffect(() => {
        if (listIndex === null) return;
        let cancelled = false;
        setTextLoading(true);
        getTexteBrut(listIndex).then(text => {
            if (!cancelled) { setTexteBrut(text); setTextLoading(false); }
        });
        return () => { cancelled = true; };
    }, [listIndex]);

    useEffect(() => {
        if (interview && slug) collection.marquerLu(slug);
    }, [interview, slug]);

    const primaryArchetype = interview?.archetypes?.[0];
    const color = getArchetypeColor(primaryArchetype) || "#E2001A";

    const sections = useMemo(() => {
        if (!interview?.article_structure?.sections_thematiques) return [];
        const raw = interview.article_structure.sections_thematiques.filter(s => s.present !== false);
        return filterSectionsForArchetype(collection.archetype, raw);
    }, [interview, collection.archetype]);

    const navItems = useMemo(() => {
        if (!interview?.article_structure?.navigation_thematiques) return [];
        return interview.article_structure.navigation_thematiques
            .filter(n => n.present)
            .filter(n => !collection.archetype || sections.map(s => s.id).includes(n.id));
    }, [interview, collection.archetype, sections]);

    const articleParagraphs = useMemo(() => parseArticleText(texteBrut), [texteBrut]);
    const inlineCitations = useMemo(() => extractInlineCitations(texteBrut), [texteBrut]);

    // Portrait : priorité à l'image du joueur (archetype_joueurs), fallback mapping legacy
    const portraitUrl = useMemo(() => {
        const heroImage = interview?.article_structure?.hero?.image?.url;
        if (heroImage) return withBasePath(heroImage);
        return null;
    }, [interview?.article_structure?.hero?.image?.url]);

    const articleSlug = interview?.slug || slug;
    const isPeleArticle = useMemo(() => {
        const s = (articleSlug || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        return s.includes('pele');
    }, [articleSlug]);
    const isZicoArticle = useMemo(() => {
        const s = (articleSlug || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        return s.includes('zico');
    }, [articleSlug]);
    const isPlatiniArticle = useMemo(() => {
        const s = (articleSlug || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        return s.includes('platini');
    }, [articleSlug]);

    // Body photos : pour Pelé et Zico (dossiers /photoArticle/Pele/ et /photoArticle/Zico/)
    const allPlayerPhotos = useMemo(() => getPlayerPhotoUrls(articleSlug), [articleSlug]);
    const hasArticlePhotos = allPlayerPhotos.length > 0;
    // First photo goes in the hero area, rest go in the body
    const articleHeroPhoto = hasArticlePhotos ? allPlayerPhotos[0] : null;
    const bodyPhotos = hasArticlePhotos ? allPlayerPhotos.slice(1, 5) : [];

    // Build article content: paragraphs with float-images and pull quotes
    const contentItems = useMemo(() => {
        if (!articleParagraphs.length) return [];

        const items = articleParagraphs.map(p => ({ kind: "para", ...p }));
        const total = items.length;

        // Extract an emotional side-quote from the article
        const getSideQuote = () => {
            if (!hasArticlePhotos) return null;
            const corpus = items
                .filter(it => it.type === "response" || it.type === "text")
                .map(it => it.content)
                .join(" ");
            if (!corpus) return null;
            // Pelé-specific pattern
            if (isPeleArticle) {
                const fatherCrying = corpus.match(/(Encore aujourd[‘\u2018\u2019]hui[^]*?pleurer\.)/i);
                if (fatherCrying?.[1] && fatherCrying[1].length <= 500) return fatherCrying[1].trim();
            }
            // Generic: find a strong emotional sentence (50–300 chars)
            const sentences = corpus.match(/[^.!?]{50,300}[.!?]/g) || [];
            const emotional = sentences.find(s =>
                /jamais|toujours|encore|souffert|heureux|rêve|fier|douleur|victoire|défaite/i.test(s)
            );
            return emotional ? emotional.trim() : null;
        };
        const articleSideQuote = isPlatiniArticle ? null : getSideQuote();

        // Pull quotes: gold citations distributed in the text
        const pullQuotes = isPlatiniArticle ? [] : inlineCitations
            .filter(c => c.length >= 40 && c.length <= 220)
            .slice(0, 3);

        // Attach float images to specific paragraphs (for players with article photos)
        if (hasArticlePhotos && bodyPhotos.length > 0) {
            const floatSlots = [
                { pos: Math.floor(total * 0.15), side: "right", url: bodyPhotos[0] },
                { pos: Math.floor(total * 0.40), side: "left", url: bodyPhotos[1] },
                { pos: Math.floor(total * 0.62), side: "left", url: bodyPhotos[2], quoteText: articleSideQuote },
                { pos: Math.floor(total * 0.82), side: "left", url: bodyPhotos[3] },
            ].filter(s => s.url);

            floatSlots.forEach(slot => {
                const idx = Math.min(Math.max(slot.pos, 0), items.length - 1);
                items[idx].floatImg = { side: slot.side, url: slot.url };
                if (slot.quoteText) items[idx].sideQuote = slot.quoteText;
            });
        }

        // Insert pull quotes as separate items
        const quoteSlots = [0.3, 0.55, 0.78];
        const insertions = [];
        pullQuotes.forEach((text, idx) => {
            if (idx < quoteSlots.length) {
                insertions.push({ pos: Math.floor(total * quoteSlots[idx]) + 1, kind: "pullquote", text });
            }
        });

        // Zico: insert citation blocks anchored to matching paragraphs
        if (isZicoArticle) {
            ZICO_CITATIONS.forEach(cite => {
                const needle = cite.key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const targetIdx = items.findIndex(it =>
                    (it.content || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(needle)
                );
                if (targetIdx >= 0) {
                    insertions.push({ pos: targetIdx + 1, kind: "zicoquote", text: cite.text, photo: cite.photo, side: cite.side });
                }
            });
        }

        if (isPlatiniArticle) {
            const platiniSlots = [0.24, 0.43, 0.64, 0.82];
            PLATINI_CITATIONS.forEach((cite, idx) => {
                const pos = Math.floor(total * (platiniSlots[idx] ?? 0.82)) + 1;
                insertions.push({ pos, kind: "platiniquote", text: cite.text, photo: cite.photo, side: cite.side });
            });
        }

        insertions.sort((a, b) => b.pos - a.pos);
        const result = [...items];
        insertions.forEach(({ pos, kind, text, photo, side }) => {
            result.splice(Math.min(Math.max(pos, 1), result.length), 0, { kind, text, photo, side });
        });

        return result;
    }, [articleParagraphs, bodyPhotos, inlineCitations, isPeleArticle, isZicoArticle, isPlatiniArticle, hasArticlePhotos]);

    const handleCollect = useCallback(() => {
        if (slug) {
            collection.collecterCarte(slug);
            setShowReward(true);
        }
    }, [slug, collection]);

    const isCollected = slug ? collection.estCollectee(slug) : false;
    const hasFullText = texteBrut && texteBrut.length > 100;
    const hasSections = sections.length > 0;

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", backgroundColor: BG, backgroundImage: `url('${ARTICLE_BG_TEXTURE}')`, backgroundRepeat: "repeat", backgroundAttachment: "fixed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <motion.div
                    style={{ width: 36, height: 36, border: "3px solid #333", borderTopColor: color, borderRadius: "50%" }}
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                />
            </div>
        );
    }

    if (!interview) {
        return (
            <div style={{ minHeight: "100vh", backgroundColor: BG, backgroundImage: `url('${ARTICLE_BG_TEXTURE}')`, backgroundRepeat: "repeat", backgroundAttachment: "fixed", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                <p style={{ fontSize: 16, color: TEXT_MUTED }}>Interview introuvable</p>
                <button className="back-btn" onClick={() => router.back()}
                    style={{ color: TEXT_MUTED, fontWeight: 700, cursor: "pointer", background: "none", border: "none", transition: "color 0.2s", fontSize: 14 }}>
                    ← Retour
                </button>
            </div>
        );
    }

    const hero = interview.article_structure?.hero;

    return (
        <div style={{ minHeight: "100vh", backgroundColor: BG, backgroundImage: `url('${ARTICLE_BG_TEXTURE}')`, backgroundRepeat: "repeat", backgroundAttachment: "fixed", fontFamily: "'DM Sans', sans-serif", color: TEXT }}>
            <style>{GLOBAL_CSS}</style>

            {/* ═══ Reward Screen ═══ */}
            <AnimatePresence>
                {showReward && (
                    <RewardScreen
                        interview={interview}
                        color={color}
                        onCollection={() => router.push("/collection")}
                        onBack={() => router.back()}
                    />
                )}
            </AnimatePresence>

            {/* ═══ Compact Header ═══ */}
            <div style={{ background: BG_CARD, borderBottom: `1px solid ${SEPARATOR}`, position: "fixed", top: navHeight, left: 0, right: 0, zIndex: 2000 }}>
                <div style={{ maxWidth: 780, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <button className="back-btn" onClick={() => router.back()}
                        style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", fontSize: 12, fontWeight: 600, color: TEXT_MUTED, cursor: "pointer", transition: "color 0.2s", flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>

                    <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `2px solid ${color}40` }}>
                        {portraitUrl ? (
                            <img src={portraitUrl} alt={interview.joueur} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            <div style={{ width: "100%", height: "100%", background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontSize: 18 }}>⚽</span>
                            </div>
                        )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", textTransform: "uppercase", fontFamily: FONT_INTERTEXT, letterSpacing: "0.04em", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {interview.joueur}
                        </p>
                        <p style={{ fontSize: 10, color: TEXT_MUTED, marginTop: 1, fontFamily: FONT_INTERTEXT }}>{interview.mondial} · {interview.pays}</p>
                    </div>

                    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        {(() => {
                            const minute = Math.min(90, Math.round(scrollProgress * 90));
                            const label = minute >= 90
                                ? "FIN DU MATCH"
                                : (showHalftimeFlash ? "MI-TEMPS" : `${minute}'`);
                            return (
                                <span style={{ fontSize: 14, fontWeight: 700, color: color, fontFamily: FONT_INTERTEXT, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
                                    {label}
                                </span>
                            );
                        })()}
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 20px 0", paddingTop: 80 }}>
                {/* Hero layout: title + intro LEFT, photo RIGHT (stacks on mobile) */}
                {articleHeroPhoto ? (
                    <div className="hero-pele">
                        <div className="hero-pele-text">
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                                {interview.archetypes?.map(a => (
                                    <span key={a} style={{ padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: `${getArchetypeColor(a)}15`, color: getArchetypeColor(a), border: `1px solid ${getArchetypeColor(a)}30`, fontFamily: FONT_INTERTEXT }}>
                                        {getArchetypeLabel(a)}
                                    </span>
                                ))}
                            </div>
                            <h1 style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1, color: "#fff", fontFamily: FONT_TITLE, textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: 8 }}>
                                {hero?.titre || interview.titre_interview}
                            </h1>
                            <p style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 12, letterSpacing: "0.03em", fontFamily: FONT_INTERTEXT }}>
                                {interview.date_publication && `${interview.date_publication} · `}{interview.joueur} · Coupe du Monde {interview.mondial}
                            </p>
                            {interview.resume && (
                                <p style={{ fontSize: 14, lineHeight: 1.5, color: TEXT, fontWeight: 400, marginBottom: 0, fontFamily: FONT_BODY }}>
                                    {interview.resume}
                                </p>
                            )}
                        </div>

                        <motion.div className="hero-pele-photo"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                        >
                            <img src={articleHeroPhoto} alt={interview.joueur} />
                        </motion.div>
                    </div>
                ) : (
                    <>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                            {interview.archetypes?.map(a => (
                                <span key={a} style={{ padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: `${getArchetypeColor(a)}15`, color: getArchetypeColor(a), border: `1px solid ${getArchetypeColor(a)}30`, fontFamily: FONT_INTERTEXT }}>
                                    {getArchetypeLabel(a)}
                                </span>
                            ))}
                        </div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, color: "#fff", fontFamily: FONT_TITLE, textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: 12 }}>
                            {hero?.titre || interview.titre_interview}
                        </h1>
                        <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 32, letterSpacing: "0.03em", fontFamily: FONT_INTERTEXT }}>
                            {interview.date_publication && `${interview.date_publication} · `}{interview.joueur} · Coupe du Monde {interview.mondial}
                        </p>
                        <div style={{ height: 1, background: SEPARATOR, marginBottom: 32 }} />
                        {interview.resume && (
                            <p style={{ fontSize: 26, lineHeight: 1.5, color: TEXT, fontWeight: 400, marginBottom: 32, fontFamily: FONT_BODY }}>
                                {interview.resume}
                            </p>
                        )}
                    </>
                )}

                {interview.citation_forte && (
                    <blockquote style={{ margin: "0 0 28px", padding: 0, border: "none" }}>
                        <p style={{ fontSize: 24, lineHeight: 1.45, color: color, fontStyle: "italic", fontFamily: FONT_BODY, fontWeight: 900, marginBottom: 12 }}>
                            <span style={{ fontSize: 28, fontWeight: 900, opacity: 0.7, marginRight: 4, verticalAlign: "super", lineHeight: 0 }}>{"\u201E"}</span>
                            {interview.citation_forte}
                            <span style={{ fontSize: 28, fontWeight: 900, opacity: 0.7, marginLeft: 4, verticalAlign: "super", lineHeight: 0 }}>{"\u201E"}</span>
                        </p>
                        <p style={{ fontSize: 12, fontWeight: 400, color: TEXT_MUTED, fontFamily: FONT_INTERTEXT, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            — {interview.joueur}
                        </p>
                    </blockquote>
                )}
                <div style={{ height: 1, background: SEPARATOR, marginBottom: 36 }} />
            </div>

            <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 0 100px" }}>
                {textLoading && <ArticleSkeleton />}
                {hasFullText && !textLoading && (
                    <div style={{ padding: "0 20px" }}>
                        <div style={{ padding: "0 0 24px", display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 3, height: 20, background: color, flexShrink: 0 }} />
                            <span style={{ fontSize: 11, fontWeight: 400, color: color, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: FONT_INTERTEXT }}>
                                L'interview intégrale
                            </span>
                        </div>
                        <div className="clearfix">
                            {contentItems.map((item, i) => {
                                if (item.kind === "zicoquote") {
                                    const photoLeft = item.side === "left";
                                    const photoEl = (
                                        <div className="zico-quote-photo">
                                            <img src={item.photo} alt="Zico" style={{ filter: "grayscale(100%) sepia(100%) hue-rotate(200deg) saturate(3) brightness(0.85)" }} />
                                        </div>
                                    );
                                    const quoteEl = (
                                        <blockquote className="zico-quote-text" style={{ margin: 0, padding: 0, border: "none" }}>
                                            <p style={{ margin: 0, fontSize: 22, lineHeight: 1.45, color: ZICO_BLUE, fontStyle: "italic", fontFamily: FONT_BODY, fontWeight: 900 }}>
                                                <span style={{ fontSize: 30, fontWeight: 900, opacity: 0.6, marginRight: 3, verticalAlign: "super", lineHeight: 0 }}>{"\u201C"}</span>
                                                {item.text}
                                                <span style={{ fontSize: 30, fontWeight: 900, opacity: 0.6, marginLeft: 3, verticalAlign: "super", lineHeight: 0 }}>{"\u201D"}</span>
                                            </p>
                                        </blockquote>
                                    );
                                    return (
                                        <div key={`zq-${i}`} style={{ margin: "40px 0", padding: "24px", background: `${ZICO_BLUE}12`, borderLeft: photoLeft ? "none" : `3px solid ${ZICO_BLUE}`, borderRight: photoLeft ? `3px solid ${ZICO_BLUE}` : "none", clear: "both" }}>
                                            <div className="zico-quote-block">
                                                {photoLeft ? photoEl : quoteEl}
                                                {photoLeft ? quoteEl : photoEl}
                                            </div>
                                        </div>
                                    );
                                }
                                if (item.kind === "pullquote") {
                                    return (
                                        <blockquote key={`pq-${i}`} style={{ clear: "both", margin: "28px 0", padding: 0, border: "none" }}>
                                            <p style={{ fontSize: 28, lineHeight: 1.35, color: color, fontStyle: "italic", fontFamily: FONT_BODY, fontWeight: 900, margin: 0 }}>
                                                <span style={{ fontSize: 28, fontWeight: 900, opacity: 0.7, marginRight: 4, verticalAlign: "super", lineHeight: 0 }}>{"\u201E"}</span>
                                                {item.text}
                                                <span style={{ fontSize: 28, fontWeight: 900, opacity: 0.7, marginLeft: 4, verticalAlign: "super", lineHeight: 0 }}>{"\u201E"}</span>
                                            </p>
                                        </blockquote>
                                    );
                                }
                                if (item.kind === "platiniquote") {
                                    const photoLeft = item.side === "left";
                                    const photoEl = (
                                        <div className="side-quote-photo">
                                            <img src={item.photo} alt={`Photo de ${interview.joueur}`} />
                                        </div>
                                    );
                                    const quoteEl = (
                                        <blockquote className="side-quote-text" style={{ margin: 0, padding: 0, border: "none" }}>
                                            <p style={{ margin: 0, fontSize: 22, lineHeight: 1.28, color: GOLD, fontStyle: "italic", fontFamily: FONT_BODY, fontWeight: 900 }}>
                                                <span style={{ fontSize: 30, fontWeight: 900, opacity: 0.7, marginRight: 3, verticalAlign: "super", lineHeight: 0 }}>{"\u201C"}</span>
                                                {item.text}
                                                <span style={{ fontSize: 30, fontWeight: 900, opacity: 0.7, marginLeft: 3, verticalAlign: "super", lineHeight: 0 }}>{"\u201D"}</span>
                                            </p>
                                        </blockquote>
                                    );

                                    return (
                                        <div key={`plq-${i}`} style={{ clear: "both", margin: "36px 0 28px" }}>
                                            <div className="side-quote-block">
                                                {photoLeft ? photoEl : quoteEl}
                                                {photoLeft ? quoteEl : photoEl}
                                            </div>
                                        </div>
                                    );
                                }
                                if (item.sideQuote && item.floatImg) {
                                    return (
                                        <div key={`sq-${i}`}>
                                            <div style={{ clear: "both" }} />
                                            <div className="side-quote-block">
                                                <blockquote className="side-quote-text" style={{ margin: 0, padding: 0, border: "none" }}>
                                                    <p style={{ margin: 0, fontSize: 22, lineHeight: 1.3, color: color, fontStyle: "italic", fontFamily: FONT_BODY, fontWeight: 900 }}>
                                                        <span style={{ fontSize: 28, fontWeight: 900, opacity: 0.7, marginRight: 4, verticalAlign: "super", lineHeight: 0 }}>{"\u201E"}</span>
                                                        {item.sideQuote}
                                                        <span style={{ fontSize: 28, fontWeight: 900, opacity: 0.7, marginLeft: 4, verticalAlign: "super", lineHeight: 0 }}>{"\u201E"}</span>
                                                    </p>
                                                </blockquote>
                                                <div className="side-quote-photo">
                                                    <img src={item.floatImg.url} alt={`Photo de ${interview.joueur}`} />
                                                </div>
                                            </div>
                                            <p style={{ fontSize: 24, lineHeight: 1.55, color: TEXT, fontWeight: 400, fontStyle: item.type === "response" ? "italic" : "normal", fontFamily: FONT_BODY, marginBottom: item.type === "question" ? 8 : 4, marginTop: item.type === "question" ? 24 : 0, paddingLeft: item.type === "question" ? 28 : 0 }}>
                                                {item.content}
                                            </p>
                                        </div>
                                    );
                                }
                                if (item.floatImg) {
                                    return (
                                        <div key={`fi-${i}`}>
                                            <div className={item.floatImg.side === "left" ? "float-img-left" : "float-img-right"}>
                                                <img src={item.floatImg.url} alt={`Photo de ${interview.joueur}`} />
                                            </div>
                                            <p style={{ fontSize: 24, lineHeight: 1.55, color: TEXT, fontWeight: 400, fontStyle: item.type === "response" ? "italic" : "normal", fontFamily: FONT_BODY, marginBottom: item.type === "question" ? 8 : 4, marginTop: item.type === "question" ? 24 : 0, paddingLeft: item.type === "question" ? 28 : 0 }}>
                                                {item.content}
                                            </p>
                                        </div>
                                    );
                                }
                                return (
                                    <p key={item.id || i} style={{ fontSize: item.type === "question" || item.type === "response" ? 24 : 26, lineHeight: 1.5, color: item.type === "text" ? "#C0C0C0" : TEXT, fontWeight: 400, fontStyle: item.type === "response" ? "italic" : "normal", fontFamily: FONT_BODY, marginBottom: item.type === "question" ? 8 : 14, marginTop: item.type === "question" ? 24 : 0, paddingLeft: item.type === "question" ? 28 : 0 }}>
                                        {item.content}
                                    </p>
                                );
                            })}
                        </div>
                    </div>
                )}

                {!hasFullText && !textLoading && hasSections && (
                    <div style={{ padding: "0 20px" }}>
                        {navItems.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28, paddingBottom: 16, borderBottom: `1px solid ${SEPARATOR}` }}>
                                {navItems.map((nav, idx) => {
                                    const cat = CATEGORIES_BY_ID[nav.id];
                                    const isActive = activeSection === nav.id;
                                    return (
                                        <button key={nav.id || `nav-${idx}`} onClick={() => { setActiveSection(isActive ? null : nav.id); if (!isActive) document.getElementById(`section-${nav.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); }} style={{ padding: "5px 12px", borderRadius: 20, border: isActive ? `1px solid ${color}` : `1px solid ${SEPARATOR}`, background: isActive ? `${color}15` : "transparent", color: isActive ? color : TEXT_MUTED, fontSize: 12, fontWeight: 400, cursor: "pointer", transition: "all 0.2s", fontFamily: FONT_INTERTEXT }}>
                                            {cat?.emoji || "📌"} {nav.titre}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        {sections.map((section, idx) => (
                            <section key={section.id || `section-${idx}`} id={`section-${section.id}`} style={{ marginBottom: 40, scrollMarginTop: 64 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                    <span style={{ fontSize: 16 }}>{CATEGORIES_BY_ID[section.id]?.emoji || "📌"}</span>
                                    <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: FONT_TITLE, textTransform: "lowercase", letterSpacing: "0.02em" }}>{section.titre}</h2>
                                </div>
                                <p style={{ fontSize: 26, lineHeight: 1.5, color: TEXT, marginBottom: 14, fontFamily: FONT_BODY, fontWeight: 400 }}>{section.contenu}</p>
                                {section.extrait_source && (
                                    <p style={{ fontSize: 24, lineHeight: 1.45, color: color, fontStyle: "italic", fontFamily: FONT_BODY, fontWeight: 900, margin: "20px 0" }}>
                                        <span style={{ fontSize: 26, lineHeight: 0.6, verticalAlign: "-0.25em", marginRight: 3, opacity: 0.6 }}>"</span>
                                        {section.extrait_source}
                                    </p>
                                )}
                            </section>
                        ))}
                    </div>
                )}

                {isReadingDone && !isCollected && quizData && !showQuiz && (
                    <div style={{ padding: "48px 20px 0", textAlign: "center" }}>
                        <div style={{ height: 1, background: SEPARATOR, marginBottom: 36 }} />
                        <button
                            onClick={() => setShowQuiz(true)}
                            style={{
                                padding: "16px 40px", border: "none",
                                background: color,
                                color: "#fff", fontSize: 24, fontWeight: 500, letterSpacing: "0.02em",
                                cursor: "pointer",
                                borderRadius: 8,
                                boxShadow: `0 4px 24px ${color}50`,
                                transition: "all 0.3s",
                                fontFamily: FONT_BODY,
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                        >
                            Jouer pour gagner la carte
                        </button>
                    </div>
                )}

                {showQuiz && !isCollected && quizData && (
                    <QuizSection
                        quiz={quizData}
                        color={color}
                        onWin={handleCollect}
                    />
                )}

                {isCollected && (
                    <div style={{ padding: "48px 20px 0", textAlign: "center" }}>
                        <div style={{ height: 1, background: SEPARATOR, marginBottom: 36 }} />
                        <p style={{ fontSize: 12, color: color, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>✓ Carte collectée</p>
                        <button onClick={() => router.push("/collection")} style={{ padding: "13px 32px", border: `1px solid ${color}40`, background: "transparent", color: color, fontSize: 24, fontWeight: 500, borderRadius: 8, cursor: "pointer", letterSpacing: "0.02em", fontFamily: FONT_BODY }}>Voir ma collection</button>
                    </div>
                )}
            </div>

            <HelpGuide steps={HELP_DATA.find(h => h.page === 'interviews/[slug]')?.steps || []} autoOpen autoOpenKey="help_seen_interview_detail" />
        </div>
    );
}
