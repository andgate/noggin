import { generateGrades, GenerateGradesOptions } from '../services/grading-service'
import { GradedSubmission } from '../types/quiz-generation-types'
import { GenerativeProvider, useGenerative } from './use-generative'

/**
 * Hook that provides quiz grading functionality using the generative context
 */
export function useGradesGenerator() {
    return useGenerative<GenerateGradesOptions, Partial<GradedSubmission>>()
}

/**
 * Provider component for grades generation
 */
export function GradesGeneratorProvider({ children }: { children: React.ReactNode }) {
    return <GenerativeProvider generativeFunction={generateGrades}>{children}</GenerativeProvider>
}
