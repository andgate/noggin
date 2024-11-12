import Store from 'electron-store'
import { ActiveQuizState } from '../hooks/use-active-quiz'
import { UserSettings } from '../types/user-settings-types'

export interface NogginStoreSchema {
    userSettings: UserSettings
    activeQuiz?: ActiveQuizState
}

export const store = new Store<NogginStoreSchema>({
    defaults: {
        userSettings: {},
    },
})
