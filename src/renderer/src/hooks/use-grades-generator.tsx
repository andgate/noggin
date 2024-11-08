import { generateGradedSubmission, GenerateGradesOptions } from '../services/grading-service'
import { GradedSubmission } from '../types/quiz-generation-types'
import { GenerativeProvider, useGenerative } from './use-generative'

/**
 * Interface for grades generation
 */
export interface GradesGenerator {
    generateGrades: (options: GenerateGradesOptions) => void
    gradedSubmission: GradedSubmission
    isRunning: boolean
    error?: Error
    abort: () => void
}

/**
 * Hook that provides quiz grading functionality using the generative context
 */
export function useGradesGenerator(): GradesGenerator {
    const { invoke, state, isRunning, error, abort } = useGenerative<
        GenerateGradesOptions,
        GradedSubmission
    >()
    return { generateGrades: invoke, gradedSubmission: state, isRunning, error, abort }
}

/**
 * Provider component for grades generation
 */
export function GradesGeneratorProvider({ children }: { children: React.ReactNode }) {
    return (
        <GenerativeProvider generativeFunction={generateGradedSubmission}>
            {children}
        </GenerativeProvider>
    )
}
