import { Quiz, quizSchema } from '@/core/types/quiz.types'
import type { Tables } from '@/shared/types/database.types'
import { mapDbQuestionToQuestion } from './questionApi.mappers'
import { mapDbSubmissionToSubmissionListItem } from './submissionApi.mappers'

// Define DB Row types locally
type DbQuiz = Tables<'quizzes'>
type DbQuestion = Tables<'questions'>
type DbSubmission = Tables<'submissions'>

/**
 * Maps a database quizzes row (and potentially related questions/submissions)
 * to the Quiz view type and validates it.
 * Handles partial data for different fetching contexts.
 *
 * @param dbQuiz - The raw database quizzes object.
 * @param dbQuestions - Optional array of raw database questions objects for this quiz.
 * @param dbSubmissions - Optional array of raw database submissions objects for this quiz.
 *                        (Note: These submissions are mapped to SubmissionListItem, without responses).
 * @returns The validated Quiz object.
 * @throws {ZodError} if validation fails.
 */
export function mapDbQuizToQuiz(
  dbQuiz: DbQuiz,
  dbQuestions?: DbQuestion[],
  dbSubmissions?: DbSubmission[]
): Quiz {
  const mappedQuiz = {
    id: dbQuiz.id,
    moduleId: dbQuiz.module_id,
    userId: dbQuiz.user_id,
    title: dbQuiz.title,
    timeLimitSeconds: dbQuiz.time_limit_seconds,
    createdAt: dbQuiz.created_at,
    updatedAt: dbQuiz.updated_at,
    questions: dbQuestions ? dbQuestions.map(mapDbQuestionToQuestion) : [],
    submissions: dbSubmissions ? dbSubmissions.map(mapDbSubmissionToSubmissionListItem) : [],
  }

  // Validate the final mapped object against the Zod schema
  return quizSchema.parse(mappedQuiz)
}

// Placeholder for mapDbQuestionToQuestion if it were defined here (it's imported now)
// export function mapDbQuestionToQuestion(...) { ... }

// Placeholder for mapDbSubmissionToSubmission if it were defined here (it's imported now)
// export function mapDbSubmissionToSubmission(...) { ... }
