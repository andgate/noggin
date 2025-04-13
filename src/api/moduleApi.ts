import { supabase } from '@noggin/app/common/supabase-client'
import type { Tables, TablesInsert } from '@noggin/types/database.types'
import { ModuleListItem } from '@noggin/types/module-list-item.types'
import { ModuleSource } from '@noggin/types/module-source.types'
import { ModuleStats } from '@noggin/types/module-stats.types'
import { Module } from '@noggin/types/module.types'
import {
  mapDbDataToModuleListItem,
  mapDbModuleSourceToModuleSource,
  mapDbModuleStatsToModuleStats,
  mapDbModuleToModule,
} from './moduleApi.mappers'

// Define DB Row types locally
type DbModule = Tables<'modules'>
type DbModuleStats = Tables<'module_stats'>

/**
 * Fetches a list of modules for the current user with minimal details required for list views.
 * @returns An array of ModuleListItem view objects.
 */
export const getModuleList = async (): Promise<ModuleListItem[]> => {
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()
  if (authError || !session?.user) {
    console.error('Auth error in getModuleList:', authError)
    return []
  }
  const userId = session.user.id

  // Select only the necessary fields for the list item
  const { data: dbModuleListData, error } = await supabase
    .from('modules')
    .select(
      `
      id,
      user_id,
      title,
      module_stats (
        current_box,
        next_review_at
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching module list:', error)
    return []
  }

  // Define the expected shape explicitly for type safety before mapping
  type DbModuleListItemData = Pick<DbModule, 'id' | 'user_id' | 'title'> & {
    module_stats: Pick<DbModuleStats, 'current_box' | 'next_review_at'> | null
  }

  // Map the specifically fetched data using the dedicated list item mapper
  return (dbModuleListData || []).map((dbData) =>
    mapDbDataToModuleListItem(dbData as DbModuleListItemData)
  )
}

/**
 * Fetches detailed information for a specific module, including stats, sources, and basic quiz info.
 * Renamed from getModuleDetails.
 * @param moduleId - The ID of the module.
 * @returns The fully populated Module view object or null if not found/error.
 */
export const getModule = async (moduleId: string): Promise<Module | null> => {
  // Renamed function
  try {
    // Fetch module, stats, sources, and quizzes concurrently
    const [moduleResult, statsResult, sourcesResult, quizzesResult] = await Promise.all([
      supabase.from('modules').select('*').eq('id', moduleId).single(),
      supabase.from('module_stats').select('*').eq('module_id', moduleId).single(),
      supabase.from('module_sources').select('*').eq('module_id', moduleId),
      supabase
        .from('quizzes')
        .select('id, module_id, user_id, title, time_limit_seconds, created_at, updated_at') // Select only needed quiz fields
        .eq('module_id', moduleId),
    ])

    // --- Error Handling ---
    if (moduleResult.error) {
      if (moduleResult.error.code !== 'PGRST116')
        console.error('Error fetching module:', moduleResult.error)
      return null // Module not found or other error
    }
    if (statsResult.error) {
      if (statsResult.error.code !== 'PGRST116')
        console.error('Error fetching module stats:', statsResult.error)
      // Continue, stats are optional in the mapper
    }
    if (sourcesResult.error) {
      console.error('Error fetching module sources:', sourcesResult.error)
      return null
    }
    if (quizzesResult.error) {
      console.error('Error fetching module quizzes:', quizzesResult.error)
      return null
    }
    // --- ---

    if (!moduleResult.data) {
      return null
    }

    // Map the combined data using the main mapper
    return mapDbModuleToModule(
      moduleResult.data,
      statsResult.data ?? undefined,
      sourcesResult.data || [],
      quizzesResult.data || []
    )
  } catch (error) {
    console.error('Unexpected error in getModule:', error)
    return null
  }
}

/**
 * Creates a new module and its initial stats entry for the current user.
 * @param title - The title of the module.
 * @param overview - An overview/description of the module.
 * @returns The newly created and mapped Module object or null if an error occurs.
 */
export const createModule = async (title: string, overview: string): Promise<Module | null> => {
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()
  if (authError || !session?.user) {
    console.error('Auth error:', authError)
    return null
  }
  const userId = session.user.id

  const { data: newDbModule, error: moduleError } = await supabase
    .from('modules')
    .insert({ user_id: userId, title, overview })
    .select()
    .single()

  if (moduleError || !newDbModule) {
    console.error('Error creating module:', moduleError)
    return null
  }

  const { data: newDbStats, error: statsError } = await supabase
    .from('module_stats')
    .insert({
      module_id: newDbModule.id,
      user_id: userId,
      current_box: 1,
      next_review_at: new Date().toISOString(),
      quiz_attempts: 0,
      review_count: 0,
    })
    .select()
    .single()

  if (statsError) {
    console.error('Error creating default module stats:', statsError)
    await supabase.from('modules').delete().eq('id', newDbModule.id)
    console.warn(`Cleaned up module ${newDbModule.id} due to stats insertion failure.`)
    return null
  }

  return mapDbModuleToModule(newDbModule, newDbStats)
}

/**
 * Updates a module's mutable fields (title, overview).
 * @param moduleId - The ID of the module to update.
 * @param updates - An object containing the fields to update.
 * @returns The updated and mapped Module object (basic details only) or null if an error occurs.
 */
export const updateModule = async (
  moduleId: string,
  updates: Partial<Pick<DbModule, 'title' | 'overview'>>
): Promise<Module | null> => {
  const { data: updatedDbModule, error } = await supabase
    .from('modules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', moduleId)
    .select()
    .single()

  if (error) {
    console.error('Error updating module:', error)
    return null
  }

  // Fetch associated quizzes to include in the returned Module object
  const { data: quizzesData, error: quizzesError } = await supabase
    .from('quizzes')
    .select('id, module_id, user_id, title, time_limit_seconds, created_at, updated_at')
    .eq('module_id', moduleId)

  if (quizzesError) {
    console.error('Error fetching quizzes during module update:', quizzesError)
    // Decide if you want to return partial data or null
    // Returning partial data for now:
    return mapDbModuleToModule(updatedDbModule)
  }

  // Map with quizzes included
  return mapDbModuleToModule(updatedDbModule, undefined, undefined, quizzesData || [])
}

/**
 * Deletes a module by its ID. Assumes RLS handles ownership and cascades deletes.
 * @param moduleId - The ID of the module to delete.
 * @returns True if deletion was successful, false otherwise.
 */
export const deleteModule = async (moduleId: string): Promise<boolean> => {
  const { error } = await supabase.from('modules').delete().eq('id', moduleId)

  if (error) {
    console.error('Error deleting module:', error)
    return false
  }
  return true
}

/**
 * Adds a source file reference to a module.
 * @param moduleId - The ID of the module to add the source to.
 * @param sourceData - Information about the source file.
 * @returns The newly created and mapped ModuleSource object or null if an error occurs.
 */
export const addModuleSource = async (
  moduleId: string,
  sourceData: Pick<
    TablesInsert<'module_sources'>,
    'file_name' | 'storage_object_path' | 'mime_type' | 'size_bytes'
  >
): Promise<ModuleSource | null> => {
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()
  if (authError || !session?.user) {
    console.error('Auth error:', authError)
    return null
  }
  const userId = session.user.id

  const { data: newDbSource, error } = await supabase
    .from('module_sources')
    .insert({ ...sourceData, module_id: moduleId, user_id: userId })
    .select()
    .single()

  if (error) {
    console.error('Error adding module source:', error)
    return null
  }
  return mapDbModuleSourceToModuleSource(newDbSource)
}

/**
 * Deletes a module source by its ID. Assumes RLS handles ownership.
 * @param sourceId - The ID of the module source to delete.
 * @returns True if deletion was successful, false otherwise.
 */
export const deleteModuleSource = async (sourceId: string): Promise<boolean> => {
  const { error } = await supabase.from('module_sources').delete().eq('id', sourceId)

  if (error) {
    console.error('Error deleting module source:', error)
    return false
  }
  return true
}

/**
 * Updates the statistics for a module.
 * @param moduleId - The ID of the module whose stats are being updated.
 * @param statsUpdate - An object containing the stat fields to update.
 * @returns The updated and mapped ModuleStats object or null if an error occurs.
 */
export const updateModuleStats = async (
  moduleId: string,
  statsUpdate: Partial<Omit<DbModuleStats, 'module_id' | 'user_id'>>
): Promise<ModuleStats | null> => {
  const updatePayload = { ...statsUpdate }
  if (statsUpdate.current_box !== undefined || statsUpdate.review_count !== undefined) {
    updatePayload.last_reviewed_at = new Date().toISOString()
  }

  const { data: updatedDbStats, error } = await supabase
    .from('module_stats')
    .update(updatePayload)
    .eq('module_id', moduleId)
    .select()
    .single()

  if (error) {
    console.error('Error updating module stats:', error)
    return null
  }
  return mapDbModuleStatsToModuleStats(updatedDbStats)
}

/**
 * Fetches the statistics for a single module.
 * @param moduleId - The ID of the module.
 * @returns The mapped ModuleStats object or null if not found or error.
 */
export const getModuleStats = async (moduleId: string): Promise<ModuleStats | null> => {
  const { data: dbStats, error } = await supabase
    .from('module_stats')
    .select('*')
    .eq('module_id', moduleId)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') console.error('Error fetching module stats:', error)
    return null
  }
  return mapDbModuleStatsToModuleStats(dbStats)
}
