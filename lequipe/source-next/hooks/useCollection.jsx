'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'equipekit_collection'

export function useCollection() {
    const [state, setState] = useState({
        archetype: null,
        cartes_collectees: [],
        articles_lus: [],
        trophees_claimes: [],
    })
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (raw) setState(JSON.parse(raw))
        } catch { /* ignore corrupted storage */ }
        setLoaded(true)
    }, [])

    useEffect(() => {
        if (!loaded) return
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }, [state, loaded])

    const setArchetype = useCallback((id) => {
        setState(prev => ({ ...prev, archetype: id }))
    }, [])

    const collecterCarte = useCallback((id) => {
        if (!id) return;
        const stringId = String(id); 
        setState(prev => ({
            ...prev,
            cartes_collectees: prev.cartes_collectees.map(String).includes(stringId) 
                ? prev.cartes_collectees 
                : [...prev.cartes_collectees, stringId]
        }))
    }, [])

    const marquerLu = useCallback((id) => {
        if (!id) return;
        const stringId = String(id);
        setState(prev => ({
            ...prev,
            articles_lus: prev.articles_lus.map(String).includes(stringId) 
                ? prev.articles_lus 
                : [...prev.articles_lus, stringId]
        }))
    }, [])

    const estCollectee = useCallback((id) => {
        if (!id) return false;
        return state.cartes_collectees.some(sid => String(sid) === String(id))
    }, [state.cartes_collectees])

    const estLu = useCallback((id) => {
        if (!id) return false;
        return state.articles_lus.some(sid => String(sid) === String(id))
    }, [state.articles_lus])

    const getNiveau = (count, total) => {
        if (!total) return 'bronze'
        const ratio = count / total
        if (ratio >= 0.75) return 'platine'
        if (ratio >= 0.50) return 'or'
        if (ratio >= 0.25) return 'argent'
        return 'bronze'
    }

    const revendiquerTrophee = useCallback((tierId) => {
        setState(prev => ({
            ...prev,
            trophees_claimes: (prev.trophees_claimes || []).includes(tierId)
                ? prev.trophees_claimes
                : [...(prev.trophees_claimes || []), tierId]
        }))
    }, [])

    return {
        archetype: state.archetype,
        cartesCollectees: state.cartes_collectees,
        articlesLus: state.articles_lus,
        tropheesClaimes: state.trophees_claimes || [],
        loaded,
        setArchetype,
        collecterCarte,
        marquerLu,
        estCollectee,
        estLu,
        unlockCard: collecterCarte,
        markAsRead: marquerLu,
        getNiveau,
        revendiquerTrophee,
    }
}