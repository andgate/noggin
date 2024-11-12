import { useInterval } from '@mantine/hooks'
import { Question, Quiz } from '@renderer/types/quiz-view-types'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export interface ActiveQuizState {
    quiz?: Quiz
    questions: Question[]
    studentResponses: string[]
    startTime?: string
    endTime?: string
    elapsedTime: number
}

export interface ActiveQuizContext {
    activeQuizState: ActiveQuizState
    quizId?: number
    timeLimit?: number
    elapsedTime: number
    setActiveQuizState: React.Dispatch<React.SetStateAction<ActiveQuizState>>
    isQuizInProgress: boolean
    startQuiz: (newQuiz: Quiz) => void
    submitActiveQuiz: () => void
    setStudentResponses: (responses: string[]) => void
}

const ActiveQuizContext = createContext<ActiveQuizContext | undefined>(undefined)

export const ActiveQuizProvider = ({ children }: { children: React.ReactNode }) => {
    const [activeQuizState, setActiveQuizState] = useState<ActiveQuizState>({
        questions: [],
        studentResponses: [],
        elapsedTime: 0,
    })

    const quizId = useMemo(() => activeQuizState.quiz?.id, [activeQuizState.quiz?.id])

    const elapsedTime: number = useMemo(
        () => activeQuizState.elapsedTime,
        [activeQuizState.elapsedTime]
    )
    const timeLimit: number | undefined = useMemo(
        () => activeQuizState.quiz?.timeLimit,
        [activeQuizState.quiz?.timeLimit]
    )
    const timeLimitInSeconds = useMemo(() => (timeLimit ? timeLimit * 60 : undefined), [timeLimit])

    const isQuizInProgress: boolean = useMemo(() => {
        return Boolean(activeQuizState.startTime && !activeQuizState.endTime)
    }, [activeQuizState.startTime, activeQuizState.endTime])

    const timer = useInterval(() => {
        setActiveQuizState((prev) => ({
            ...prev,
            elapsedTime: prev.elapsedTime + 1,
        }))
    }, timeLimitInSeconds || 0)

    useEffect(() => {
        if (activeQuizState.startTime && !timer.active) {
            timer.start()
        } else if (!activeQuizState.startTime && timer.active) {
            timer.stop()
        }
        return () => timer.stop()
    }, [activeQuizState, timer])

    const startQuiz = useCallback(
        (newQuiz: Quiz) => {
            setActiveQuizState(() => ({
                quiz: newQuiz,
                questions: newQuiz.questions,
                studentResponses: [],
                startTime: new Date().toISOString(),
                endTime: undefined,
                elapsedTime: 0,
            }))
        },
        [setActiveQuizState]
    )

    const submitActiveQuiz = useCallback(() => {
        setActiveQuizState((prev) => ({
            ...prev,
            endTime: new Date().toISOString(),
        }))
    }, [setActiveQuizState])

    const setStudentResponses = useCallback(
        (responses: string[]) => {
            setActiveQuizState((prev) => ({
                ...prev,
                studentResponses: responses,
            }))
        },
        [setActiveQuizState]
    )

    return (
        <ActiveQuizContext.Provider
            value={{
                activeQuizState,
                quizId,
                elapsedTime,
                timeLimit,
                setActiveQuizState,
                startQuiz,
                submitActiveQuiz,
                setStudentResponses,
                isQuizInProgress,
            }}
        >
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
