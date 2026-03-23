# L'Équipe — Paroles de Légendes

> Redécouvrez les légendes de la Coupe du Monde à travers leurs interviews exclusives et collectionnez leurs cartes.

Application web interactive qui met en valeur **33+ interviews d'archives** de L'Équipe, jamais publiées en version digitale, à destination d'un public de moins de 35 ans. Le projet combine storytelling, gamification (collection de cartes, trophées) et personnalisation (profil fan) pour rendre ces contenus accessibles et engageants.

**Projet réalisé dans le cadre du Hyblab 2026** — Polytech Nantes × École de Design Nantes Atlantique × L'Équipe.

---

## Équipe — "La VAR"

### Polytech Nantes — Développement

| Membre | Rôle |
|--------|------|
| Yassine El Maghraoui | Développement & données |
| Moutassim Djodallah | Développement & Architecture |
| Amine Tighiouart | Développement (archétype & interviews) |
| Denis-Marius Vladu | Développement (collection) |
| Ayman Mellas | Développement (archétype & accueil) |

### École de Design Nantes Atlantique — Design

| Membre | Rôle |
|--------|------|
| Marie Baguelin | Design |
| Juliette Matelot | Design |
| Olivier Ahehehinnou | Design |

**Encadrant projet** : Maxime Malécot (L'Équipe)

---

## Fonctionnalités principales

- **Profil Fan (Archétype)** — Découvrez votre personnalité football parmi 6 profils : L'Artiste, Le Stratège, Le Curieux, L'Historien, Le Supporter, Amoureux du Maillot
- **Navigation intelligente** — Les interviews sont triées et filtrées selon votre archétype, avec 11 catégories thématiques
- **Collection de cartes** — Débloquez des cartes en lisant les interviews, progressez à travers les tiers Bronze → Argent → Or
- **Guide interactif** — L'Arbitre, un personnage tutoriel, vous accompagne page par page
- **Design sonore** — Ambiance sonore immersive avec effets contextuels (sifflet, transitions)
- **Responsive & accessible** — Mobile-first, navigation clavier, respect de `prefers-reduced-motion`

---

## Stack technique

| Catégorie | Technologie |
|-----------|-------------|
| Framework | Next.js 16 (App Router, export statique) |
| UI | React 18, CSS Modules |
| Animations | Framer Motion |
| State | Custom hook + localStorage |
| Package manager | pnpm |
| Déploiement | Export statique vers `/lequipe` |

---

## Démarrage rapide

```bash
# Installer les dépendances
pnpm install

# Lancer le serveur de développement
pnpm dev

# Ou avec Turbopack (plus rapide)
pnpm dev:turbo

# Build de production (export statique)
pnpm build
```

Le site de développement est accessible sur `http://localhost:3000`.
Le build de production génère les fichiers statiques dans `./out/`.

---

## Architecture du projet

```
equipe/
│
├── app/                                # Pages (Next.js App Router)
│   ├── layout.jsx                      # Layout racine (metadata, fonts, favicon)
│   ├── globals.css                     # Design tokens, reset CSS, variables globales
│   ├── page.jsx                        # Page d'accueil (intro cinématique animée)
│   ├── archetype/page.jsx              # Sélection du profil fan (carousel de cartes)
│   ├── interviews/
│   │   ├── page.jsx                    # Fil d'interviews filtrable par thème
│   │   └── [slug]/
│   │       ├── page.jsx                # Route dynamique + generateStaticParams
│   │       └── InterviewDetail.jsx     # Lecteur d'interview complet
│   ├── articles/page.jsx              # Archive triable (par joueur, pays, édition CDM)
│   ├── collection/page.jsx            # Galerie de cartes + progression trophées
│   └── credits/page.jsx               # Crédits de l'équipe et partenaires
│
├── components/                         # Composants réutilisables
│   ├── SiteShell.jsx                   # Wrapper global (Header + Footer + Menu)
│   ├── Navbar/Header.jsx              # Barre de navigation sticky
│   ├── Footer/Footer.jsx             # Pied de page
│   ├── Menu/Menu.jsx                  # Menu slide-out mobile/desktop
│   ├── ArchetypeSelection/            # Carousel interactif des archétypes
│   ├── CollectionPage/                # Galerie de cartes + tiers de trophées
│   └── HelpGuide/                     # Système d'aide contextuel (L'Arbitre)
│
├── hooks/
│   └── useCollection.jsx              # Hook central : archétype, cartes, articles lus, trophées
│
├── lib/                                # Utilitaires et accès aux données
│   ├── withBasePath.js                # Helper pour le préfixe /lequipe en production
│   └── data/
│       ├── archetypes.js              # 6 archétypes (id, label, couleur, description)
│       ├── categories.js             # 11 thèmes + matrice archétype→priorité
│       ├── archetype_joueurs.js      # 33+ profils joueurs avec citations par thème
│       ├── interviews.js             # Chargement des textes complets
│       ├── card_images.js            # Mapping slug → image de carte
│       └── quiz.js                    # Placeholder pour extensions futures
│
├── data/                               # Sources de données JSON
│   ├── interviews_db_ready.json       # Textes complets des 33+ interviews (~550 KB)
│   └── help_data.json                 # Étapes du guide d'aide par page
│
├── public/                             # Assets statiques
│   ├── home/images/                   # Silhouettes joueurs (intro)
│   ├── home/sons/                     # Effets sonores (sifflet, ambiance, boutons)
│   ├── archetypes/                    # Illustrations des 6 archétypes
│   ├── categorie/                     # Icônes des 11 thèmes (SVG)
│   ├── cartes_itw/                    # Photos de profil joueurs
│   ├── cartes/                        # Images des cartes collection
│   ├── Carte_block/                   # Dos de cartes (verrouillées)
│   ├── arbitre/                       # Illustrations de L'Arbitre
│   ├── navbar/                        # Icônes de navigation
│   ├── credits/                       # Photos équipe et logos partenaires
│   ├── typo/                          # Polices custom (LEQUIPE, Anek, AnekExpanded)
│   └── icone/                         # Favicon
│
├── next.config.js                      # Config Next.js (export statique, basePath)
├── package.json                        # Dépendances et scripts
├── pnpm-lock.yaml                     # Lock file pnpm
├── jsconfig.json                       # Alias de chemins (@/*)
└── .eslintrc.json                      # Règles ESLint (core web vitals)
```

---

## Parcours utilisateur

```
Accueil (intro animée)
    │
    ▼
Choix de l'archétype (6 profils fan)
    │
    ▼
Fil d'interviews ──────────► Archive complète
(filtré par thème              (tri par joueur,
 et archétype)                  pays, édition CDM)
    │
    ▼
Lecture d'une interview
(débloque la carte du joueur)
    │
    ▼
Collection de cartes
(progression Bronze → Argent → Or)
```

---

## Modèle de données

### Archétypes

Chaque archétype possède un `id`, un `label`, une `color` et une `description`. Il détermine l'ordre de priorité des 11 catégories thématiques via une matrice de correspondance dans `categories.js`.

### Joueurs (`archetype_joueurs.js`)

```js
{
  slug: 'pele-1958',
  nom: 'Pelé',
  pays: 'Brésil',
  mondial: '1958',
  poste: 'Attaquant',
  archetype: "L'artiste",
  image: '/cartes_itw/Pelé.png',
  citations: { /* citations par thème */ },
  theme_citations: { /* meilleure citation par thème */ },
  titre_interview: '« ... »',
  date_publication: '11/06/2014',
  temps_lecture: '9 min'
}
```

### Catégories thématiques

11 thèmes (parcours professionnel, contexte historique, vie d'équipe, émotions, technique de jeu, etc.) avec une matrice de priorité par archétype pour personnaliser l'affichage.

### État utilisateur (`useCollection`)

```js
{
  archetype: 'l_artiste',           // Profil sélectionné
  cartes_collectees: ['slug1', …],  // Cartes débloquées
  articles_lus: ['slug1', …],       // Interviews lues
  trophees_claimes: ['bronze', …]   // Trophées réclamés
}
```

Persisté dans `localStorage` (clé : `equipekit_collection`). Fonctionne en mode navigation privée avec fallback en mémoire.

---

## Système de style

- **CSS Modules** pour l'isolation des styles par composant (aucun conflit de classes)
- **Design tokens** définis dans `globals.css` (couleurs, typographies, espacements, transitions)
- **Mobile-first** avec breakpoints à 600px (tablette) et 1024px (desktop)
- **Typographie fluide** via `clamp()` pour un rendu adaptatif
- **Polices custom** : LEQUIPE (logo), Anek/AnekExpanded (titres), DM Sans (corps), Outfit, Inter

### Palette

| Rôle | Couleur |
|------|---------|
| Fond principal | `#F3DFD8` |
| Texte | `#3A3635` |
| Accent | `#E2001A` |
| L'Artiste | `#BA9546` |
| Le Stratège | `#334CFD` |
| Le Curieux | `#ADEB03` |
| L'Historien | `#894954` |
| Le Supporter | `#D27046` |
| Amoureux du Maillot | `#69E4B6` |

---

## Déploiement

Le site est exporté en fichiers statiques pour être hébergé sous le chemin `/lequipe` :

```bash
pnpm build
# Les fichiers sont générés dans ./out/
# Déployer le contenu de ./out/ vers le répertoire /lequipe/ du serveur
```

La configuration du `basePath` et `assetPrefix` dans `next.config.js` garantit que tous les liens et assets fonctionnent correctement sous ce sous-chemin. L'utilitaire `withBasePath()` est utilisé dans le code pour préfixer les chemins statiques.

Aucune variable d'environnement ni clé API n'est nécessaire — le site est entièrement statique.

---

## Partenaires

Hyblab · Polytech Nantes · École de Design Nantes Atlantique · Nantes Université · Ouest Medialab · Nantes Métropole

---

## Licence

Interviews © L'Équipe — Tous droits réservés.
Code sous licence Creative Commons BY 3.0 FR.
