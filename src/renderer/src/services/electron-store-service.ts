import type { NogginStoreSchema } from '../../../types/store-types'

class Store {
    async get<K extends keyof NogginStoreSchema>(key: K): Promise<NogginStoreSchema[K]> {
        return window.api.store.get(key)
    }

    async set<K extends keyof NogginStoreSchema>(
        key: K,
        value: NogginStoreSchema[K]
    ): Promise<void> {
        return window.api.store.set(key, value)
    }

    async delete(key: keyof NogginStoreSchema): Promise<void> {
        return window.api.store.delete(key)
    }

    async clear(): Promise<void> {
        return window.api.store.clear()
    }
}

export const store = new Store()
