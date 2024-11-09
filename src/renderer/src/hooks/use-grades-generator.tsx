import { generateGradedSubmission, GenerateGradesOptions } from '../services/grading-service'
import { GradedSubmission } from '../types/quiz-generation-types'
import { GenerativeProvider, useGenerative } from './use-generative'

/**
 * Interface for grades generation
 */
export interface GradesGenerator {
    generateGrades: (options: GenerateGradesOptions) => void
    gradedSubmission: GradedSubmission
    isGradeGeneratorRunning: boolean
    isDoneGrading: boolean
    error?: Error
    abort: () => void
}

/**
 * Hook that provides quiz grading functionality using the generative context
 */
export function useGradesGenerator(): GradesGenerator {
    const { invoke, state, isDone, isRunning, error, abort } = useGenerative<
        GenerateGradesOptions,
        GradedSubmission
    >()
    return {
        generateGrades: invoke,
        gradedSubmission: state,
        isGradeGeneratorRunning: isRunning,
        isDoneGrading: isDone,
        error,
        abort,
    }
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
