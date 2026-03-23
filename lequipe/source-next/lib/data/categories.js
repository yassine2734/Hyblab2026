/**
 * Category definitions and the archetype → category matrice.
 *
 * @typedef {'primary' | 'secondary' | 'hidden'} Priority
 */

/** @type {{ id: string, label: string, icon: string, emoji: string }[]} */
export const CATEGORIES = [

    { id: 'parcours_professionnel', label: 'Parcours professionnel', icon: '/categorie/parcours_professionnel.svg' },
    { id: 'contexte_historique', label: 'Contexte historique', icon: '/categorie/contexte_historique.svg' },
    { id: 'vie_equipe', label: "Vie d'équipe", icon: '/categorie/vie_equipe.svg' },
    { id: 'ressentis_emotions', label: 'Ressentis et émotions', icon: '/categorie/ressentis_emotions.svg' },
    { id: 'grands_moments_sportifs', label: 'Grands moments sportifs', icon: '/categorie/grands_moments_sportifs.svg' },
    { id: 'technique_jeu', label: 'Technique de jeu', icon: '/categorie/technique_jeu.svg' },
    { id: 'ethique_justice', label: 'Éthique et justice', icon: '/categorie/ethique_justice.svg' },
    { id: 'anecdotes_vie_privee', label: 'Anecdotes & Vie privée', icon: '/categorie/anecdotes_vie_privee.svg' },
    { id: 'preparation_condition_physique', label: 'Préparation & Condition physique', icon: '/categorie/preparation_condition_physique.svg' },
    { id: 'heritage_posterite', label: 'Héritage & Postérité', icon: '/categorie/heritage_posterite.svg' },
    { id: 'psychologie_emotion', label: 'Psychologie et émotion', icon: '/categorie/psychologie_emotion.svg' },

]

export const CATEGORIES_BY_ID = Object.fromEntries(
    CATEGORIES.map(c => [c.id, c])
)

/**
 * Matrice: archetype → category → rank (1 = le plus pertinent, ordre croissant)
 *
 * Classement basé sur l'identité de chaque profil de fan :
 *   L'artiste    → esthétique, émotion, créativité
 *   L'historien  → mémoire, contexte, héritage
 *   Le supporter → ferveur, collectif, passion
 *   Le patriote  → fierté nationale, grands moments, héritage
 *   Le stratège  → tactique, analyse, données
 *   Le curieux   → anecdotes, coulisses, découverte
 *
 * @type {Record<string, Record<string, number>>}
 */
export const MATRICE = {
    l_artiste: {
        technique_jeu: 1,
        ressentis_emotions: 2,
        psychologie_emotion: 3,
        anecdotes_vie_privee: 4,
        vie_equipe: 5,
        grands_moments_sportifs: 6,
        heritage_posterite: 7,
        contexte_historique: 8,
        parcours_professionnel: 9,
        ethique_justice: 10,
        preparation_condition_physique: 11,
    },
    l_historien: {
        contexte_historique: 1,
        heritage_posterite: 2,
        grands_moments_sportifs: 3,
        parcours_professionnel: 4,
        anecdotes_vie_privee: 5,
        technique_jeu: 6,
        ethique_justice: 7,
        vie_equipe: 8,
        ressentis_emotions: 9,
        psychologie_emotion: 10,
        preparation_condition_physique: 11,
    },
    le_supporter: {
        ressentis_emotions: 1,
        psychologie_emotion: 2,
        vie_equipe: 3,
        grands_moments_sportifs: 4,
        anecdotes_vie_privee: 5,
        contexte_historique: 6,
        ethique_justice: 7,
        heritage_posterite: 8,
        parcours_professionnel: 9,
        technique_jeu: 10,
        preparation_condition_physique: 11,
    },
    le_patriote: {
        grands_moments_sportifs: 1,
        ressentis_emotions: 2,
        contexte_historique: 3,
        heritage_posterite: 4,
        psychologie_emotion: 5,
        vie_equipe: 6,
        parcours_professionnel: 7,
        ethique_justice: 8,
        anecdotes_vie_privee: 9,
        technique_jeu: 10,
        preparation_condition_physique: 11,
    },
    le_stratege: {
        technique_jeu: 1,
        preparation_condition_physique: 2,
        grands_moments_sportifs: 3,
        parcours_professionnel: 4,
        contexte_historique: 5,
        heritage_posterite: 6,
        ethique_justice: 7,
        vie_equipe: 8,
        psychologie_emotion: 9,
        ressentis_emotions: 10,
        anecdotes_vie_privee: 11,
    },
    le_curieux: {
        anecdotes_vie_privee: 1,
        ethique_justice: 2,
        contexte_historique: 3,
        heritage_posterite: 4,
        psychologie_emotion: 5,
        vie_equipe: 6,
        parcours_professionnel: 7,
        ressentis_emotions: 8,
        grands_moments_sportifs: 9,
        technique_jeu: 10,
        preparation_condition_physique: 11,
    },
}

/**
 * Get rank for a category within an archetype (1 = top priority).
 * @param {string} archetypeId
 * @param {string} categoryId
 * @returns {number}
 */
export function getCategoryPriority(archetypeId, categoryId) {
    return MATRICE[archetypeId]?.[categoryId] ?? 99
}

/**
 * Filter and sort sections for a given archetype using the matrice.
 * Sorted by rank ascending (1 first).
 * @param {string} archetypeId
 * @param {{ id: string }[]} sections
 * @returns {{ id: string }[]}
 */
export function filterSectionsForArchetype(archetypeId, sections) {
    if (!archetypeId || !MATRICE[archetypeId]) return sections

    const matrice = MATRICE[archetypeId]
    return [...sections].sort((a, b) =>
        (matrice[a.id] ?? 99) - (matrice[b.id] ?? 99)
    )
}
