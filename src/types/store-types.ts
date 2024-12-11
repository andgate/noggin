import { UserSettings } from '@noggin/types/user-settings-types'

export interface NogginStoreSchema {
    userSettings: UserSettings
    modulePaths: string[]
}
