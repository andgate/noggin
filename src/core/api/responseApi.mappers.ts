import { Response, responseSchema } from '@/core/types/response.types'
import type { Tables } from '@/shared/types/database.types'

// Define DB Row type locally
type DbResponse = Tables<'responses'>

/**
 * Maps a database responses row to the Response view type and validates it.
 * Determines the status ('pending' or 'graded') based on graded_at.
 * @param dbResponse - The raw database responses object.
 * @returns The validated Response object.
 * @throws {ZodError} if validation fails.
 */
export function mapDbResponseToResponse(dbResponse: DbResponse): Response {
  const status = dbResponse.graded_at ? 'graded' : 'pending'

  const mappedResponse = {
    id: dbResponse.id,
    submissionId: dbResponse.submission_id,
    questionId: dbResponse.question_id,
    userId: dbResponse.user_id,
    studentAnswerText: dbResponse.student_answer_text,
    status: status,
    feedback: dbResponse.feedback,
    isCorrect: dbResponse.is_correct,
    gradedAt: dbResponse.graded_at,
  }

  // Validate the mapped object against the Zod schema
  // Zod's discriminated union will ensure fields match the status
  return responseSchema.parse(mappedResponse)
}
