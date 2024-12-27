import { GradedSubmission } from '@noggin/types/quiz-generation-types'
import { Submission } from '@noggin/types/quiz-types'

export function updateSubmissionWithGrades(
    submission: Submission,
    gradedSubmission: GradedSubmission
): Submission {
    const passedResponses = gradedSubmission.responses.filter((r) => r.isCorrect)
    const grade = Math.round((passedResponses.length / gradedSubmission.responses.length) * 100)
    const letterGrade = calculateLetterGrade(grade)

    return {
        ...submission,
        status: 'graded' as const,
        grade,
        letterGrade,
        responses: gradedSubmission.responses.map((response, index) => ({
            ...submission.responses[index],
            status: 'graded' as const,
            correctAnswer: response.correctAnswer,
            verdict: response.isCorrect ? 'pass' : 'fail',
            feedback: response.feedback,
        })),
    }
}

function calculateLetterGrade(grade: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (grade >= 90) return 'A'
    if (grade >= 80) return 'B'
    if (grade >= 70) return 'C'
    if (grade >= 60) return 'D'
    return 'F'
}
