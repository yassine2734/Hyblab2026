'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { withBasePath } from '@/lib/withBasePath'
import styles from './CollectionPage.module.css'
import { CARD_IMAGES as RAW_CARD_IMAGES, CARD_BLOCK_IMAGES as RAW_BLOCK_IMAGES, CARD_BACK as RAW_CARD_BACK } from '@/lib/data/card_images'

/* ─── Confetti ──────────────────────────────────────────────────────────── */
const CONFETTI_COLORS = ['#FFD700','#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98FB98']
function Confetti({ active }) {
    const canvasRef = useRef(null)
    useEffect(() => {
        if (!active) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        const pieces = Array.from({ length: 120 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            r: Math.random() * 8 + 4,
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * 360,
            spin: (Math.random() - 0.5) * 6,
            drift: (Math.random() - 0.5) * 2,
        }))
        let raf
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            pieces.forEach(p => {
                ctx.save()
                ctx.translate(p.x, p.y)
                ctx.rotate((p.angle * Math.PI) / 180)
                ctx.fillStyle = p.color
                ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6)
                ctx.restore()
                p.y += p.speed
                p.x += p.drift
                p.angle += p.spin
            })
            raf = requestAnimationFrame(draw)
        }
        draw()
        return () => cancelAnimationFrame(raf)
    }, [active])
    if (!active) return null
    return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }} />
}

/* ─── Rank tier config ──────────────────────────────────────────────────── */
const RANK_TIERS = [
    { id: 'bronze', label: 'BRONZE', threshold: 5,  topBg: '#7a4520', bottomBg: '#4a2510', accent: '#c47a3a', image: '/cartes/Bronze_Card_Trophee.png' },
    { id: 'argent', label: 'ARGENT', threshold: 10, topBg: '#b8b8b8', bottomBg: '#3a3a3a', accent: '#c9a836', image: '/cartes/SIlver_Card_Trophee.png' },
    { id: 'or',     label: 'OR',     threshold: 34, topBg: '#ead5a8', bottomBg: '#c99030', accent: '#c9952a', image: '/cartes/Gold_Card_Trophee.png'   },
]

/* ─── Formattage des URLs ───────────────────────────────────────────────── */
const getCardFront = (slug) => {
    const file = RAW_CARD_IMAGES[slug];
    return file ? withBasePath(`/cartes/${file}`) : null;
}

const getCardBlock = (slug) => {
    const file = RAW_BLOCK_IMAGES[slug] || RAW_BLOCK_IMAGES['default'];
    return withBasePath(`/cartes/${file}`);
}

const CARD_BACK = withBasePath(`/cartes/${RAW_CARD_BACK}`);




function TrophyCard({ tier, isWon, isLocked, readCount }) {
    const progress = isWon
        ? `${tier.threshold} / ${tier.threshold}`
        : `${readCount} / ${tier.threshold}`
    const fillPct = Math.min((readCount / tier.threshold) * 100, 100)

    return (
        <div className={styles.trophyCard}>
            {isLocked && <div className={styles.lockOverlay}><span className={styles.lockOverlayIcon}>🔒</span></div>}
            <img src={withBasePath(tier.image)} alt={tier.label} className={styles.trophyCardImg} />
            <div className={styles.trophyCardInfo}>
                <span className={styles.tierLabel}>{tier.label}</span>
                <span className={styles.tierProgress}>{progress}</span>
                {!isLocked && !isWon && (
                    <div className={styles.progressBarWrap}>
                        <div className={styles.progressBarFill} style={{ width: `${fillPct}%`, background: tier.accent }} />
                    </div>
                )}
                {isWon && <span className={styles.wonBadge}>✓</span>}
            </div>
        </div>
    )
}

/* ─── Main component ───────────────────────────────────────────────────── */
export default function CollectionPage({
    cartesCollectees = [],
    nbCollected = 0,
    tropheesClaimes = [],
    revendiquerTrophee = () => {},
    interviews = [],
    onBackToFeed
}) {
    const [currentPage, setCurrentPage]       = useState(0)
    const [isAnimating, setIsAnimating]       = useState(false)
    const [direction, setDirection]           = useState('next')
    const [prevInterviews, setPrevInterviews] = useState([])
    const [rankSlide, setRankSlide]           = useState(0)
    const [claimingTier, setClaimingTier]     = useState(null)
    const [newlyUnlocked, setNewlyUnlocked]   = useState(null)
    const [lockedModal, setLockedModal]       = useState(null)  // { slug, nom }
    const [collectedModal, setCollectedModal] = useState(null) // { slug, nom, imgSrc }
    const [confetti, setConfetti]             = useState(false)

    const carouselRef  = useRef(null)
    const touchStartX  = useRef(null)
    const hasAutoOpened = useRef(false)

    const CARDS_PER_PAGE = 6


    const currentTierIdx = tropheesClaimes.includes('argent') ? 2
                         : tropheesClaimes.includes('bronze') ? 1
                         : 0

    const isTierLocked = (idx) => idx > 0 && !tropheesClaimes.includes(RANK_TIERS[idx - 1].id)
    const canClaim     = (idx) =>
        nbCollected >= RANK_TIERS[idx].threshold &&
        !tropheesClaimes.includes(RANK_TIERS[idx].id) &&
        !isTierLocked(idx)

    useEffect(() => { setRankSlide(currentTierIdx) }, [currentTierIdx])


    useEffect(() => {
        if (!carouselRef.current) return
        const slots = carouselRef.current.querySelectorAll('[data-slot]')
        if (slots[rankSlide]) slots[rankSlide].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }, [rankSlide])

    const handleClaimConfirm = () => {
        const { tier, tierIdx } = claimingTier
        revendiquerTrophee(tier.id)
        setClaimingTier(null)
        setConfetti(false)
        const nextIdx = tierIdx + 1
        if (nextIdx < RANK_TIERS.length) {
            setNewlyUnlocked(nextIdx)
            setTimeout(() => { setRankSlide(nextIdx); setTimeout(() => setNewlyUnlocked(null), 1600) }, 350)
        }
    }

    const checkIfCollected = (iv) => {
        if (!iv || !cartesCollectees) return false
        const ids = [iv.slug, iv.index !== undefined ? String(iv.index) : null, iv._index !== undefined ? String(iv._index) : null].filter(Boolean)
        return cartesCollectees.some(s => ids.includes(String(s)))
    }

    const sortedInterviews  = [...interviews].sort((a, b) => checkIfCollected(b) - checkIfCollected(a))
    const startIndex        = (currentPage - 1) * CARDS_PER_PAGE
    const visibleInterviews = currentPage === 0 ? [] : sortedInterviews.slice(startIndex, startIndex + CARDS_PER_PAGE)

    const totalPages = 1 + Math.ceil(interviews.length / CARDS_PER_PAGE)

    const triggerPageChange = useCallback((newDir, action) => {
        if (isAnimating) return
        setDirection(newDir)
        setIsAnimating(true)
        setPrevInterviews(currentPage === 0 ? [{ isCover: true }] : visibleInterviews)
        action()
        setTimeout(() => { setIsAnimating(false); setPrevInterviews([]) }, 900)
    }, [isAnimating, visibleInterviews, currentPage])


    const nextPage = useCallback(() => {

        if (currentPage < totalPages - 1) triggerPageChange('next', () => setCurrentPage(p => p + 1))
    }, [currentPage, totalPages, triggerPageChange])

    const prevPage = useCallback(() => {
        if (currentPage > 0) triggerPageChange('prev', () => setCurrentPage(p => p - 1))
    }, [currentPage, triggerPageChange])

    useEffect(() => {
        if (!hasAutoOpened.current && currentPage === 0) {
            const timer = setTimeout(() => {
                nextPage();
                hasAutoOpened.current = true;
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [nextPage, currentPage]);


    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX
    }, [])

    const handleTouchEnd = useCallback((e) => {
        if (touchStartX.current === null) return
        const dx = e.changedTouches[0].clientX - touchStartX.current
        touchStartX.current = null
        if (Math.abs(dx) < 40) return
        if (dx < 0) nextPage()
        else prevPage()
    }, [nextPage, prevPage])

    useEffect(() => {
        const h = (e) => { if (e.key === 'ArrowRight') nextPage(); if (e.key === 'ArrowLeft') prevPage() }
        window.addEventListener('keydown', h)
        return () => window.removeEventListener('keydown', h)
    }, [nextPage, prevPage])


    const renderCardSlot = (iv) => {
        const isCollected = checkIfCollected(iv)
        const slug = iv.slug

        if (isCollected) {
            const imgSrc = getCardFront(slug)
            return (
                <div className={styles.cardImgWrap} onClick={() => setCollectedModal({ slug, nom: iv.nom || iv.joueur, imgSrc })}>
                    {imgSrc
                        ? <img src={imgSrc} alt={iv.nom || iv.joueur} className={styles.cardImg} />
                        : <div className={styles.cardImgFallback}>{(iv.nom || iv.joueur || '?').charAt(0)}</div>
                    }
                </div>
            )
        }

        /* Locked — click opens modal */
        const blockSrc = getCardBlock(slug)
        return (
            <div className={styles.cardImgWrap} onClick={() => setLockedModal({ slug, nom: iv.nom || iv.joueur, blockSrc })}>
                <img src={CARD_BACK} alt="Carte verrouillée" className={styles.cardImg} />
            </div>
        )
    }


    return (
        <div className={styles.screen}>
            <div className={styles.mainLayout}>
                <header className={styles.header}>
                    <button className={styles.backBtn} onClick={onBackToFeed}>
                        <span className={styles.backArrow}>←</span> Retour
                    </button>
                    <h1 className={styles.title}>Ta Collection</h1>
                </header>

                {/* ── RANK CAROUSEL ─────────────────────────────── */}
                <div className={styles.rankSection}>
                    <p className={styles.rankLabel}>Ton rang</p>
                    <div className={styles.rankCarousel} ref={carouselRef}>
                        {RANK_TIERS.map((tier, idx) => {
                            const isWon        = tropheesClaimes.includes(tier.id)
                            const isLocked     = isTierLocked(idx)
                            const isActive     = idx === rankSlide
                            const claimable    = canClaim(idx)
                            const justUnlocked = newlyUnlocked === idx
                            return (
                                <div key={tier.id} data-slot={idx}
                                    className={[styles.trophySlot, isActive ? styles.trophySlotActive : '', isLocked ? styles.trophySlotLocked : '', justUnlocked ? styles.trophySlotUnlocking : ''].join(' ')}
                                    onClick={() => !claimable && setRankSlide(idx)}>
                                    <TrophyCard tier={tier} isWon={isWon} isLocked={isLocked} readCount={nbCollected} />
                                    {claimable && (
                                        <button className={styles.claimBtn} style={{ borderColor: tier.accent, color: tier.accent }}
                                            onClick={e => { e.stopPropagation(); setClaimingTier({ tier, tierIdx: idx }); setConfetti(true) }}>
                                            Collecter
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <div className={styles.rankDots}>
                        {RANK_TIERS.map((_, i) => (
                            <div key={i} className={`${styles.rankDot} ${i === rankSlide ? styles.rankDotActive : ''}`} onClick={() => setRankSlide(i)} />
                        ))}
                    </div>
                </div>


                {/* ── CARDS GRID ────────────────────────────────── */}
                <div className={styles.gridSection}>
                    <div className={styles.gridContainer} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                        <button className={styles.sideNav} onClick={prevPage} disabled={currentPage === 0 || isAnimating}>‹</button>

                        <div className={styles.bookStack}>
                            <div className={`${styles.pageWrapper} ${isAnimating ? (direction === 'prev' ? styles.incomingPageFlip : styles.incomingPage) : ''} ${currentPage === 0 ? styles.coverPageWrapper : ''}`}>
                                {currentPage === 0 ? (
                                    <div className={styles.coverPage}>
                                        <img 
                                            src={withBasePath('/couverture/entrée-paroles-de-légendes.png')} 
                                            alt="Couverture : Entrée Paroles de Légendes" 
                                            className={styles.coverImage}
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.grid}>
                                        {visibleInterviews.map((iv) => (
                                            <div key={iv.slug} className={styles.gridItem}>
                                                {renderCardSlot(iv)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {isAnimating && (
                                <div className={`${styles.pageWrapper} ${styles.exitingPage} ${direction === 'next' ? styles.flipForward : styles.flipBackward} ${(prevInterviews.length === 1 && prevInterviews[0].isCover) ? styles.coverPageWrapper : ''}`}>
                                    {prevInterviews.length === 1 && prevInterviews[0].isCover ? (
                                        <div className={styles.coverPage}>
                                            <img 
                                                src={withBasePath('/couverture/entrée-paroles-de-légendes.png')} 
                                                alt="Couverture : Entrée Paroles de Légendes" 
                                                className={styles.coverImage}
                                            />
                                        </div>
                                    ) : (
                                        <div className={styles.grid}>
                                            {prevInterviews.map((iv) => (
                                                <div key={iv.slug} className={styles.gridItem}>
                                                    {renderCardSlot(iv)}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>


                        <button className={styles.sideNav} onClick={nextPage} disabled={currentPage === totalPages - 1 || isAnimating}>›</button>

                    </div>

                    <div className={styles.paginationInfo}>
                        <div className={styles.pageDots}>
                            {[...Array(totalPages)].map((_, i) => (
                                <div key={i} className={`${styles.dot} ${i === currentPage ? styles.activeDot : ''}`} />
                            ))}
                        </div>
                        <span className={styles.pageCounter}>{currentPage + 1} / {totalPages}</span>
                    </div>
                </div>
            </div>

            {/* ── LOCKED CARD MODAL ─────────────────────────── */}
            {lockedModal && (
                <div className={styles.lockedOverlay} onClick={() => setLockedModal(null)}>
                    <div className={styles.lockedPopup} onClick={e => e.stopPropagation()}>
                        <img src={withBasePath(lockedModal.blockSrc || CARD_BACK)} alt="Carte verrouillée" className={styles.lockedPopupCard} />
                        <p className={styles.lockedPopupName}>{lockedModal.nom}</p>
                        <a href={withBasePath(`/interviews/${lockedModal.slug}`)} className={styles.lockedPopupBtn}>
                            Lire l'article
                        </a>
                    </div>
                </div>
            )}

            {/* ── COLLECTED CARD MODAL ──────────────────────── */}
            {collectedModal && (
                <div className={styles.lockedOverlay} onClick={() => setCollectedModal(null)}>
                    <div className={styles.lockedPopup} onClick={e => e.stopPropagation()}>
                        {collectedModal.imgSrc
                            ? <img src={withBasePath(collectedModal.imgSrc)} alt={collectedModal.nom} className={styles.lockedPopupCard} />
                            : <div className={styles.cardImgFallback}>{(collectedModal.nom || '?').charAt(0)}</div>
                        }
                        <p className={styles.lockedPopupName}>{collectedModal.nom}</p>
                    </div>
                </div>
            )}

            {/* ── CLAIM OVERLAY ─────────────────────────────── */}
            {claimingTier && (
                <div className={styles.claimOverlay}>
                    <Confetti active={confetti} />
                    <div className={styles.claimModal}>
                        <div className={styles.claimCardWrap}>
                            <img src={withBasePath(claimingTier.tier.image)} alt={`Trophée ${claimingTier.tier.label}`} className={styles.claimCardImg} />
                        </div>
                        <button className={styles.claimConfirmBtn} style={{ background: claimingTier.tier.accent }} onClick={handleClaimConfirm}>
                            COLLECTER
                        </button>
                    </div>
                </div>
            )}


        </div>
    )
}
