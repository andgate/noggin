import type { Tables } from '@noggin/types/database.types'
import { Quiz, quizSchema } from '@noggin/types/quiz.types'
import { mapDbQuestionToQuestion } from './questionApi.mappers'
import { mapDbSubmissionToSubmission } from './submissionApi.mappers'

// Define DB Row types locally
type DbQuiz = Tables<'quizzes'>
type DbQuestion = Tables<'questions'>
type DbSubmission = Tables<'submissions'>
// If submissions need their responses nested, we might need DbResponse here too

/**
 * Maps a database quizzes row (and potentially related questions/submissions)
 * to the Quiz view type and validates it.
 * Handles partial data for different fetching contexts.
 *
 * @param dbQuiz - The raw database quizzes object.
 * @param dbQuestions - Optional array of raw database questions objects for this quiz.
 * @param dbSubmissions - Optional array of raw database submissions objects for this quiz.
 *                        (Note: These submissions might need their own responses mapped separately if required by the view).
 * @returns The validated Quiz object.
 * @throws {ZodError} if validation fails.
 */
export function mapDbQuizToQuiz(
  dbQuiz: DbQuiz,
  dbQuestions?: DbQuestion[],
  dbSubmissions?: DbSubmission[] // Assuming submissions don't need nested responses *here*
): Quiz {
  const mappedQuiz = {
    id: dbQuiz.id,
    moduleId: dbQuiz.module_id,
    userId: dbQuiz.user_id,
    title: dbQuiz.title,
    timeLimitSeconds: dbQuiz.time_limit_seconds,
    createdAt: dbQuiz.created_at,
    updatedAt: dbQuiz.updated_at,
    // Map questions if provided
    questions: dbQuestions ? dbQuestions.map(mapDbQuestionToQuestion) : [],
    // Map submissions if provided
    // IMPORTANT: This assumes mapDbSubmissionToSubmission doesn't require nested responses.
    // If it does, the data fetching logic needs to provide them.
    submissions: dbSubmissions
      ? dbSubmissions.map((sub) => mapDbSubmissionToSubmission(sub /*, optional DbResponses[] */))
      : [],
  }

  // Validate the final mapped object against the Zod schema
  return quizSchema.parse(mappedQuiz)
}

// Placeholder for mapDbQuestionToQuestion if it were defined here (it's imported now)
// export function mapDbQuestionToQuestion(...) { ... }

// Placeholder for mapDbSubmissionToSubmission if it were defined here (it's imported now)
// export function mapDbSubmissionToSubmission(...) { ... }
