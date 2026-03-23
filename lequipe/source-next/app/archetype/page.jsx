'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCollection } from '@/hooks/useCollection'
import ArchetypeSelection from '@/components/ArchetypeSelection/ArchetypeSelection'
import styles from './page.module.css'

function ArchetypeContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const collection = useCollection()

    if (!collection.loaded) return null

    // L'arbitre ne s'ouvre tout seul que si on vient de l'accueil (param welcome=true)
    const isFirstWelcome = searchParams.get('welcome') === 'true'

    return (
        <main className={styles.container}>
            <ArchetypeSelection
                onSelect={(archId) => {
                    collection.setArchetype(archId)
                    router.push('/interviews')
                }}
                onSkip={() => {
                    collection.setArchetype(null)
                    router.push('/interviews')
                }}
            />
        </main>
    )
}

export default function ArchetypePage() {
    return (
        <Suspense>
            <ArchetypeContent />
        </Suspense>
    )
}
