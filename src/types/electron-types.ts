import { NogginStoreSchema } from './store-types'

export interface NogginElectronAPI {
    db: {
        execute: (
            sql: string,
            params: any[],
            method: 'run' | 'all' | 'values' | 'get'
        ) => Promise<any>
    }
    store: {
        get: (key: keyof NogginStoreSchema) => Promise<any>
        set: (key: keyof NogginStoreSchema, value: any) => Promise<void>
        delete: (key: keyof NogginStoreSchema) => Promise<void>
        clear: () => Promise<void>
    }
}
