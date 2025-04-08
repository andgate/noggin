import { NogginStoreSchema } from '@noggin/types/store-types'
import Store from 'electron-store'

// Initialize store
const store = new Store<NogginStoreSchema>({
    defaults: {
        userSettings: {
            libraryPaths: [],
        },
        libraryIndex: {},
    },
})

// Type-safe store operations
export function getStoreValue<K extends keyof NogginStoreSchema>(key: K): NogginStoreSchema[K] {
    return store.get(key)
}

export function setStoreValue<K extends keyof NogginStoreSchema>(
    key: K,
    value: NogginStoreSchema[K]
): void {
    store.set(key, value)
}

export function deleteStoreValue(key: keyof NogginStoreSchema): void {
    store.delete(key)
}

export function clearStore(): void {
    store.clear()
}
