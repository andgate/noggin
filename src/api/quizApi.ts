import { supabase } from '@noggin/app/common/supabase-client'
import type { Tables, TablesInsert, TablesUpdate } from '@noggin/types/database.types'

// Helper types
export type DbQuiz = Tables<'quizzes'>
export type DbQuestion = Tables<'questions'>

/**
 * Creates a new quiz associated with a module for the authenticated user.
 * @param moduleId - The ID of the module this quiz belongs to.
 * @param quizData - The data for the new quiz (title, time_limit_seconds).
 * @returns The newly created quiz object or null if an error occurs.
 */
export const createQuiz = async (
  moduleId: string,
  quizData: Omit<TablesInsert<'quizzes'>, 'user_id' | 'id' | 'created_at' | 'module_id'>
): Promise<DbQuiz | null> => {
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()
  if (authError || !session?.user) {
    console.error('Auth error in createQuiz:', authError)
    return null
  }
  const userId = session.user.id

  const { data: newQuiz, error } = await supabase
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

  return newQuiz
}

/**
 * Creates multiple questions for a specific quiz for the authenticated user.
 * @param quizId - The ID of the quiz these questions belong to.
 * @param questionsData - An array of question data objects.
 * @returns An array of the newly created question objects or null if an error occurs.
 */
export const createQuestions = async (
  quizId: string,
  questionsData: Omit<TablesInsert<'questions'>, 'user_id' | 'id' | 'quiz_id'>[]
): Promise<DbQuestion[] | null> => {
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

  const { data: newQuestions, error } = await supabase
    .from('questions')
    .insert(questionsToInsert)
    .select()

  if (error) {
    console.error('Error creating questions:', error)
    return null
  }

  return newQuestions
}

/**
 * Fetches all quizzes for a specific module belonging to the authenticated user.
 * @param moduleId - The ID of the module.
 * @returns An array of quiz objects or an empty array if none found or error.
 */
export const getQuizzesByModule = async (moduleId: string): Promise<DbQuiz[]> => {
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()
  if (authError || !session?.user) {
    console.error('Auth error in getQuizzesByModule:', authError)
    return []
  }
  const userId = session.user.id

  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('module_id', moduleId)
    .eq('user_id', userId) // Explicit user_id check

  if (error) {
    console.error('Error fetching quizzes by module:', error)
    return []
  }
  return data || []
}

/**
 * Fetches a single quiz by its ID along with all its associated questions.
 * Assumes RLS handles ownership based on quizId.
 * @param quizId - The ID of the quiz to fetch.
 * @returns An object containing the quiz and its questions, or null if not found or error.
 */
export const getQuizWithQuestions = async (
  quizId: string
): Promise<{ quiz: DbQuiz; questions: DbQuestion[] } | null> => {
  try {
    const [quizResult, questionsResult] = await Promise.all([
      supabase.from('quizzes').select('*').eq('id', quizId).single(),
      supabase.from('questions').select('*').eq('quiz_id', quizId).order('sequence_order'),
    ])

    // Check for errors in each query
    if (quizResult.error) {
      if (quizResult.error.code !== 'PGRST116') {
        // Log error only if it's not 'resource not found'
        console.error('Error fetching quiz:', quizResult.error)
      }
      return null // Quiz not found or other error
    }
    if (questionsResult.error) {
      console.error('Error fetching questions for quiz:', questionsResult.error)
      return null // Error fetching questions, even if quiz exists
    }

    // Ensure quiz was found (questions can be an empty array)
    if (!quizResult.data) {
      return null
    }

    return {
      quiz: quizResult.data,
      questions: questionsResult.data || [],
    }
  } catch (error) {
    console.error('Error fetching quiz with questions:', error)
    return null
  }
}

/**
 * Updates an existing quiz record.
 * Assumes RLS policies enforce ownership.
 * @param quizId - The ID of the quiz to update.
 * @param updates - An object containing the fields to update.
 * @returns The updated quiz object or null on error.
 */
export const updateQuiz = async (
  quizId: string,
  updates: TablesUpdate<'quizzes'>
): Promise<DbQuiz | null> => {
  // Remove potentially harmful fields from updates if necessary, though RLS is primary defense
  const { user_id, module_id, created_at, id, ...safeUpdates } = updates

  const { data, error } = await supabase
    .from('quizzes')
    .update(safeUpdates)
    .eq('id', quizId)
    .select()
    .single()

  if (error) {
    console.error('Error updating quiz:', error)
    return null
  }

  return data
}

/**
 * Updates an existing question record.
 * Assumes RLS policies enforce ownership.
 * @param questionId - The ID of the question to update.
 * @param updates - An object containing the fields to update.
 * @returns The updated question object or null on error.
 */
export const updateQuestion = async (
  questionId: string,
  updates: TablesUpdate<'questions'>
): Promise<DbQuestion | null> => {
  // Remove potentially harmful fields from updates
  const { user_id, quiz_id, id, ...safeUpdates } = updates

  const { data, error } = await supabase
    .from('questions')
    .update(safeUpdates)
    .eq('id', questionId)
    .select()
    .single()

  if (error) {
    console.error('Error updating question:', error)
    return null
  }

  return data
}

/**
 * Deletes a quiz record by its ID.
 * Assumes RLS policies enforce ownership and the database schema handles cascading deletes for related questions.
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
