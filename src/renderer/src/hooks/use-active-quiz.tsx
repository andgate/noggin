import { Question, Quiz } from '@renderer/types/quiz-view-types'
import { createContext, useContext, useState } from 'react'

export interface ActiveQuizState {
    quiz?: Quiz
    questions: Question[]
    studentResponses: string[]
    startTime: string
    endTime?: string
}

export interface ActiveQuizContext {
    activeQuizState: ActiveQuizState
    setActiveQuizState: React.Dispatch<React.SetStateAction<ActiveQuizState>>
}

const ActiveQuizContext = createContext<ActiveQuizContext | undefined>(undefined)

export const ActiveQuizProvider = ({ children }: { children: React.ReactNode }) => {
    const [activeQuizState, setActiveQuizState] = useState<ActiveQuizState>({
        questions: [],
        studentResponses: [],
        startTime: new Date().toISOString(),
    })

    return (
        <ActiveQuizContext.Provider value={{ activeQuizState, setActiveQuizState }}>
            {children}
        </ActiveQuizContext.Provider>
    )
}

/**
 * Stateful hook that provides the current environment for the active quiz.
 *
 * When a user starts practicing a quiz, we want to keep track of the current state of the quiz globally.
 * This allows us to resume practice sessions from the same point in the future.
 */
export function useActiveQuiz(): ActiveQuizContext {
    const context = useContext(ActiveQuizContext)
    if (!context) {
        throw new Error('useActiveQuiz must be used within an ActiveQuizProvider')
    }
    return context
}
