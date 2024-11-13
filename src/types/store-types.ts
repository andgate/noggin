import { ActiveQuizState } from '@noggin/types/active-quiz-types'
import { UserSettings } from '@noggin/types/user-settings-types'

export interface NogginStoreSchema {
    userSettings: UserSettings
    activeQuizState?: ActiveQuizState
}
