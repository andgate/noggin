import { UserSettings } from '@noggin/types/user-settings-types'
import { Mod } from './module-types'

export interface NogginStoreSchema {
    userSettings: UserSettings
    modules: Mod[]
}
