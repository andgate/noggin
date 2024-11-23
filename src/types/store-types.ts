import { ActiveQuizState } from '@noggin/types/active-quiz-types'
import { UserSettings } from '@noggin/types/user-settings-types'
import { ModKitOverview } from './mod-types'

export interface NogginStoreSchema {
    userSettings: UserSettings
    activeQuizState?: ActiveQuizState
    modkits: ModKitOverview[]
}
