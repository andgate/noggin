import { generateQuiz, GenerateQuizOptions } from '../services/quiz-generation-service'
import { PartialGeneratedQuiz } from '../types/quiz-generation-types'
import { GenerativeProvider, useGenerative } from './use-generative'

export interface QuizGenerator {
    generateQuiz: (options: GenerateQuizOptions) => void
    quiz: PartialGeneratedQuiz
    isRunning: boolean
    quizGenerationError?: Error
    abort: () => void
}

/**
 * Hook that provides quiz generation functionality using the generative context
 */
export function useQuizGenerator(): QuizGenerator {
    const { invoke, state, isRunning, error, abort } = useGenerative<
        GenerateQuizOptions,
        PartialGeneratedQuiz
    >()
    return { generateQuiz: invoke, quiz: state, isRunning, quizGenerationError: error, abort }
}

/**
 * Provider component for quiz generation
 */
export function QuizGeneratorProvider({ children }: { children: React.ReactNode }) {
    return <GenerativeProvider generativeFunction={generateQuiz}>{children}</GenerativeProvider>
}
