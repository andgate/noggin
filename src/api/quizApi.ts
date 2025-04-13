import { supabase } from '@noggin/app/common/supabase-client'
import type { Tables, TablesInsert, TablesUpdate } from '@noggin/types/database.types'
import { Question } from '@noggin/types/question.types'
import { Quiz } from '@noggin/types/quiz.types'
import { mapDbQuestionToQuestion } from './questionApi.mappers'
import { mapDbQuizToQuiz } from './quizApi.mappers'

// Define DB Row types locally
type DbQuiz = Tables<'quizzes'>

/**
 * Creates a new quiz associated with a module for the authenticated user.
 * @param moduleId - The ID of the module this quiz belongs to.
 * @param quizData - The data for the new quiz (title, time_limit_seconds).
 * @returns The newly created and mapped Quiz object (basic details only) or null if an error occurs.
 */
export const createQuiz = async (
  moduleId: string,
  quizData: Pick<TablesInsert<'quizzes'>, 'title' | 'time_limit_seconds'>
): Promise<Quiz | null> => {
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()
  if (authError || !session?.user) {
    console.error('Auth error in createQuiz:', authError)
    return null
  }
  const userId = session.user.id

  const { data: newDbQuiz, error } = await supabase
    .from('quizzes')
    .insert({
      ...quizData,
      module_id: moduleId,
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating quiz:', error)
    return null
  }

  // Map the basic quiz info (no questions/submissions yet)
  return mapDbQuizToQuiz(newDbQuiz)
}

/**
 * Creates multiple questions for a specific quiz for the authenticated user.
 * @param quizId - The ID of the quiz these questions belong to.
 * @param questionsData - An array of question data objects.
 * @returns An array of the newly created and mapped Question objects or null if an error occurs.
 */
export const createQuestions = async (
  quizId: string,
  questionsData: Omit<TablesInsert<'questions'>, 'user_id' | 'id' | 'quiz_id' | 'updated_at'>[]
): Promise<Question[] | null> => {
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()
  if (authError || !session?.user) {
    console.error('Auth error in createQuestions:', authError)
    return null
  }
  const userId = session.user.id

  const questionsToInsert = questionsData.map((q) => ({
    ...q,
    quiz_id: quizId,
    user_id: userId,
  }))

  const { data: newDbQuestions, error } = await supabase
    .from('questions')
    .insert(questionsToInsert)
    .select()

  if (error) {
    console.error('Error creating questions:', error)
    return null
  }

  // Map the created questions
  return newDbQuestions.map(mapDbQuestionToQuestion)
}

/**
 * Fetches all quizzes (basic info only) for a specific module belonging to the authenticated user.
 * @param moduleId - The ID of the module.
 * @returns An array of partially populated Quiz view objects or an empty array if none found or error.
 */
export const getQuizzesByModule = async (moduleId: string): Promise<Quiz[]> => {
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()
  if (authError || !session?.user) {
    console.error('Auth error in getQuizzesByModule:', authError)
    return []
  }
  const userId = session.user.id

  // Select only basic quiz fields
  const { data: dbQuizzes, error } = await supabase
    .from('quizzes')
    .select('id, module_id, user_id, title, time_limit_seconds, created_at, updated_at')
    .eq('module_id', moduleId)
    .eq('user_id', userId) // Explicit user_id check (RLS should also handle this)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching quizzes by module:', error)
    return []
  }
  // Map basic quiz info
  return (dbQuizzes || []).map((dbQuiz) => mapDbQuizToQuiz(dbQuiz))
}

/**
 * Fetches detailed information for a specific quiz, including its questions and basic submission info.
 * @param quizId - The ID of the quiz to fetch.
 * @returns The fully populated Quiz view object or null if not found/error.
 */
export const getQuizDetails = async (quizId: string): Promise<Quiz | null> => {
  try {
    // Fetch quiz, questions, and submissions concurrently
    const [quizResult, questionsResult, submissionsResult] = await Promise.all([
      supabase.from('quizzes').select('*').eq('id', quizId).single(),
      supabase.from('questions').select('*').eq('quiz_id', quizId).order('id'), // Order questions consistently
      supabase
        .from('submissions')
        .select(
          'id, quiz_id, module_id, user_id, attempt_number, submitted_at, updated_at, time_elapsed_seconds, grade_percent, letter_grade, status'
        ) // Select needed submission fields
        .eq('quiz_id', quizId)
        .order('attempt_number', { ascending: true }), // Order submissions
    ])

    // --- Error Handling ---
    if (quizResult.error) {
      if (quizResult.error.code !== 'PGRST116')
        console.error('Error fetching quiz:', quizResult.error)
      return null // Quiz not found or other error
    }
    if (questionsResult.error) {
      console.error('Error fetching questions for quiz:', questionsResult.error)
      return null // Treat question fetch error as critical
    }
    if (submissionsResult.error) {
      console.error('Error fetching submissions for quiz:', submissionsResult.error)
      return null // Treat submission fetch error as critical
    }
    // --- ---

    if (!quizResult.data) {
      return null
    }

    // Map the combined data using the quiz mapper
    // The mapper will internally call question and submission mappers
    return mapDbQuizToQuiz(
      quizResult.data,
      questionsResult.data || [],
      submissionsResult.data || [] // Pass submissions data
    )
  } catch (error) {
    console.error('Unexpected error in getQuizDetails:', error)
    return null
  }
}

/**
 * Updates an existing quiz record.
 * @param quizId - The ID of the quiz to update.
 * @param updates - An object containing the fields to update (e.g., title, time_limit_seconds).
 * @returns The updated and mapped Quiz object (basic details only) or null on error.
 */
export const updateQuiz = async (
  quizId: string,
  updates: Partial<Pick<DbQuiz, 'title' | 'time_limit_seconds'>>
): Promise<Quiz | null> => {
  const { data: updatedDbQuiz, error } = await supabase
    .from('quizzes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', quizId)
    .select()
    .single()

  if (error) {
    console.error('Error updating quiz:', error)
    return null
  }

  // Map basic info, questions/submissions won't be present here
  return mapDbQuizToQuiz(updatedDbQuiz)
}

/**
 * Updates an existing question record.
 * @param questionId - The ID of the question to update.
 * @param updates - An object containing the fields to update.
 * @returns The updated and mapped Question object or null on error.
 */
export const updateQuestion = async (
  questionId: string,
  updates: TablesUpdate<'questions'> // Allow updating any valid field
): Promise<Question | null> => {
  // Remove potentially harmful fields if necessary, though RLS is primary defense
  const { user_id, quiz_id, id, ...safeUpdates } = updates

  const { data: updatedDbQuestion, error } = await supabase
    .from('questions')
    .update({ ...safeUpdates, updated_at: new Date().toISOString() })
    .eq('id', questionId)
    .select()
    .single()

  if (error) {
    console.error('Error updating question:', error)
    return null
  }

  return mapDbQuestionToQuestion(updatedDbQuestion)
}

/**
 * Deletes a quiz record by its ID.
 * Assumes RLS policies enforce ownership and the database schema handles cascading deletes.
 * @param quizId - The ID of the quiz to delete.
 * @returns True if deletion was successful, false otherwise.
 */
export const deleteQuiz = async (quizId: string): Promise<boolean> => {
  const { error } = await supabase.from('quizzes').delete().eq('id', quizId)

  if (error) {
    console.error('Error deleting quiz:', error)
    return false
  }
  return true
}

/**
 * Deletes a single question record by its ID.
 * Assumes RLS policies enforce ownership.
 * @param questionId - The ID of the question to delete.
 * @returns True if deletion was successful, false otherwise.
 */
export const deleteQuestion = async (questionId: string): Promise<boolean> => {
  const { error } = await supabase.from('questions').delete().eq('id', questionId)

  if (error) {
    console.error('Error deleting question:', error)
    return false
  }
  return true
}
