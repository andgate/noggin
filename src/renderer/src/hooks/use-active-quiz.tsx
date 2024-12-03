// import { ActiveQuizState } from '@noggin/types/active-quiz-types'
// import { Quiz } from '@noggin/types/quiz-types'
// import { useNavigate } from '@tanstack/react-router'
// import { produce } from 'immer'
// import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
// import { useInterval } from 'usehooks-ts'

// export interface ActiveQuizContext {
//     activeQuizState: ActiveQuizState
//     quizId?: number
//     timeLimit?: number
//     elapsedTime: number
//     setActiveQuizState: React.Dispatch<React.SetStateAction<ActiveQuizState>>
//     isQuizInProgress: boolean
//     startQuiz: (newQuiz: Quiz) => void
//     endQuiz: () => void
//     setStudentResponses: (responses: string[]) => void
//     clearQuizState: () => void
// }

// const ActiveQuizContext = createContext<ActiveQuizContext | undefined>(undefined)

// export const ActiveQuizProvider = ({ children }: { children: React.ReactNode }) => {
//     const navigate = useNavigate()
//     const [activeQuizState, setActiveQuizState] = useState<ActiveQuizState>(() => ({
//         questions: [],
//         studentResponses: [],
//         elapsedTime: 0,
//     }))

//     // Load initial state on mount
//     useEffect(() => {
//         window.api.store.get('activeQuizState').then((savedState) => {
//             console.log('activeQuizState loaded ==>', savedState)
//             if (savedState && savedState.endTime) {
//                 // If the quiz is already ended, clear the state
//                 clearQuizState()
//             } else if (savedState) {
//                 setActiveQuizState(savedState)
//             }
//         })
//     }, [])

//     const quizId = useMemo(() => activeQuizState.quiz?.id, [activeQuizState.quiz?.id])

//     const elapsedTime: number = useMemo(
//         () => activeQuizState.elapsedTime,
//         [activeQuizState.elapsedTime]
//     )
//     const timeLimitInMinutes: number | undefined = useMemo(
//         () => activeQuizState.quiz?.timeLimit,
//         [activeQuizState.quiz?.timeLimit]
//     )
//     const timeLimit = useMemo(
//         () => (timeLimitInMinutes ? timeLimitInMinutes * 60 : undefined),
//         [timeLimitInMinutes]
//     )

//     const isQuizInProgress: boolean = useMemo(() => {
//         return Boolean(activeQuizState.startTime && !activeQuizState.endTime)
//     }, [activeQuizState.startTime, activeQuizState.endTime])

//     useEffect(() => {
//         console.log('timeLimitInSeconds', timeLimit)
//     }, [timeLimit])

//     const startQuiz = useCallback(
//         (newQuiz: Quiz) => {
//             const newState = {
//                 quiz: newQuiz,
//                 questions: newQuiz.questions,
//                 studentResponses: [],
//                 startTime: new Date().toISOString(),
//                 endTime: undefined,
//                 elapsedTime: 0,
//             }
//             setActiveQuizState(newState)
//             window.api.store.set('activeQuizState', newState)
//         },
//         [setActiveQuizState]
//     )

//     const submitActiveQuiz = useCallback(() => {
//         setActiveQuizState(
//             produce((draft) => {
//                 draft.endTime = new Date().toISOString()
//             })
//         )
//     }, [setActiveQuizState])

//     const setStudentResponses = useCallback(
//         (responses: string[]) => {
//             setActiveQuizState(
//                 produce((draft) => {
//                     draft.studentResponses = responses
//                     window.api.store.set('activeQuizState', draft)
//                 })
//             )
//         },
//         [setActiveQuizState]
//     )

//     const clearQuizState = useCallback(() => {
//         setActiveQuizState({
//             questions: [],
//             studentResponses: [],
//             elapsedTime: 0,
//         })
//         window.api.store.set('activeQuizState', null)
//     }, [])

//     const endQuiz = useCallback(async () => {
//         console.log('endQuiz called')
//         if (!isQuizInProgress) return

//         setActiveQuizState(
//             produce((draft) => {
//                 draft.endTime = new Date().toISOString()
//                 window.api.store.set('activeQuizState', draft)
//             })
//         )

//         // Navigate to evaluation page
//         navigate({
//             to: '/quiz/eval',
//             params: { quizId: `${quizId}` },
//         })
//     }, [isQuizInProgress, timeLimit, quizId, submitActiveQuiz, navigate])

//     useInterval(
//         () => {
//             if (isQuizInProgress && timeLimit && activeQuizState.elapsedTime >= timeLimit) {
//                 endQuiz()
//                 return
//             }

//             if (isQuizInProgress) {
//                 setActiveQuizState(
//                     produce((draft) => {
//                         draft.elapsedTime += 1
//                         window.api.store.set('activeQuizState', draft)
//                     })
//                 )
//             }
//         },
//         isQuizInProgress ? 1000 : null
//     )

//     return (
//         <ActiveQuizContext.Provider
//             value={{
//                 activeQuizState,
//                 quizId,
//                 elapsedTime,
//                 timeLimit,
//                 setActiveQuizState,
//                 startQuiz,
//                 endQuiz,
//                 setStudentResponses,
//                 isQuizInProgress,
//                 clearQuizState,
//             }}
//         >
//             {children}
//         </ActiveQuizContext.Provider>
//     )
// }

// /**
//  * Stateful hook that provides the current environment for the active quiz.
//  *
//  * When a user starts practicing a quiz, we want to keep track of the current state of the quiz globally.
//  * This allows us to resume practice sessions from the same point in the future.
//  */
// export function useActiveQuiz(): ActiveQuizContext {
//     const context = useContext(ActiveQuizContext)
//     if (!context) {
//         throw new Error('useActiveQuiz must be used within an ActiveQuizProvider')
//     }
//     return context
// }
