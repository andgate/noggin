import { supabase } from '@noggin/app/common/supabase-client'
import type { Tables, TablesInsert } from '@noggin/types/database.types'

// Helper types
export type DbModule = Tables<'modules'>
export type DbModuleStats = Tables<'module_stats'>
export type DbModuleSource = Tables<'module_sources'>

/**
 * Creates a new module and its initial stats entry for the current user.
 * @param title - The title of the module.
 * @param overview - An overview/description of the module.
 * @param lessonContent - The lesson content (JSON).
 * @returns The newly created module object or null if an error occurs.
 */
export const createModule = async (title: string, overview: string): Promise<DbModule | null> => {
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()
  if (authError || !session?.user) {
    console.error('Auth error:', authError)
    return null
  }
  const userId = session.user.id

  // Insert the module
  const { data: newModule, error: moduleError } = await supabase
    .from('modules')
    .insert({
      user_id: userId,
      title,
      overview,
    })
    .select()
    .single()

  if (moduleError || !newModule) {
    console.error('Error creating module:', moduleError)
    // TODO: Consider if cleanup is needed if module insert succeeded but stats failed later
    return null
  }

  // Insert default stats for the new module
  const { error: statsError } = await supabase.from('module_stats').insert({
    module_id: newModule.id,
    user_id: userId,
    current_box: 1,
    next_review_at: new Date().toISOString(),
    quiz_attempts: 0,
    review_count: 0,
  })

  if (statsError) {
    console.error('Error creating default module stats:', statsError)
    // Attempt to clean up the created module if stats insertion fails
    // This is best-effort; a transaction or DB function would be more robust
    await supabase.from('modules').delete().eq('id', newModule.id)
    console.warn(`Cleaned up module ${newModule.id} due to stats insertion failure.`)
    return null
  }

  return newModule
}

/**
 * Fetches all modules belonging to the current user.
 * @returns An array of modules or an empty array if none found or error.
 */
export const getAllModules = async (): Promise<DbModule[]> => {
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()
  if (authError || !session?.user) {
    console.error('Auth error:', authError)
    return []
  }
  const userId = session.user.id

  const { data, error } = await supabase.from('modules').select('*').eq('user_id', userId) // Explicit user_id check needed here

  if (error) {
    console.error('Error fetching all modules:', error)
    return []
  }
  return data || []
}

/**
 * Fetches a single module by its ID. Assumes RLS handles ownership.
 * @param moduleId - The ID of the module.
 * @returns The module object or null if not found or error.
 */
export const getModule = async (moduleId: string): Promise<DbModule | null> => {
  const { data, error } = await supabase.from('modules').select('*').eq('id', moduleId).single()

  if (error) {
    // Don't log 'PGRST116' (resource not found) as an error
    if (error.code !== 'PGRST116') {
      console.error('Error fetching module:', error)
    }
    return null
  }
  return data
}

/**
 * Fetches a module along with its stats and sources. Assumes RLS handles ownership.
 * @param moduleId - The ID of the module.
 * @returns An object containing the module, stats, and sources, or null if any part fails or not found.
 */
export const getModuleWithDetails = async (
  moduleId: string
): Promise<{ module: DbModule; stats: DbModuleStats; sources: DbModuleSource[] } | null> => {
  try {
    const [moduleResult, statsResult, sourcesResult] = await Promise.all([
      supabase.from('modules').select('*').eq('id', moduleId).single(),
      supabase.from('module_stats').select('*').eq('module_id', moduleId).single(),
      supabase.from('module_sources').select('*').eq('module_id', moduleId),
    ])

    // Check for errors in each query
    if (moduleResult.error) {
      if (moduleResult.error.code !== 'PGRST116')
        console.error('Error fetching module:', moduleResult.error)
      return null
    }
    if (statsResult.error) {
      if (statsResult.error.code !== 'PGRST116')
        console.error('Error fetching module stats:', statsResult.error)
      // Module exists but stats don't - potentially inconsistent state, treat as error
      return null
    }
    if (sourcesResult.error) {
      console.error('Error fetching module sources:', sourcesResult.error)
      return null
    }

    // Ensure module and stats were found (sources can be empty)
    if (!moduleResult.data || !statsResult.data) {
      return null
    }

    return {
      module: moduleResult.data,
      stats: statsResult.data,
      sources: sourcesResult.data || [],
    }
  } catch (error) {
    console.error('Error fetching module with details:', error)
    return null
  }
}

/**
 * Updates a module's mutable fields. Assumes RLS handles ownership.
 * @param moduleId - The ID of the module to update.
 * @param updates - An object containing the fields to update.
 * @returns The updated module object or null if an error occurs.
 */
export const updateModule = async (
  moduleId: string,
  updates: Partial<Pick<DbModule, 'title' | 'overview'>>
): Promise<DbModule | null> => {
  const { data, error } = await supabase
    .from('modules')
    .update({ ...updates, updated_at: new Date().toISOString() }) // Ensure updated_at is set
    .eq('id', moduleId)
    .select()
    .single()

  if (error) {
    console.error('Error updating module:', error)
    return null
  }
  return data
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
 * @returns The newly created module source record or null if an error occurs.
 */
export const addModuleSource = async (
  moduleId: string,
  sourceData: Pick<
    TablesInsert<'module_sources'>,
    'file_name' | 'storage_object_path' | 'mime_type' | 'size_bytes'
  >
): Promise<DbModuleSource | null> => {
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()
  if (authError || !session?.user) {
    console.error('Auth error:', authError)
    return null
  }
  const userId = session.user.id

  const { data, error } = await supabase
    .from('module_sources')
    .insert({
      ...sourceData,
      module_id: moduleId,
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding module source:', error)
    return null
  }
  return data
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
 * Updates the statistics for a module. Assumes RLS handles ownership.
 * @param moduleId - The ID of the module whose stats are being updated.
 * @param statsUpdate - An object containing the stat fields to update.
 * @returns The updated module stats object or null if an error occurs.
 */
export const updateModuleStats = async (
  moduleId: string,
  statsUpdate: Partial<Omit<DbModuleStats, 'module_id' | 'user_id'>>
): Promise<DbModuleStats | null> => {
  // Ensure last_reviewed_at is updated if relevant fields change
  const updatePayload = { ...statsUpdate }
  if (statsUpdate.current_box !== undefined || statsUpdate.review_count !== undefined) {
    updatePayload.last_reviewed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('module_stats')
    .update(updatePayload)
    .eq('module_id', moduleId) // RLS implicitly handles user_id check here
    .select()
    .single()

  if (error) {
    console.error('Error updating module stats:', error)
    return null
  }
  return data
}

/**
 * Fetches the statistics for a single module. Assumes RLS handles ownership.
 * @param moduleId - The ID of the module.
 * @returns The module stats object or null if not found or error.
 */
export const getModuleStats = async (moduleId: string): Promise<DbModuleStats | null> => {
  const { data, error } = await supabase
    .from('module_stats')
    .select('*')
    .eq('module_id', moduleId) // RLS implicitly handles user_id check here
    .single()

  if (error) {
    // Don't log 'PGRST116' (resource not found) as an error
    if (error.code !== 'PGRST116') {
      console.error('Error fetching module stats:', error)
    }
    return null
  }
  return data
}
