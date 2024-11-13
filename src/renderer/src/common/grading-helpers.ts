import { Grade, gradeSchema, LetterGrade } from '@noggin/types/grading-types'
import { GradedResponse } from '@noggin/types/quiz-generation-types'

/**
 * Calculate the grade from an array of graded responses.
 * @param gradedResponses - An array of graded responses
 * @returns The grade as a number between 0 and 100
 */
export const gradeResponses = (gradedResponses: GradedResponse[]): Grade => {
    const totalCorrect = gradedResponses.reduce(
        (acc, curr) => acc + (curr.verdict === 'pass' ? 1 : 0),
        0
    )
    return gradeSchema.parse((totalCorrect / gradedResponses.length) * 100)
}

/**
 * Convert a numeric grade to a letter grade.
 * @param grade - The grade as a number between 0 and 100
 * @returns The letter grade (A, B, C, D, F)
 */
export const asLetterGrade = (grade: Grade): LetterGrade => {
    if (grade >= 90) return 'A'
    if (grade >= 80) return 'B'
    if (grade >= 70) return 'C'
    if (grade >= 60) return 'D'
    return 'F'
}
