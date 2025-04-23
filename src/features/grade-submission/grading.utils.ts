import type { Submission } from '@/core/types/submission.types'
import { getCurrentISOString } from '@/shared/utils/date-utils'
import type { GeneratedGradedResponse, GeneratedGrades } from './types/generated-grades.types'

/**
 * Grades a submission based on the provided graded submission data.
 *
 * @param submission - The original submission object.
 * @param gradedSubmission - The object containing grading results.
 * @returns A new submission object with graded status, grade, letter grade, and updated responses.
 */
export function applyGradesToSubmission(
  submission: Submission,
  grades: GeneratedGrades
): Submission {
  const gradePercent = calculateGradePercent(grades)
  const letterGrade = calculateLetterGrade(gradePercent)
  const gradedAt = getCurrentISOString()

  return {
    ...submission,
    status: 'graded' as const,
    gradePercent,
    letterGrade,
    responses: grades.responses.map((response: GeneratedGradedResponse, index: number) => ({
      ...submission.responses[index],
      status: 'graded',
      correctAnswer: response.correctAnswer,
      isCorrect: response.isCorrect,
      verdict: response.verdict ? 'pass' : 'fail',
      feedback: response.feedback,
      gradedAt,
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

// Assuming GradedSubmission has a responses array with isCorrect property
function calculateGradePercent(grades: GeneratedGrades): number {
  const correctCount = grades.responses.filter((r) => r.isCorrect).length
  const totalCount = grades.responses.length
  return totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
}

/**
 * Checks if all questions in a submission have been answered.
 * @param submission The submission to check.
 * @returns True if all questions have answers, false otherwise.
 */
export function isSubmissionComplete(submission: Submission): boolean {
  return submission.responses.every(
    (response: Submission['responses'][number]) =>
      response.studentAnswerText !== null && response.studentAnswerText.trim() !== ''
  )
}
