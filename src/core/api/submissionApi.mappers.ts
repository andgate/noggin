import {
  Submission,
  SubmissionListItem,
  submissionListItemSchema,
  submissionSchema,
} from '@/core/types/submission.types'
import type { Tables } from '@/shared/types/database.types'
import { mapDbResponseToResponse } from './responseApi.mappers'

// Define DB Row types locally
type DbSubmission = Tables<'submissions'>
type DbResponse = Tables<'responses'>

/**
 * Maps a database submissions row and its associated responses to the Submission view type and validates it.
 *
 * @param dbSubmission - The raw database submissions object.
 * @param dbResponses - An array of raw database responses objects for this submission.
 * @returns The validated Submission object.
 * @throws {ZodError} if validation fails.
 */
export function mapDbSubmissionToSubmission(
  dbSubmission: DbSubmission,
  dbResponses: DbResponse[]
): Submission {
  const mappedSubmission = {
    id: dbSubmission.id,
    quizId: dbSubmission.quiz_id,
    moduleId: dbSubmission.module_id,
    userId: dbSubmission.user_id,
    attemptNumber: dbSubmission.attempt_number,
    submittedAt: dbSubmission.submitted_at,
    updatedAt: dbSubmission.updated_at,
    timeElapsedSeconds: dbSubmission.time_elapsed_seconds,
    gradePercent: dbSubmission.grade_percent,
    letterGrade: dbSubmission.letter_grade,
    status: dbSubmission.status as 'pending' | 'graded',
    responses: dbResponses.map(mapDbResponseToResponse),
  }

  // Validate the final mapped object against the Zod schema
  return submissionSchema.parse(mappedSubmission)
}

/**
 * Maps a database submissions row (without responses) to the SubmissionListItem view type and validates it.
 *
 * @param dbSubmission - The raw database submissions object.
 * @returns The validated SubmissionListItem object.
 * @throws {ZodError} if validation fails.
 */
export function mapDbSubmissionToSubmissionListItem(
  dbSubmission: DbSubmission
): SubmissionListItem {
  const mappedItem = {
    id: dbSubmission.id,
    quizId: dbSubmission.quiz_id,
    moduleId: dbSubmission.module_id,
    userId: dbSubmission.user_id,
    attemptNumber: dbSubmission.attempt_number,
    submittedAt: dbSubmission.submitted_at,
    updatedAt: dbSubmission.updated_at,
    timeElapsedSeconds: dbSubmission.time_elapsed_seconds,
    gradePercent: dbSubmission.grade_percent,
    letterGrade: dbSubmission.letter_grade,
    status: dbSubmission.status as 'pending' | 'graded',
    // No responses field here
  }

  // Validate against the list item schema
  return submissionListItemSchema.parse(mappedItem)
}
