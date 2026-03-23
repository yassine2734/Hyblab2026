'use client'

import { useRouter } from 'next/navigation'
import { useCollection } from '@/hooks/useCollection'
import CollectionPage from '@/components/CollectionPage/CollectionPage'
import { getInterviewsList } from '@/lib/data/interviews'
import styles from './page.module.css'

// --- AJOUT ARBITRE ---
import HelpGuide from "@/components/HelpGuide/HelpGuide";
import HELP_DATA from "@/data/help_data.json";
// --------------------

export default function CollectionRoute() {
    const router = useRouter()
    const collection = useCollection()

    if (!collection.loaded) return null

    const allInterviews = getInterviewsList()

    // Robust count: only interviews that actually have a matching saved ID
    const nbCollected = allInterviews.filter(iv => {
        const ids = [iv.slug, iv._index !== undefined ? String(iv._index) : null, iv.index !== undefined ? String(iv.index) : null].filter(Boolean)
        return collection.cartesCollectees.some(s => ids.includes(String(s)))
    }).length

    return (
        <main className={styles.container}>
            <CollectionPage
                cartesCollectees={collection.cartesCollectees}
                nbCollected={nbCollected}
                tropheesClaimes={collection.tropheesClaimes}
                revendiquerTrophee={collection.revendiquerTrophee}
                interviews={allInterviews}
                onBackToFeed={() => router.push('/interviews')}
            />

            {/* --- BLOC ARBITRE (MODIFIABLE FACILEMENT) --- */}
            <HelpGuide
                steps={HELP_DATA.find(h => h.page === 'collection')?.steps || []}
                autoOpen
                autoOpenKey="help_seen_collection"
            />
            {/* -------------------------------------------- */}
        </main>
    )
}
