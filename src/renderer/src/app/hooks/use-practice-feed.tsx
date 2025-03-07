import { Mod } from '@noggin/types/module-types'
import { Submission } from '@noggin/types/quiz-types'
import { createContext, useContext } from 'react'

export type PracticeFeedContextType = {
    getDueModules: () => Promise<Mod[]>
    updateReviewSchedule: (
        libraryId: string,
        moduleId: string,
        submission: Submission
    ) => Promise<boolean>
}

export const PracticeFeedContext = createContext<PracticeFeedContextType>(window.api.practiceFeed)

export function PracticeFeedProvider({ children }: { children: React.ReactNode }) {
    return (
        <PracticeFeedContext.Provider value={window.api.practiceFeed}>
            {children}
        </PracticeFeedContext.Provider>
    )
}

export function usePracticeFeed() {
    return useContext(PracticeFeedContext)
}
