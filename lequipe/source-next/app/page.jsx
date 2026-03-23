'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { withBasePath } from '@/lib/withBasePath'
import styles from './CoverPage.module.css'

// Configuration de TOUS les joueurs du dossier public/home/images
const INTRO_PLAYERS = [
    { id: 'platini', image: '/home/images/platini.png', glowColor: '#bfff00', width: '60%', height: '55%', top: 'calc(-22% - 25px)', left: 'calc(24% - 35px)', zIndex: 10 },
    { id: 'leboeuf', image: '/home/images/leboeuf.png', glowColor: '#FF4500', width: '42%', height: '38%', top: 'calc(-4% - 5px)', right: 'calc(5% + 10px)', zIndex: 12 },
    { id: 'zidane', image: '/home/images/zidane.png', glowColor: '#FF7D00', width: '50%', height: '44%', top: 'calc(-6% + 0px)', left: 'calc(5% - 20px)', zIndex: 13 },
    { id: 'perrocheau', image: '/home/images/perrocheau.png', glowColor: '#4deeea', width: '68%', height: '56%', top: 'calc(20% - 40px)', left: 'calc(-16% + 110px)', zIndex: 16 },
    { id: 'lloris', image: '/home/images/lloris.png', glowColor: '#bfff00', width: '60%', height: '60%', top: 'calc(16% - 50px)', right: 'calc(-10% - 45px)', zIndex: 18 },
    { id: 'amarildo', image: '/home/images/Amarildo.png', glowColor: '#4deeea', width: '62%', height: '54%', top: 'calc(13% - 30px)', left: 'calc(21% - 180px)', zIndex: 17 },
    { id: 'sparwasser', image: '/home/images/sparwasser.png', glowColor: '#FF7D00', width: '58%', height: '54%', top: 'calc(15% - 10px)', right: 'calc(-8% + 40px)', zIndex: 14 },
    { id: 'mila', image: '/home/images/mila.png', glowColor: '#8A2BE2', width: '68%', height: '60%', top: 'calc(15% + 15px)', left: 'calc(-5% - 30px)', zIndex: 21 },
    { id: 'rattin', image: '/home/images/Rattin.png', glowColor: '#8A2BE2', width: '78%', height: '68%', bottom: 'calc(12% + 15px)', right: 'calc(-12% - 70px)', zIndex: 26 },
    { id: 'martin', image: '/home/images/martin.png', glowColor: '#d4af37', width: '75%', height: '68%', bottom: 'calc(15% - 75px)', left: 'calc(50% - 130px)', transform: 'translateX(-50%)', zIndex: 25 },
    { id: 'goycoechea', image: '/home/images/Goycoechea.png', glowColor: '#bfff00', width: '52%', height: '46%', bottom: 'calc(10% + 35px)', left: 'calc(-8% - 50px)', zIndex: 24 },
    { id: 'pele', image: '/home/images/pelé.png', glowColor: '#d4af37', width: '76%', height: '66%', bottom: '-120px', left: '-12%', zIndex: 31 },
    { id: 'schillaci', image: '/home/images/schillaci.png', glowColor: '#8A2BE2', width: '64%', height: '54%', bottom: '-90px', right: '-5%', zIndex: 30 },
]

export default function CoverPage() {
    const router = useRouter()
    const [hasStarted, setHasStarted] = useState(false)
    const [showIntro, setShowIntro] = useState(true)
    const baseAudioRef = useRef(null);
    const buttonAudioRef = useRef(null);
    const currentAudioRef = useRef(null)
    const timersRef = useRef([]) // Pour stocker les timers

    const playSound = (path) => {
        try {
            if (path.includes('apparition')) {
                if (!baseAudioRef.current) {
                    baseAudioRef.current = new Audio(path);
                    baseAudioRef.current.loop = true;
                    baseAudioRef.current.volume = 0.8;
                }
                baseAudioRef.current.play().catch(() => { });
                buttonAudioRef.current = new Audio(withBasePath('/home/sons/bouton.mp3'));
                buttonAudioRef.current.load();
                return;
            }
            if (currentAudioRef.current) {
                currentAudioRef.current.pause();
                currentAudioRef.current.currentTime = 0;
            }
            const audio = new Audio(path);
            if (path.includes('sifflet')) audio.volume = 0.05;
            else if (path.includes('sortie')) audio.volume = 0.7;
            else audio.volume = 0.05;
            currentAudioRef.current = audio;
            audio.play().catch(() => { });
        } catch (e) { }
    }

    const startExperience = () => {
        setHasStarted(true);
        playSound(withBasePath('/home/sons/apparition.mp3'));

        const t1 = setTimeout(() => playSound(withBasePath('/home/sons/sifflet.mp3')), 3000);
        const t2 = setTimeout(() => {
            playSound(withBasePath('/home/sons/sortie.mp3'));
            setShowIntro(false);
        }, 3600);

        timersRef.current = [t1, t2];
    }

    // Cleanup des timers et sons au démontage
    useEffect(() => {
        return () => {
            timersRef.current.forEach(t => clearTimeout(t));
            if (baseAudioRef.current) baseAudioRef.current.pause();
            if (currentAudioRef.current) currentAudioRef.current.pause();
        }
    }, []);

    // Effet pour forcer overflow hidden sur body/html pendant l'intro
    useEffect(() => {
        if (showIntro) {
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            window.scrollTo(0, 0);
        } else {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        }

        // Restaurer le scroll si l'utilisateur revient sur l'onglet après l'intro
        const handleVisibility = () => {
            if (!showIntro) {
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        };
    }, [showIntro]);

    // LOGIQUE DE SCALING RESPONSIVE
    const [scale, setScale] = useState(1)
    useEffect(() => {
        const handleResize = () => {
            if (!showIntro) return;
            const REF_W = 413;
            const REF_H = 580;
            const availableW = window.innerWidth;
            const availableH = window.innerHeight - 64;
            const scaleW = availableW / REF_W;
            const scaleH = (availableH * 0.95) / REF_H;
            let newScale = Math.min(scaleW, scaleH);
            if (window.innerWidth <= 768) {
                newScale = newScale * 1.05;
            } else if (window.innerWidth > 1024) {
                newScale = Math.min(newScale, 1.0);
            }
            setScale(newScale);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [showIntro]);

    return (
        <div className={styles.screen}>
            <AnimatePresence>
                {!hasStarted && (
                    <motion.div
                        key="splash"
                        className={styles.landingOverlay}
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                        <motion.div
                            className={styles.landingContent}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className={styles.logoArea}>
                                <h1 className={styles.title} style={{ fontSize: '40px', marginBottom: '10px' }}>Coupe du Monde 2026</h1>
                                <p className={styles.startSub}>L&apos;Interview des legendes</p>
                            </div>

                            <button className={styles.startBtn} onClick={startExperience}>
                                Commencer
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={styles.headerArea}>
                <AnimatePresence mode="wait">
                    {showIntro ? (
                        <motion.h1
                            key="title-intro"
                            className={styles.title}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.85 }}
                        >
                            PAROLES DE LÉGENDES
                        </motion.h1>
                    ) : (
                        <motion.h1
                            key="title-main"
                            className={styles.title}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.85 }}
                        >
                            Coupe Du Monde 2026
                        </motion.h1>
                    )}
                </AnimatePresence>
            </div>

            <div className={styles.content}>
                <AnimatePresence>
                    {showIntro && hasStarted && (
                        <motion.div key="intro" className={styles.introContent}>
                            <div className={styles.scalingWrapper} style={{ transform: `scale(${scale})` }}>
                                <div className={styles.collageContainer}>
                                    {INTRO_PLAYERS.map((player, i) => {
                                        const orderIndex = INTRO_PLAYERS.length - 1 - i;
                                        const appearDelay = 0.08 + orderIndex * 0.08;
                                        const exitDelay = i * 0.06;
                                        const layerZ = 20 + (INTRO_PLAYERS.length - orderIndex);

                                        return (
                                            <motion.div
                                                key={`intro-player-${player.id}`}
                                                className={styles.playerPlaceholder}
                                                style={{
                                                    '--glow-color': player.glowColor,
                                                    width: player.width,
                                                    height: player.height,
                                                    ...(player.top !== undefined ? { top: player.top } : {}),
                                                    ...(player.bottom !== undefined ? { bottom: player.bottom } : {}),
                                                    ...(player.left !== undefined ? { left: player.left } : {}),
                                                    ...(player.right !== undefined ? { right: player.right } : {}),
                                                    zIndex: layerZ,
                                                }}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                variants={{
                                                    initial: { opacity: 0, y: 30, scale: 0.8 },
                                                    animate: {
                                                        opacity: 1,
                                                        y: 0,
                                                        scale: 1,
                                                        transition: { delay: appearDelay, duration: 0.6, ease: "easeOut" }
                                                    },
                                                    exit: {
                                                        opacity: 0,
                                                        y: 40,
                                                        scale: 0.9,
                                                        transition: { delay: exitDelay, duration: 0.4, ease: "easeIn" }
                                                    }
                                                }}
                                            >
                                                <img
                                                    src={withBasePath(player.image)}
                                                    alt={`Légende ${player.id}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain',
                                                        objectPosition: 'bottom center',
                                                        filter: `drop-shadow(0px 0px 3px ${player.glowColor}) drop-shadow(0px 0px 8px ${player.glowColor}90)`
                                                    }}
                                                />
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {!showIntro && hasStarted && (
                        <motion.div
                            key="main"
                            className={styles.mainContent}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
                        >
                            <motion.p
                                className={styles.description}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.85, duration: 0.5 }}
                            >
                                En attendant la Coupe du Monde de la FIFA 2026, plongez dans les récits des grandes légendes du football.
                            </motion.p>

                            <motion.div
                                className={styles.trophyContainer}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{
                                    scale: 1,
                                    opacity: 1,
                                    y: [0, -15, 0],
                                    x: [0, 0, -1, 1, -1, 1, 0],
                                    rotate: [0, 0, -1, 1, -1, 1, 0]
                                }}
                                transition={{
                                    scale: { delay: 0.9, type: "spring", stiffness: 100 },
                                    opacity: { delay: 0.9, duration: 0.6 },
                                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                                    x: { duration: 2, repeat: Infinity, times: [0, 0.8, 0.85, 0.9, 0.95, 0.98, 1], ease: "linear" },
                                    rotate: { duration: 2, repeat: Infinity, times: [0, 0.8, 0.85, 0.9, 0.95, 0.98, 1], ease: "linear" }
                                }}
                            >
                                <div className={styles.trophyWrapper}>
                                    <img src={withBasePath('/home/images/coupe.png')} className={styles.trophyImage} alt="Trophée FIFA" />
                                    <div
                                        className={styles.trophyFlashMask}
                                        style={{
                                            WebkitMaskImage: `url('${withBasePath('/home/images/coupe.png')}')`,
                                            maskImage: `url('${withBasePath('/home/images/coupe.png')}')`
                                        }}
                                    >
                                        <div className={styles.trophyFlash} />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.p
                                className={styles.description}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.1, duration: 0.5 }}
                            >
                                Oleg Salenko, Claudio Gentile, Hugo Lloris, Pelé et bien d&apos;autres reviennent sur leurs souvenirs, parcours et leur vision du jeu.
                            </motion.p>

                            <motion.button
                                className={styles.cta}
                                onClick={() => {
                                    if (buttonAudioRef.current) buttonAudioRef.current.play().catch(() => { });
                                    if (baseAudioRef.current) baseAudioRef.current.pause();
                                    setTimeout(() => router.push('/archetype?welcome=true'), 150);
                                }}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2, duration: 0.5 }}
                            >
                                Faites-moi rêver !
                                <span className={styles.arrow}>→</span>
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
