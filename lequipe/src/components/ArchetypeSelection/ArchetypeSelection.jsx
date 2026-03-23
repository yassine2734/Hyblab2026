'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ARCHETYPES } from '@/lib/data/archetypes'
import { withBasePath } from '@/lib/withBasePath'
import styles from './ArchetypeSelection.module.css'
import HelpGuide from '../HelpGuide/HelpGuide'
import HELP_DATA from '@/data/help_data.json'

const archetypes = ARCHETYPES.map(a => ({
    id: a.id,
    titre: a.label,
    description: a.description,
    backDescription: a.backDescription,
    couleur: a.color,
    image: a.image,
}))
const TOTAL = archetypes.length

function wrapIndex(i) {
    return ((i % TOTAL) + TOTAL) % TOTAL
}

function circularOffset(from, to, total) {
    let diff = to - from
    if (diff > total / 2) diff -= total
    if (diff < -total / 2) diff += total
    return diff
}

export default function ArchetypeSelection({ onSelect, onSkip, autoOpenHelp = false }) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [flippedIndex, setFlippedIndex] = useState(null)
    const [loaded, setLoaded] = useState(false)
    const [hasSwiped, setHasSwiped] = useState(false)
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

    const touchStartX = useRef(0)
    const containerRef = useRef(null)
    const prefersReducedMotion = useRef(false)

    // Check reduced motion preference
    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
        prefersReducedMotion.current = mq.matches
        const handler = (e) => { prefersReducedMotion.current = e.matches }
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [])

    // Staggered entrance animation
    useEffect(() => {
        const timer = setTimeout(() => setLoaded(true), 100)
        return () => clearTimeout(timer)
    }, [])

    const activeArch = archetypes[activeIndex]

    const goNext = useCallback(() => {
        setActiveIndex(prev => wrapIndex(prev + 1))
        if (!hasSwiped) setHasSwiped(true)
    }, [hasSwiped])

    const goPrev = useCallback(() => {
        setActiveIndex(prev => wrapIndex(prev - 1))
        if (!hasSwiped) setHasSwiped(true)
    }, [hasSwiped])

    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX
    }, [])

    const handleTouchEnd = useCallback((e) => {
        if (flippedIndex !== null) return
        const diff = touchStartX.current - e.changedTouches[0].clientX
        if (diff > 50) goNext()
        else if (diff < -50) goPrev()
    }, [flippedIndex, goNext, goPrev])

    const handleCardClick = useCallback((index) => {
        if (flippedIndex !== null) return
        if (index === activeIndex) setFlippedIndex(index)
        else {
            setActiveIndex(index)
            if (!hasSwiped) setHasSwiped(true)
        }
    }, [activeIndex, flippedIndex, hasSwiped])

    const handleCloseFlip = useCallback(() => setFlippedIndex(null), [])

    const handleSelectArchetype = useCallback(() => {
        const idx = flippedIndex
        if (idx !== null && archetypes[idx]) {
            onSelect?.(archetypes[idx].id)
        }
    }, [flippedIndex, onSelect])

    const handleMouseMove = useCallback((e) => {
        if (prefersReducedMotion.current) return
        const rect = e.currentTarget.getBoundingClientRect()
        setMousePos({
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height,
        })
    }, [])

    const handleMouseLeave = useCallback(() => {
        setMousePos({ x: 0.5, y: 0.5 })
    }, [])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (flippedIndex !== null) {
                if (e.key === 'Escape') setFlippedIndex(null)
                if (e.key === 'Enter') handleSelectArchetype()
                return
            }
            if (e.key === 'ArrowRight') goNext()
            else if (e.key === 'ArrowLeft') goPrev()
            else if (e.key === 'Enter') setFlippedIndex(activeIndex)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [activeIndex, flippedIndex, goNext, goPrev, handleSelectArchetype])

    const titleLines = ['QUEL TYPE', 'DE FAN', 'ÊTES-VOUS ?']
    const archetypeHelp = HELP_DATA.find(h => h.page === 'archetype')?.steps || []

    return (
        <div
            className={`${styles.screen} ${flippedIndex !== null ? styles.screenFlipped : ''}`}
            onClick={() => { if (flippedIndex !== null) handleCloseFlip() }}
            style={{
                '--bg-tint': activeArch?.couleur || 'transparent',
            }}
        >
            <div className={styles.bgTint} />

            <section className={styles.titleSection}>
                <h1 className={styles.mainTitle}>
                    {titleLines.map((line, i) => (
                        <span
                            key={i}
                            className={`${styles.titleWord} ${loaded ? styles.titleWordIn : ''}`}
                            style={{ transitionDelay: `${i * 0.15}s`, display: 'block' }}
                        >
                            {line}
                        </span>
                    ))}
                </h1>
                <p className={`${styles.subtitle} ${loaded ? styles.subtitleIn : ''}`}>
                    Romantique du beau jeu, stratège, nostalgique ou supporter passionné…
                    Choisissez votre profil et découvrez les paroles de joueurs qui parlent
                    le mieux de votre vision du football.
                </p>
            </section>

            <div
                id="archetype-slider"
                className={styles.carouselWrapper}
                ref={containerRef}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div className={styles.carouselTrack}>
                    {archetypes.map((arch, index) => {
                        const offset = circularOffset(activeIndex, index, TOTAL)
                        const isActive = offset === 0
                        const isAdjacent = Math.abs(offset) === 1
                        const isVisible = Math.abs(offset) <= 1
                        const isFlipped = flippedIndex === index

                        if (!isVisible && !isFlipped) return null

                        const slideOffset = offset * 105
                        const cardTransform = isFlipped
                            ? 'translateX(-50%) translateZ(40px) scale(1.08)'
                            : isActive
                                ? 'translateX(-50%) translateZ(0px) rotateY(0deg) scale(1)'
                                : `translateX(calc(-50% + ${slideOffset}%)) translateZ(-80px) rotateY(${offset * -8}deg) scale(0.82)`

                        const parallaxX = isActive ? (mousePos.x - 0.5) * 12 : 0
                        const parallaxY = isActive ? (mousePos.y - 0.5) * 12 : 0

                        return (
                            <div
                                key={arch.id}
                                id={isActive ? 'active-card' : undefined}
                                className={`
                                    ${styles.card}
                                    ${isActive ? styles.cardActive : ''}
                                    ${isFlipped ? styles.cardFlipped : ''}
                                    ${loaded ? styles.cardIn : ''}
                                `}
                                style={{
                                    '--card-color': arch.couleur,
                                    '--card-glow': `${arch.couleur}55`,
                                    transform: cardTransform,
                                    opacity: isFlipped ? 1 : isActive ? 1 : isAdjacent ? 1 : 0,
                                    zIndex: isFlipped ? 50 : isActive ? 10 : isAdjacent ? 5 : 1,
                                    pointerEvents: isFlipped || isAdjacent || isActive ? 'auto' : 'none',
                                    transitionDelay: loaded ? `${Math.abs(offset) * 0.1}s` : '0s',
                                }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    if (!isFlipped) handleCardClick(index)
                                }}
                                onMouseMove={isActive && !isFlipped ? handleMouseMove : undefined}
                                onMouseLeave={isActive ? handleMouseLeave : undefined}
                            >
                                <div
                                    className={styles.cardFront}
                                    style={{ backgroundColor: arch.couleur }}
                                >
                                    <div className={styles.cardImageWrapper}>
                                        <Image
                                            src={withBasePath(arch.image)}
                                            alt={arch.titre}
                                            width={280}
                                            height={280}
                                            className={styles.cardImage}
                                            style={{
                                                transform: `translate(${parallaxX}px, ${parallaxY}px)`,
                                            }}
                                            priority={index <= 1}
                                        />
                                    </div>
                                    <div className={`${styles.cardOverlay} ${(isActive || isFlipped) ? styles.cardOverlayHidden : ''}`} />
                                </div>

                                <div
                                    className={styles.cardBack}
                                    style={{ backgroundColor: arch.couleur }}
                                    onClick={(e) => {
                                        if (isFlipped && e.target === e.currentTarget) {
                                            handleCloseFlip()
                                        }
                                    }}
                                >
                                    <button
                                        className={styles.cardBackClose}
                                        onClick={(e) => { e.stopPropagation(); handleCloseFlip() }}
                                        aria-label="Retour"
                                    >
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                    <div className={styles.cardBackContent}>
                                        <p className={styles.cardBackDescription}>{arch.backDescription}</p>
                                    </div>
                                    <button
                                        className={styles.selectBtn}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            e.preventDefault()
                                            onSelect?.(arch.id)
                                        }}
                                    >
                                        Choisir ce profil
                                        <span className={styles.selectArrow}>→</span>
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {!hasSwiped && loaded && (
                    <div className={styles.swipeBadge}>
                        ← Swipe →
                    </div>
                )}
            </div>

            <div className={styles.progressBars}>
                {archetypes.map((arch, i) => (
                    <button
                        key={i}
                        className={styles.progressBarContainer}
                        onClick={() => { setFlippedIndex(null); setActiveIndex(i) }}
                        aria-label={`Carte ${i + 1}`}
                    >
                        <div
                            className={`${styles.progressBar} ${i === activeIndex ? styles.progressBarActive : ''}`}
                            style={{
                                '--bar-color': i === activeIndex ? arch.couleur : '#F3DFD8',
                            }}
                        />
                    </button>
                ))}
            </div>

            <div className={styles.bottomBar}>
                <button className={`${styles.skipBtn} ${loaded ? styles.skipBtnIn : ''}`} onClick={onSkip}>
                    <span className={styles.skipText}>Je préfère passer cette étape</span>
                    <span className={styles.skipArrow}>→</span>
                    <div className={styles.skipShimmer} />
                </button>
            </div>

            <HelpGuide
                steps={archetypeHelp}
                autoOpen
                autoOpenKey="help_seen_archetype"
            />
        </div>
    )
}
