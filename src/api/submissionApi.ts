// src/renderer/src/api/submissionApi.ts
import { supabase } from '@noggin/app/common/supabase-client'
import type { Tables, TablesInsert, TablesUpdate } from '@noggin/types/database.types'

export type DbSubmission = Tables<'submissions'>
export type DbResponse = Tables<'responses'>
// Define the new type for submission with quiz title
export type DbSubmissionWithQuizTitle = DbSubmission & {
  quizzes: { title: string } | null // Joined quiz data
}

/**
 * Creates a new submission record.
 * @param submissionData - The data for the new submission, excluding user_id and id.
 * @returns The created submission object or null if an error occurred.
 */
export const createSubmission = async (
  submissionData: Omit<TablesInsert<'submissions'>, 'user_id' | 'id'>
): Promise<DbSubmission | null> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('Error getting user:', userError)
    return null
  }

  const { data, error } = await supabase
    .from('submissions')
    .insert({ ...submissionData, user_id: user.id })
    .select()
    .single()

  if (error) {
    console.error('Error creating submission:', error)
    return null
  }
  return data
}

/**
 * Creates multiple response records for a given submission.
 * @param submissionId - The ID of the submission these responses belong to.
 * @param responsesData - An array of response data, excluding user_id, id, and submission_id.
 * @returns An array of the created response objects or null if an error occurred.
 */
export const createResponses = async (
  submissionId: string,
  responsesData: Omit<TablesInsert<'responses'>, 'user_id' | 'id' | 'submission_id'>[]
): Promise<DbResponse[] | null> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('Error getting user:', userError)
    return null
  }

  const responsesToInsert = responsesData.map((response) => ({
    ...response,
    submission_id: submissionId,
    user_id: user.id,
  }))

  const { data, error } = await supabase.from('responses').insert(responsesToInsert).select()

  if (error) {
    console.error('Error creating responses:', error)
    return null
  }
  return data
}

/**
 * Fetches a submission and its associated responses by Submission ID.
 * Assumes RLS handles ownership check.
 * @param submissionId - The ID of the submission to fetch.
 * @returns An object containing the submission and its responses, or null if not found or an error occurred.
 */
export const getSubmissionWithResponses = async (
  submissionId: string
): Promise<{ submission: DbSubmission; responses: DbResponse[] } | null> => {
  try {
    // Fetch submission and responses concurrently
    const [submissionResult, responsesResult] = await Promise.all([
      supabase.from('submissions').select('*').eq('id', submissionId).single(),
      supabase.from('responses').select('*').eq('submission_id', submissionId),
    ])

    // Handle submission fetch error or not found
    if (submissionResult.error || !submissionResult.data) {
      console.error('Error fetching submission by ID:', submissionResult.error)
      if (submissionResult.error?.code === 'PGRST116') {
        // Specific error for not found/RLS denial
        console.log(`Submission with id ${submissionId} not found or access denied.`)
      }
      return null
    }

    // Handle responses fetch error
    if (responsesResult.error) {
      console.error(
        'Error fetching responses for submission ID:',
        submissionId,
        responsesResult.error
      )
      // Decide if you want to return partial data or null. Returning null for consistency.
      return null
    }

    // Return the combined data
    return {
      submission: submissionResult.data,
      responses: responsesResult.data || [], // Ensure responses is always an array
    }
  } catch (error) {
    console.error('Unexpected error in getSubmissionWithResponses:', error)
    return null
  }
}

/**
 * Fetches a specific submission attempt for a quiz by the current user, including responses.
 * @param quizId - The ID of the quiz.
 * @param attempt - The attempt number.
 * @returns An object containing the submission and its responses, or null if not found or an error occurred.
 */
export const getSubmissionDetailsByAttempt = async (
  quizId: string,
  attempt: number
): Promise<{ submission: DbSubmission; responses: DbResponse[] } | null> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('Error getting user:', userError)
    return null
  }

  try {
    // 1. Find the submission based on quizId, attempt number, and user_id
    const { data: submissionLookup, error: lookupError } = await supabase
      .from('submissions')
      .select('id') // Only need the ID initially
      .eq('quiz_id', quizId)
      .eq('attempt_number', attempt)
      .eq('user_id', user.id)
      .single() // Expecting only one submission for a specific attempt

    if (lookupError || !submissionLookup) {
      console.error(`Error finding submission for quiz ${quizId}, attempt ${attempt}:`, lookupError)
      if (lookupError?.code === 'PGRST116') {
        // Not found
        console.log(`Submission attempt ${attempt} for quiz ${quizId} not found.`)
      }
      return null
    }

    const submissionId = submissionLookup.id

    // 2. Fetch the full submission details and responses using the found ID
    // Re-use the existing getSubmissionWithResponses logic
    return await getSubmissionWithResponses(submissionId)
  } catch (error) {
    console.error('Unexpected error in getSubmissionDetailsByAttempt:', error)
    return null
  }
}

/**
 * Fetches all submissions for a specific module made by the current user,
 * including the title of the associated quiz.
 * @param moduleId - The ID of the module.
 * @returns An array of submission objects with quiz titles.
 */
export const getSubmissionsByModule = async (
  moduleId: string
): Promise<DbSubmissionWithQuizTitle[]> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('Error getting user:', userError)
    return []
  }

  // Join submissions with quizzes to get the quiz title
  const { data, error } = await supabase
    .from('submissions')
    .select(
      `
            *,
            quizzes ( title )
        `
    )
    .eq('module_id', moduleId)
    .eq('user_id', user.id) // Explicit user_id check
    .order('submitted_at', { ascending: false }) // Optional: Order by submission date

  if (error) {
    console.error('Error fetching submissions by module with quiz title:', error)
    return []
  }

  // The data structure will be slightly different due to the join
  // We need to ensure it matches DbSubmissionWithQuizTitle
  // Supabase automatically nests the joined data if the foreign key relationship is set up
  return (data as DbSubmissionWithQuizTitle[]) || []
}

/**
 * Fetches all submissions for a specific quiz made by the current user.
 * @param quizId - The ID of the quiz.
 * @returns An array of submission objects.
 */
export const getSubmissionsByQuiz = async (quizId: string): Promise<DbSubmission[]> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('Error getting user:', userError)
    return []
  }

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('quiz_id', quizId)
    .eq('user_id', user.id) // Explicit user_id check

  if (error) {
    console.error('Error fetching submissions by quiz:', error)
    return []
  }
  return data || []
}

/**
 * Updates a submission record.
 * Assumes RLS handles ownership. Prevents updating user_id, module_id, quiz_id.
 * @param submissionId - The ID of the submission to update.
 * @param updates - An object containing the fields to update.
 * @returns The updated submission object or null if an error occurred.
 */
export const updateSubmission = async (
  submissionId: string,
  updates: TablesUpdate<'submissions'>
): Promise<DbSubmission | null> => {
  // Prevent updating restricted fields
  const { user_id, module_id, quiz_id, ...validUpdates } = updates

  if (Object.keys(validUpdates).length === 0) {
    console.warn('No valid fields provided for submission update.')
    // Fetch and return the current submission if no update is needed
    const { data: currentData, error: currentError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single()
    if (currentError) {
      console.error('Error fetching current submission during no-op update:', currentError)
      return null
    }
    return currentData
  }

  const { data, error } = await supabase
    .from('submissions')
    .update(validUpdates)
    .eq('id', submissionId)
    .select()
    .single()

  if (error) {
    console.error('Error updating submission:', error)
    return null
  }
  return data
}

/**
 * Updates a response record.
 * Assumes RLS handles ownership. Prevents updating user_id, submission_id, question_id.
 * @param responseId - The ID of the response to update.
 * @param updates - An object containing the fields to update.
 * @returns The updated response object or null if an error occurred.
 */
export const updateResponse = async (
  responseId: string,
  updates: TablesUpdate<'responses'>
): Promise<DbResponse | null> => {
  // Prevent updating restricted fields
  const { user_id, submission_id, question_id, ...validUpdates } = updates

  if (Object.keys(validUpdates).length === 0) {
    console.warn('No valid fields provided for response update.')
    // Fetch and return the current response if no update is needed
    const { data: currentData, error: currentError } = await supabase
      .from('responses')
      .select('*')
      .eq('id', responseId)
      .single()
    if (currentError) {
      console.error('Error fetching current response during no-op update:', currentError)
      return null
    }
    return currentData
  }

  const { data, error } = await supabase
    .from('responses')
    .update(validUpdates)
    .eq('id', responseId)
    .select()
    .single()

  if (error) {
    console.error('Error updating response:', error)
    return null
  }
  return data
}

/**
 * Deletes a submission record.
 * Assumes RLS handles ownership and cascade delete handles related responses.
 * @param submissionId - The ID of the submission to delete.
 * @returns True if deletion was successful, false otherwise.
 */
export const deleteSubmission = async (submissionId: string): Promise<boolean> => {
  const { error } = await supabase.from('submissions').delete().eq('id', submissionId)

  if (error) {
    console.error('Error deleting submission:', error)
    return false
  }
  return true
}

/**
 * Deletes a response record.
 * Assumes RLS handles ownership.
 * @param responseId - The ID of the response to delete.
 * @returns True if deletion was successful, false otherwise.
 */
export const deleteResponse = async (responseId: string): Promise<boolean> => {
  const { error } = await supabase.from('responses').delete().eq('id', responseId)

  if (error) {
    console.error('Error deleting response:', error)
    return false
  }
  return true
}
