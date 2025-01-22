import { NogginStoreSchema } from '@noggin/types/store-types'
import { useCallback } from 'react'

export function useNogginStore() {
    const getStoreValue = useCallback(
        async <K extends keyof NogginStoreSchema>(key: K): Promise<NogginStoreSchema[K]> => {
            return window.api.store.get(key)
        },
        []
    )

    const setStoreValue = useCallback(
        async <K extends keyof NogginStoreSchema>(
            key: K,
            value: NogginStoreSchema[K]
        ): Promise<void> => {
            return window.api.store.set(key, value)
        },
        []
    )

    const removeStoreValue = useCallback(async (key: keyof NogginStoreSchema): Promise<void> => {
        return window.api.store.delete(key)
    }, [])

    const clearStore = useCallback(async (): Promise<void> => {
        return window.api.store.clear()
    }, [])

    return { getStoreValue, setStoreValue, removeStoreValue, clearStore }
}
