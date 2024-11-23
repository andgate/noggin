import { ActiveQuizState } from '@noggin/types/active-quiz-types'
import { Quiz } from '@noggin/types/quiz-types'
import { produce } from 'immer'
import { create } from 'zustand'

interface QuizStore {
    activeQuiz: ActiveQuizState
    startQuiz: (quiz: Quiz) => void
    endQuiz: () => void
    setStudentResponses: (responses: string[]) => void
    clearQuiz: () => void
    incrementElapsedTime: () => void
}

export const useQuizStore = create<QuizStore>((set) => ({
    activeQuiz: {
        questions: [],
        studentResponses: [],
        elapsedTime: 0,
    },

    startQuiz: (quiz: Quiz) =>
        set({
            activeQuiz: {
                quiz,
                questions: quiz.questions,
                studentResponses: [],
                startTime: new Date().toISOString(),
                endTime: undefined,
                elapsedTime: 0,
            },
        }),

    endQuiz: () =>
        set(
            produce((draft) => {
                draft.activeQuiz.endTime = new Date().toISOString()
            })
        ),

    setStudentResponses: (responses: string[]) =>
        set(
            produce((draft) => {
                draft.activeQuiz.studentResponses = responses
            })
        ),

    clearQuiz: () =>
        set({
            activeQuiz: {
                questions: [],
                studentResponses: [],
                elapsedTime: 0,
            },
        }),

    incrementElapsedTime: () =>
        set(
            produce((draft) => {
                draft.activeQuiz.elapsedTime += 1
            })
        ),
}))
