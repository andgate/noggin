import { supabase } from '@noggin/app/common/supabase-client'
import type { Tables } from '@noggin/types/database.types'

type DbModule = Tables<'modules'>
type DbModuleSource = Tables<'module_sources'>

export type DueModuleWithSources = DbModule & {
  module_sources: Pick<DbModuleSource, 'storage_object_path'>[] // Only need the path for generation
}

/**
 * Fetches modules that are due for review for the current user, including their source paths.
 * Modules are considered due if their next_review_at timestamp in module_stats
 * is less than or equal to the current time.
 *
 * @returns A promise that resolves to an array of due DbModule objects with source paths, or an empty array on error.
 */
export const getDueModules = async (): Promise<DueModuleWithSources[]> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData?.user) {
      console.error('Error fetching user for due modules:', userError?.message || 'No user found')
      return []
    }
    const userId = userData.user.id
    const now = new Date().toISOString()

    // Query modules, joining with module_stats (inner) and module_sources (left)
    const { data, error } = await supabase
      .from('modules')
      .select(
        `
        *,
        module_stats!inner(*),
        module_sources ( storage_object_path )
      `
      )
      .eq('module_stats.user_id', userId)
      .lte('module_stats.next_review_at', now)

    if (error) {
      console.error('Error fetching due modules with sources:', error.message)
      if (error.details) console.error('Error details:', error.details)
      if (error.hint) console.error('Error hint:', error.hint)
      return []
    }

    console.log(`Found ${data?.length ?? 0} due modules with sources.`)
    // Type assertion needed as Supabase join typing can be complex
    return (data as DueModuleWithSources[]) || []
  } catch (err) {
    console.error('Unexpected error in getDueModules:', err)
    if (err instanceof Error) {
      console.error('Error message:', err.message)
    }
    return []
  }
}
