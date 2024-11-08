import { generateQuiz, GenerateQuizOptions } from '../services/quiz-generation-service'
import { PartialGeneratedQuiz } from '../types/quiz-generation-types'
import { GenerativeProvider, useGenerative } from './use-generative'

/**
 * Hook that provides quiz generation functionality using the generative context
 */
export function useQuizGenerator() {
    return useGenerative<GenerateQuizOptions, PartialGeneratedQuiz>()
}

/**
 * Provider component for quiz generation
 */
export function QuizGeneratorProvider({ children }: { children: React.ReactNode }) {
    return <GenerativeProvider generativeFunction={generateQuiz}>{children}</GenerativeProvider>
}
