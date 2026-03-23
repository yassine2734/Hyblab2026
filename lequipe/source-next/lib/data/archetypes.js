/**
 * Archetype definitions — the single source of truth for archetype metadata.
 * Maps the 9 archetypes from interviews_tagged.json to display properties.
 *
 * @typedef {Object} Archetype
 * @property {string} id - Snake_case ID matching interviews_tagged.json (e.g. "l_artiste")
 * @property {string} slug - URL-friendly slug
 * @property {string} label - Display name in French
 * @property {string} description - Short description from legende_archetypes
 * @property {string} color - Hex color for the card
 * @property {string} image - Path to the archetype illustration
 */

/** @type {Archetype[]} */
export const ARCHETYPES = [
    {
        id: 'l_artiste',
        slug: 'l-artiste',
        label: "L'artiste",
        description: 'Beau jeu, esthétique, magie du football',
        backDescription: "Pour vous, le football est un art. Une feinte, une passe lumineuse ou un geste inattendu peuvent faire basculer un match dans la beauté. Vous aimez les joueurs qui inventent, qui osent et qui transforment le jeu en spectacle.",
        color: '#BA9546',
        image: "/archetypes/L'artiste.png",
    },
    {
        id: 'le_stratege',
        slug: 'le-stratege',
        label: 'Le stratège',
        description: 'Schémas, analyses, données, tactique',
        backDescription: "Vous observez le jeu dans ses moindres détails. Les systèmes, les déplacements, les choix tactiques : tout vous intéresse. Un match est pour vous une partie d'échecs où chaque mouvement peut changer l'équilibre du jeu.",
        color: '#334CFD',
        image: '/archetypes/Le_stratege.png',
    },
    {
        id: 'le_curieux',
        slug: 'le-curieux',
        label: 'Le curieux',
        description: 'Anecdotes insolites, découverte, coulisses',
        backDescription: "Vous aimez découvrir le football autrement. Anecdotes inattendues, histoires de vestiaires, trajectoires de joueurs : chaque détail peut révéler une nouvelle facette du jeu. Votre plaisir est d'explorer ce qui se cache derrière les matchs.",
        color: '#ADEB03',
        image: '/archetypes/Le_curieux.png',
    },
    {
        id: 'l_historien',
        slug: 'l-historien',
        label: "L'historien",
        description: "Nostalgie, mémoire, c'était mieux avant",
        backDescription: "Vous regardez le football avec la mémoire du jeu. Les grandes épopées, les générations mythiques et les récits qui ont marqué l'histoire vous fascinent. Pour vous, comprendre le présent passe toujours par se souvenir du passé.",
        color: '#894954',
        image: "/archetypes/L'historien.png",
    },
    {
        id: 'le_supporter',
        slug: 'le-supporter',
        label: 'Le supporter',
        description: 'Ferveur, tribunes, passion locale',
        backDescription: "Le football se vit avant tout ensemble. Les chants, les tribunes, les bars pleins les soirs de match, c'est cette ferveur collective qui vous anime. Ce que vous aimez le plus, c'est partager l'émotion du jeu avec les autres.",
        color: '#D27046',
        image: '/archetypes/Le_supporter.png',
    },
    {
        id: 'le_patriote',
        slug: 'le-patriote',
        label: 'Amoureux du maillot',
        description: 'Équipe nationale, fierté, résultats',
        backDescription: "Quand l'équipe nationale joue, tout s'arrête. Vous vibrez pour les couleurs, pour les grands tournois et pour ces moments où un pays entier retient son souffle. La fierté et les grandes victoires internationales sont au cœur de votre passion.",
        color: '#69E4B6',
        image: "/archetypes/L'amoureux_du_maillot.png",
    },
]

/** Lookup by ID (snake_case) */
export const ARCHETYPES_BY_ID = Object.fromEntries(
    ARCHETYPES.map(a => [a.id, a])
)

/** Lookup by slug (kebab-case) */
export const ARCHETYPES_BY_SLUG = Object.fromEntries(
    ARCHETYPES.map(a => [a.slug, a])
)

/**
 * Get archetype color by ID, with fallback.
 * @param {string} id
 * @returns {string}
 */
export function getArchetypeColor(id) {
    return ARCHETYPES_BY_ID[id]?.color || '#888888'
}

/**
 * Get archetype label by ID, with fallback.
 * @param {string} id
 * @returns {string}
 */
export function getArchetypeLabel(id) {
    return ARCHETYPES_BY_ID[id]?.label || id.replace(/_/g, ' ')
}
