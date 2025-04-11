import { supabase } from '@noggin/app/common/supabase-client'
import type { Database } from '@noggin/types/database.types'

// Define a convenience type for Library rows
export type DbLibrary = Database['public']['Tables']['libraries']['Row']

/**
 * Creates a new library for the authenticated user.
 * @param name - The name of the library.
 * @param description - The description of the library.
 * @returns The created library object.
 * @throws Error if the user is not authenticated or if there's a database error.
 */
export const createLibrary = async (name: string, description: string): Promise<DbLibrary> => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Error getting user:', authError)
    throw new Error('User not authenticated')
  }
  const userId = user.id

  const { data, error } = await supabase
    .from('libraries')
    .insert({ name, description, user_id: userId })
    .select()
    .single()

  if (error) {
    console.error('Error creating library:', error)
    throw error
  }

  if (!data) {
    throw new Error('Failed to create library, no data returned.')
  }

  return data
}

/**
 * Fetches all libraries belonging to the authenticated user.
 * @returns An array of library objects. Returns an empty array on error.
 */
export const getAllLibraries = async (): Promise<DbLibrary[]> => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Error getting user:', authError)
    // Decide if throwing or returning empty is better. Returning empty might be safer for UI.
    return []
  }
  const userId = user.id

  // RLS handles the primary filtering, but explicit .eq('user_id', userId) can be clearer
  // and potentially useful if RLS were ever misconfigured.
  const { data, error } = await supabase.from('libraries').select('*').eq('user_id', userId) // Explicitly filter by user_id

  if (error) {
    console.error('Error fetching libraries:', error)
    return [] // Return empty array on error to prevent UI crashes
  }

  return data || []
}

/**
 * Fetches a single library by its ID.
 * Assumes RLS policies enforce ownership.
 * @param libraryId - The ID of the library to fetch.
 * @returns The library object or null if not found or on error.
 */
export const getLibrary = async (libraryId: string): Promise<DbLibrary | null> => {
  const { data, error } = await supabase.from('libraries').select('*').eq('id', libraryId).single()

  if (error) {
    // Log error but return null, as not finding the library might be expected
    console.error('Error fetching library:', error.message)
    return null
  }

  return data
}

/**
 * Updates an existing library.
 * Assumes RLS policies enforce ownership.
 * @param libraryId - The ID of the library to update.
 * @param updates - An object containing the fields to update (name, description).
 * @returns The updated library object or null on error.
 */
export const updateLibrary = async (
  libraryId: string,
  updates: Partial<Pick<DbLibrary, 'name' | 'description'>>
): Promise<DbLibrary | null> => {
  const { data, error } = await supabase
    .from('libraries')
    .update(updates)
    .eq('id', libraryId)
    .select()
    .single()

  if (error) {
    console.error('Error updating library:', error)
    return null
  }

  return data
}

/**
 * Deletes a library by its ID.
 * Assumes RLS policies enforce ownership.
 * @param libraryId - The ID of the library to delete.
 * @returns True if deletion was successful, false otherwise.
 */
export const deleteLibrary = async (libraryId: string): Promise<boolean> => {
  const { error } = await supabase.from('libraries').delete().eq('id', libraryId)

  if (error) {
    console.error('Error deleting library:', error)
    return false
  }

  return true
}
