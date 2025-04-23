import { Question, questionSchema } from '@/core/types/question.types'
import type { Tables } from '@/shared/types/database.types'

// Define DB Row type locally
type DbQuestion = Tables<'questions'>

/**
 * Safely parses the 'choices' JSON from a DbQuestion.
 * Assumes choices are stored as a JSON string array.
 * @param dbQuestion - The raw database question object.
 * @returns An array of strings if parsing is successful and valid, otherwise an empty array.
 */
function parseDbChoices(dbQuestion: DbQuestion): string[] {
  if (!dbQuestion.choices) {
    return [] // No choices provided
  }
  try {
    const parsed = JSON.parse(dbQuestion.choices as string) // Cast needed as Json type includes non-strings
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      return parsed
    } else {
      console.warn(
        `Invalid choices format for question ${dbQuestion.id}: Expected string array, got:`,
        dbQuestion.choices
      )
      return [] // Invalid format
    }
  } catch (error) {
    console.error(`Failed to parse choices JSON for question ${dbQuestion.id}:`, error)
    return [] // Parsing error
  }
}

/**
 * Maps a database questions row to the Question view type and validates it.
 * Handles parsing of JSON choices for multiple-choice questions.
 * @param dbQuestion - The raw database questions object.
 * @returns The validated Question object.
 * @throws {ZodError} if validation fails.
 */
export function mapDbQuestionToQuestion(dbQuestion: DbQuestion): Question {
  const choices = dbQuestion.question_type === 'multiple_choice' ? parseDbChoices(dbQuestion) : null // Choices are irrelevant for written questions in the view model

  const mappedQuestion = {
    id: dbQuestion.id,
    quizId: dbQuestion.quiz_id,
    userId: dbQuestion.user_id,
    questionText: dbQuestion.question_text,
    questionType: dbQuestion.question_type, // Let Zod validate the type
    choices: choices, // Assign parsed or null choices
    updatedAt: dbQuestion.updated_at,
  }

  // Validate the final mapped object against the Zod schema
  try {
    // Zod will ensure 'choices' is an array for 'multiple_choice' and null/absent otherwise
    return questionSchema.parse(mappedQuestion)
  } catch (error) {
    console.error('Zod validation failed for mapped question:', mappedQuestion, error)
    throw error // Re-throw the ZodError
  }
}
