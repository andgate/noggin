// src/renderer/src/api/practiceFeedApi.ts
import { supabase } from '@noggin/app/common/supabase-client'
// Import the generic Tables type
import type { Tables } from '@noggin/types/database.types'

// Define DbModule using the Tables type for the 'modules' table
type DbModule = Tables<'modules'>

/**
 * Fetches modules that are due for review for the current user.
 * Modules are considered due if their next_review_at timestamp in module_stats
 * is less than or equal to the current time.
 *
 * @returns A promise that resolves to an array of due DbModule objects, or an empty array on error.
 */
export const getDueModules = async (): Promise<DbModule[]> => {
  console.log('Fetching due modules...')
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData?.user) {
      console.error('Error fetching user for due modules:', userError?.message || 'No user found')
      return []
    }
    const userId = userData.user.id
    const now = new Date().toISOString()

    console.log(`Fetching modules for user ${userId} due before ${now}`)

    // Query modules, joining with module_stats where the user matches
    // and the next review time is in the past or now.
    // The !inner ensures only modules with matching stats are returned.
    const { data, error } = await supabase
      .from('modules')
      .select(
        `
        *,
        module_stats!inner(*)
      `
      )
      .eq('module_stats.user_id', userId)
      .lte('module_stats.next_review_at', now)

    if (error) {
      console.error('Error fetching due modules:', error.message)
      // Log specific Supabase error details if available
      if (error.details) console.error('Error details:', error.details)
      if (error.hint) console.error('Error hint:', error.hint)
      return []
    }

    console.log(`Found ${data?.length ?? 0} due modules.`)
    // Supabase typings might make `data` potentially null, ensure we return array
    // The select with !inner(*) should return objects matching the DbModule structure
    // directly when the join condition is met.
    // The type assertion is still needed because Supabase select might return a broader type.
    return (data as DbModule[]) || []
  } catch (err) {
    console.error('Unexpected error in getDueModules:', err)
    if (err instanceof Error) {
      console.error('Error message:', err.message)
    }
    return []
  }
}
