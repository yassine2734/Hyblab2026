'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { JOUEURS } from '@/lib/data/archetype_joueurs'
import { withBasePath } from '@/lib/withBasePath'
import styles from './articles.module.css'
import HelpGuide from '@/components/HelpGuide/HelpGuide'
import HELP_DATA from '@/data/help_data.json'

export default function ArticlesPage() {
  const [sortBy, setSortBy] = useState('alpha') // 'alpha', 'pays', 'date'

  const articlesSteps = useMemo(() => {
    return HELP_DATA.find(p => p.page === 'articles')?.steps || []
  }, [])

  const sortedPlayers = useMemo(() => {
    let result = [...JOUEURS]
    
    if (sortBy === 'alpha') {
      result.sort((a, b) => a.nom.localeCompare(b.nom))
    } else if (sortBy === 'pays') {
      result.sort((a, b) => a.pays.localeCompare(b.pays) || a.nom.localeCompare(b.nom))
    } else if (sortBy === 'date') {
      result.sort((a, b) => {
        const yearA = parseInt(a.mondial.split(',')[0]) || 0
        const yearB = parseInt(b.mondial.split(',')[0]) || 0
        return yearB - yearA || a.nom.localeCompare(b.nom)
      })
    }
    
    return result
  }, [sortBy])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className={styles.pageWrapper}>
      <motion.div 
        className={styles.container}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
      <HelpGuide 
        steps={articlesSteps} 
        pageName="articles"
        autoOpenHelp={true}
      />

      <motion.header className={styles.header} variants={itemVariants}>
        <h1 className={styles.title}>Les Entretiens</h1>
        <p className={styles.subtitle}>
          Retrouvez l'intégralité des 33 témoignages qui ont marqué l'histoire de la Coupe du Monde.
        </p>

        <div className={styles.sortBar}>
          <span className={styles.sortLabel}>Trier par :</span>
          <div className={styles.sortOptions}>
            <button 
              className={`${styles.sortBtn} ${sortBy === 'alpha' ? styles.activeBtn : ''}`}
              onClick={() => setSortBy('alpha')}
            >
              Joueur (A-Z)
            </button>
            <button 
              className={`${styles.sortBtn} ${sortBy === 'pays' ? styles.activeBtn : ''}`}
              onClick={() => setSortBy('pays')}
            >
              Pays
            </button>
            <button 
              className={`${styles.sortBtn} ${sortBy === 'date' ? styles.activeBtn : ''}`}
              onClick={() => setSortBy('date')}
            >
              Édition CDM
            </button>
          </div>
        </div>
      </motion.header>

      <motion.div className={styles.list} variants={containerVariants}>
        {sortedPlayers.map((player) => {
          const photoSrc = player.image || null
          return (
            <motion.div key={player.slug} variants={itemVariants}>
              <Link 
                href={`/interviews/${player.slug}`}
                className={styles.card}
              >
                <div className={styles.photoWrapper}>
                  {photoSrc ? (
                    <img 
                      src={withBasePath(photoSrc)} 
                      alt={player.nom} 
                      className={styles.photo}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.photoPlaceholder}>
                      {player.nom.charAt(0)}
                    </div>
                  )}
                </div>
                <div className={styles.content}>
                  <h2 className={styles.name}>{player.nom}</h2>
                  <div className={styles.meta}>
                    <span>{player.pays}</span>
                    <div className={styles.dot} />
                    <span>{player.mondial}</span>
                  </div>
                </div>
                <div className={styles.arrow}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
      </motion.div>
    </div>
  )
}
