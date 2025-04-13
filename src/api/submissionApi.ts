import { supabase } from '@noggin/app/common/supabase-client'
import type { Tables, TablesInsert, TablesUpdate } from '@noggin/types/database.types'
import { Response } from '@noggin/types/response.types'
import { Submission } from '@noggin/types/submission.types'
import { mapDbResponseToResponse } from './responseApi.mappers'
import { mapDbSubmissionToSubmission } from './submissionApi.mappers'

// Define DB Row types locally
type DbResponse = Tables<'responses'>

/**
 * Defines the data required to create a new submission.
 */
type CreateSubmissionInput = Pick<
  TablesInsert<'submissions'>,
  | 'quiz_id'
  | 'module_id'
  | 'time_elapsed_seconds'
  | 'submitted_at'
  | 'status'
  | 'grade_percent'
  | 'letter_grade'
>

/**
 * Defines the data required to create a new response.
 */
type CreateResponseInput = Pick<TablesInsert<'responses'>, 'question_id' | 'student_answer_text'>

/**
 * Defines the data allowed for updating a submission (grading).
 */
type UpdateSubmissionInput = Pick<
  TablesUpdate<'submissions'>,
  'grade_percent' | 'letter_grade' | 'status'
>

/**
 * Defines the data allowed for updating a response (grading).
 */
type UpdateResponseInput = Pick<TablesUpdate<'responses'>, 'feedback' | 'is_correct'>

/**
 * Creates a new submission record.
 * @param submissionData - The data required to create the submission.
 * @returns The created and mapped Submission object (with empty responses array initially) or null if an error occurred.
 */
export const createSubmission = async (
  submissionData: CreateSubmissionInput
): Promise<Submission | null> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('Error getting user:', userError)
    return null
  }

  // Calculate attempt number
  const { count, error: countError } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('quiz_id', submissionData.quiz_id)
    .eq('user_id', user.id)

  if (countError) {
    console.error('Error counting previous submissions:', countError)
    return null
  }
  const attemptNumber = (count ?? 0) + 1

  const { data: newDbSubmission, error } = await supabase
    .from('submissions')
    .insert({ ...submissionData, user_id: user.id, attempt_number: attemptNumber })
    .select()
    .single()

  if (error) {
    console.error('Error creating submission:', error)
    return null
  }
  // Map submission, providing an empty array for responses
  return mapDbSubmissionToSubmission(newDbSubmission, [])
}

/**
 * Creates multiple response records for a given submission.
 * @param submissionId - The ID of the submission these responses belong to.
 * @param responsesData - An array of response data objects.
 * @returns An array of the created and mapped Response objects or null if an error occurred.
 */
export const createResponses = async (
  submissionId: string,
  responsesData: CreateResponseInput[] // Use the defined Pick type
): Promise<Response[] | null> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('Error getting user:', userError)
    return null
  }

  const responsesToInsert = responsesData.map((response) => ({
    ...response, // Contains question_id and student_answer_text
    submission_id: submissionId,
    user_id: user.id,
    // Explicitly set grading fields to null/default for new responses
    graded_at: null,
    feedback: null,
    is_correct: null,
  }))

  const { data: newDbResponses, error } = await supabase
    .from('responses')
    .insert(responsesToInsert)
    .select()

  if (error) {
    console.error('Error creating responses:', error)
    return null
  }
  return newDbResponses.map(mapDbResponseToResponse)
}

/**
 * Fetches a submission and its associated responses by Submission ID.
 * @param submissionId - The ID of the submission to fetch.
 * @returns The fully populated Submission view object or null if not found or an error occurred.
 */
export const getSubmissionDetails = async (submissionId: string): Promise<Submission | null> => {
  try {
    const [submissionResult, responsesResult] = await Promise.all([
      supabase.from('submissions').select('*').eq('id', submissionId).single(),
      supabase.from('responses').select('*').eq('submission_id', submissionId),
    ])

    if (submissionResult.error || !submissionResult.data) {
      if (submissionResult.error && submissionResult.error.code !== 'PGRST116') {
        console.error('Error fetching submission by ID:', submissionResult.error)
      } else if (!submissionResult.data) {
        console.log(`Submission with id ${submissionId} not found or access denied.`)
      }
      return null
    }

    if (responsesResult.error) {
      console.error(
        'Error fetching responses for submission ID:',
        submissionId,
        responsesResult.error
      )
      return null
    }

    // Map the combined data, passing responses
    return mapDbSubmissionToSubmission(submissionResult.data, responsesResult.data || [])
  } catch (error) {
    console.error('Unexpected error in getSubmissionDetails:', error)
    return null
  }
}

/**
 * Fetches all submissions for a specific module made by the current user, including their responses.
 * @param moduleId - The ID of the module.
 * @returns An array of fully populated Submission view objects.
 */
export const getSubmissionsByModule = async (moduleId: string): Promise<Submission[]> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('Error getting user:', userError)
    return []
  }

  // Fetch submissions first
  const { data: dbSubmissions, error: submissionError } = await supabase
    .from('submissions')
    .select('*')
    .eq('module_id', moduleId)
    .eq('user_id', user.id)
    .order('submitted_at', { ascending: false })

  if (submissionError) {
    console.error('Error fetching submissions by module:', submissionError)
    return []
  }
  if (!dbSubmissions || dbSubmissions.length === 0) {
    return []
  }

  // Fetch all responses for these submissions
  const submissionIds = dbSubmissions.map((s) => s.id)
  const { data: dbResponses, error: responseError } = await supabase
    .from('responses')
    .select('*')
    .in('submission_id', submissionIds)

  if (responseError) {
    console.error('Error fetching responses for module submissions:', responseError)
    // Map without responses if response fetch fails
    return dbSubmissions.map((sub) => mapDbSubmissionToSubmission(sub, [])) // Pass empty array
  }

  // Group responses by submission ID
  const responsesBySubmissionId = (dbResponses || []).reduce(
    (acc, response) => {
      ;(acc[response.submission_id] = acc[response.submission_id] || []).push(response)
      return acc
    },
    {} as Record<string, DbResponse[]>
  )

  // Map each submission, providing its corresponding responses
  return dbSubmissions.map((sub) =>
    mapDbSubmissionToSubmission(sub, responsesBySubmissionId[sub.id] || [])
  )
}

/**
 * Fetches all submissions for a specific quiz made by the current user, including their responses.
 * @param quizId - The ID of the quiz.
 * @returns An array of fully populated Submission view objects.
 */
export const getSubmissionsByQuiz = async (quizId: string): Promise<Submission[]> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('Error getting user:', userError)
    return []
  }

  // Fetch submissions first
  const { data: dbSubmissions, error: submissionError } = await supabase
    .from('submissions')
    .select('*')
    .eq('quiz_id', quizId)
    .eq('user_id', user.id)
    .order('attempt_number', { ascending: true })

  if (submissionError) {
    console.error('Error fetching submissions by quiz:', submissionError)
    return []
  }
  if (!dbSubmissions || dbSubmissions.length === 0) {
    return []
  }

  // Fetch all responses for these submissions
  const submissionIds = dbSubmissions.map((s) => s.id)
  const { data: dbResponses, error: responseError } = await supabase
    .from('responses')
    .select('*')
    .in('submission_id', submissionIds)

  if (responseError) {
    console.error('Error fetching responses for quiz submissions:', responseError)
    // Map without responses if response fetch fails
    return dbSubmissions.map((sub) => mapDbSubmissionToSubmission(sub, [])) // Pass empty array
  }

  // Group responses by submission ID
  const responsesBySubmissionId = (dbResponses || []).reduce(
    (acc, response) => {
      ;(acc[response.submission_id] = acc[response.submission_id] || []).push(response)
      return acc
    },
    {} as Record<string, DbResponse[]>
  )

  // Map each submission with its responses
  return dbSubmissions.map((sub) =>
    mapDbSubmissionToSubmission(sub, responsesBySubmissionId[sub.id] || [])
  )
}

/**
 * Updates a submission record. Only allows updating grading-related fields.
 * Fetches and returns the full updated submission including responses.
 * @param submissionId - The ID of the submission to update.
 * @param updates - An object containing the fields to update (grade_percent, letter_grade, status).
 * @returns The updated and mapped Submission object (including responses) or null if an error occurred.
 */
export const updateSubmission = async (
  submissionId: string,
  updates: UpdateSubmissionInput // Use the defined Pick type
): Promise<Submission | null> => {
  const { data: updatedDbSubmission, error: updateError } = await supabase
    .from('submissions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', submissionId)
    .select()
    .single()

  if (updateError) {
    console.error('Error updating submission:', updateError)
    return null
  }

  // After successful update, fetch the full details including responses
  return getSubmissionDetails(submissionId)
}

/**
 * Updates a response record. Only allows updating grading-related fields.
 * @param responseId - The ID of the response to update.
 * @param updates - An object containing the fields to update (feedback, is_correct).
 * @returns The updated and mapped Response object or null if an error occurred.
 */
export const updateResponse = async (
  responseId: string,
  updates: UpdateResponseInput
): Promise<Response | null> => {
  const { data: updatedDbResponse, error } = await supabase
    .from('responses')
    .update({ ...updates, graded_at: new Date().toISOString() })
    .eq('id', responseId)
    .select()
    .single()

  if (error) {
    console.error('Error updating response:', error)
    return null
  }
  return mapDbResponseToResponse(updatedDbResponse)
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
