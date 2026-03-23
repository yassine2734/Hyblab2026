/**
 * Interview data access layer.
 * Canonical source: data/interviews_db_ready.json (for full text)
 * Integrated Source: lib/data/archetype_joueurs.js (for browsing and metadata)
 */
import { JOUEURS, INTERVIEWS_META } from '@/lib/data/archetype_joueurs'
import { CATEGORIES_BY_ID } from '@/lib/data/categories'

let dbReadyPromise = null

function normalizeSlug(value) {
    return (value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/(^-|-$)/g, '')
}

function findEntryBySlug(list, slug) {
    const requested = normalizeSlug(slug)
    if (!requested) return null

    return list.find(i => i.slug === slug)
        || list.find(i => i.slug.startsWith(slug) || slug.startsWith(i.slug))
        || list.find(i => normalizeSlug(i.slug) === requested)
}

function normalizeText(value) {
    if (typeof value !== 'string') return null
    const t = value.replace(/\s+/g, ' ').trim()
    return t.length ? t : null
}

function firstSentence(text, max = 220) {
    const source = normalizeText(text)
    if (!source) return null
    if (source.length <= max) return source

    const slice = source.slice(0, max)
    const cut = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '))
    if (cut > 70) return slice.slice(0, cut + 1).trim()

    const space = slice.lastIndexOf(' ')
    return `${slice.slice(0, space > 0 ? space : max).trim()}...`
}

function buildHero(entry, row, resume) {
    const heroImage = entry.hero || (entry.image ? { url: entry.image, alt: `Portrait de ${entry.joueur || entry.nom}` } : null)
    return {
        titre: entry.titre_interview || null,
        sous_titre: [entry.joueur || entry.nom, entry.pays, entry.mondial ? `Mondial ${entry.mondial}` : null].filter(Boolean).join(' · '),
        description: resume,
        date_publication: entry.date_publication || null,
        image: heroImage,
        source_interview_id: row?.interview_id || null,
    }
}

function buildSections(entry) {
    const themeCitations = entry.theme_citations || {}

    return Object.entries(themeCitations)
        .filter(([, text]) => typeof text === 'string' && text.trim().length > 0)
        .map(([id, citation]) => ({
            id,
            titre: CATEGORIES_BY_ID[id]?.label || id,
            present: true,
            contenu: citation,
            extrait_source: citation,
            citation_forte: citation,
            tonalite: 'citation',
        }))
}

async function getDbReady() {
    if (!dbReadyPromise) {
        dbReadyPromise = import('@/data/interviews_db_ready.json').then(m => m.default)
    }
    return dbReadyPromise
}

/**
 * @typedef {Object} InterviewSummary
 * @property {number} index
 * @property {string} slug
 * @property {string} joueur
 * @property {string|null} mondial
 * @property {string|null} pays
 * @property {string|null} date_publication
 * @property {string|null} titre_interview
 * @property {string|null} resume
 * @property {string|null} citation_forte
 * @property {string[]} archetypes
 * @property {{ alt: string, suggestion: string, url: string|null }|null} hero
 */

/**
 * Get the lightweight list of all interviews.
 * @returns {InterviewSummary[]}
 */
export function getInterviewsList() {
    return JOUEURS
}

/**
 * Get the full interview detail by slug.
 * @param {string} slug
 * @returns {Promise<Object|null>}
 */
export async function getInterviewBySlug(slug) {
    const list = JOUEURS
    const entry = findEntryBySlug(list, slug)
    if (!entry) return null

    const db = await getDbReady()
    const row = db.interviews_liees?.find(i => i.joueur_slug === entry.slug)

    const resume = normalizeText(entry.resume) || normalizeText(row?.chapo) || firstSentence(row?.texte_integral)
    const citation = normalizeText(entry.citation_forte)
        || normalizeText(row?.blocs_qa?.find(qa => normalizeText(qa?.reponse))?.reponse)
        || firstSentence(row?.texte_integral)
    const sections = buildSections(entry)

    return {
        joueur: entry.nom || entry.joueur,
        mondial: entry.mondial,
        pays: entry.pays,
        date_publication: entry.date_publication,
        titre_interview: entry.titre_interview,
        resume,
        citation_forte: citation,
        archetypes: entry.archetypes_ids || [],
        article_structure: {
            format: 'page_interview_v2',
            hero: buildHero(entry, row, resume),
            intro: {
                resume,
                citation_ouverture: citation,
                chapo: normalizeText(row?.chapo),
            },
            navigation_thematiques: sections.map(s => ({ id: s.id, titre: s.titre, present: true })),
            sections_thematiques: sections,
        },
        categories: entry.categories || {},
        thematiques_ordre_preference: Object.keys(entry.theme_citations || {}),
        _index: entry.index,
        _source_interview_id: row?.interview_id || null,
        _confiance_liaison: row?.confiance_liaison ?? null,
        theme_citations: entry.theme_citations || {},
        slug: entry.slug,
    }
}

/**
 * Get interviews for browsing with optional archetype + theme.
 *
 * @param {string|null} archetypeId - e.g. "l_artiste"
 * @param {string|null} themeId - e.g. "technique_jeu"
 * @returns {InterviewSummary[]}
 */
export function getInterviewsForArchetype(archetypeId, themeId = null) {
    const all = JOUEURS

    if (!themeId) {
        if (!archetypeId) return all
        return all.filter(i => i.archetypes_ids?.includes(archetypeId))
    }

    const themed = all.filter(i => {
        const citation = i.theme_citations?.[themeId]
        return typeof citation === 'string' && citation.trim().length > 0
    })

    if (!archetypeId) return themed

    return themed
        .map(i => {
            const citation = i.theme_citations?.[themeId] || ''
            const words = citation.trim().split(/\s+/).filter(Boolean).length
            const catBoost = i.categories?.[themeId] ? 3 : 0
            const profileBoost = i.archetypes_ids?.includes(archetypeId) ? 8 : 0
            return { interview: i, score: words + catBoost + profileBoost }
        })
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score
            const nameA = a.interview.nom || a.interview.joueur || ''
            const nameB = b.interview.nom || b.interview.joueur || ''
            return nameA.localeCompare(nameB, 'fr')
        })
        .map(x => x.interview)
}

/**
 * Get the texte_brut (full article text) for a given interview.
 * @param {number} listIndex - 0-based index from reference data
 * @returns {Promise<string|null>}
 */
export async function getTexteBrut(listIndex) {
    try {
        const db = await getDbReady()
        const row = db.interviews_liees?.[listIndex]
        const rawText = row?.texte_integral
        if (typeof rawText === 'string' && rawText.trim().length > 0) return rawText
        return null
    } catch (e) {
        console.warn('Could not load texte_brut:', e)
        return null
    }
}

/**
 * Get meta information from the data.
 */
export function getMeta() {
    return INTERVIEWS_META
}

