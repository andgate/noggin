import { NogginStoreSchema } from '@noggin/types/store-types'
import Store from 'electron-store'

// Initialize store
export const store = new Store<NogginStoreSchema>({
    defaults: {
        userSettings: {},
        modulePaths: [],
    },
})
