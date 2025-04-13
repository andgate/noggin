import type { Tables } from '@noggin/types/database.types'
import { ModuleListItem, moduleListItemSchema } from '@noggin/types/module-list-item.types'
import { ModuleSource, moduleSourceSchema } from '@noggin/types/module-source.types'
import { ModuleStats, moduleStatsSchema } from '@noggin/types/module-stats.types'
import { Module, moduleSchema } from '@noggin/types/module.types'
import { mapDbQuizToQuiz } from './quizApi.mappers'

// Define DB Row types locally using the Tables helper
type DbModule = Tables<'modules'>
type DbModuleStats = Tables<'module_stats'>
type DbModuleSource = Tables<'module_sources'>
type DbQuiz = Tables<'quizzes'>

// Define the expected input structure for the list item mapper based on the Supabase query
// This type is internal to this function's usage description but not exported.
type InputForModuleListItem = Pick<DbModule, 'id' | 'user_id' | 'title'> & {
  module_stats: Pick<DbModuleStats, 'current_box' | 'next_review_at'> | null
}

/**
 * Maps the specific data fetched for the module list to the ModuleListItem view type and validates it.
 * @param dbData - The raw data object containing module id, title, user_id and minimal stats.
 *                 Expected shape: { id, user_id, title, module_stats: { current_box, next_review_at } | null }
 * @returns The validated ModuleListItem object.
 * @throws {ZodError} if validation fails.
 */
export function mapDbDataToModuleListItem(dbData: InputForModuleListItem): ModuleListItem {
  const mappedItem = {
    id: dbData.id,
    userId: dbData.user_id,
    title: dbData.title,
    // Map only the necessary stats fields, handle null case
    stats: dbData.module_stats
      ? {
          currentBox: dbData.module_stats.current_box,
          nextReviewAt: dbData.module_stats.next_review_at,
        }
      : undefined, // Use undefined if stats are null/missing
  }
  // Validate against the specific list item schema
  return moduleListItemSchema.parse(mappedItem)
}

/**
 * Maps a database module_stats row to the ModuleStats view type and validates it.
 * @param dbStats - The raw database module_stats object.
 * @returns The validated ModuleStats object.
 * @throws {ZodError} if validation fails.
 */
export function mapDbModuleStatsToModuleStats(dbStats: DbModuleStats): ModuleStats {
  const mappedStats = {
    moduleId: dbStats.module_id,
    userId: dbStats.user_id,
    currentBox: dbStats.current_box,
    lastReviewedAt: dbStats.last_reviewed_at,
    nextReviewAt: dbStats.next_review_at,
    quizAttempts: dbStats.quiz_attempts,
    reviewCount: dbStats.review_count,
  }
  return moduleStatsSchema.parse(mappedStats)
}

/**
 * Maps a database module_sources row to the ModuleSource view type and validates it.
 * @param dbSource - The raw database module_sources object.
 * @returns The validated ModuleSource object.
 * @throws {ZodError} if validation fails.
 */
export function mapDbModuleSourceToModuleSource(dbSource: DbModuleSource): ModuleSource {
  const mappedSource = {
    id: dbSource.id,
    moduleId: dbSource.module_id,
    userId: dbSource.user_id,
    fileName: dbSource.file_name,
    storageObjectPath: dbSource.storage_object_path,
    mimeType: dbSource.mime_type,
    sizeBytes: dbSource.size_bytes,
    createdAt: dbSource.created_at,
  }
  return moduleSourceSchema.parse(mappedSource)
}

/**
 * Maps a database modules row (and potentially related data) to the Module view type and validates it.
 * Handles partial data for different fetching contexts (list vs detail).
 * When mapping quizzes within a module, only basic quiz info is mapped; questions/submissions are omitted.
 *
 * @param dbModule - The raw database modules object.
 * @param dbStats - Optional raw database module_stats object.
 * @param dbSources - Optional array of raw database module_sources objects.
 * @param dbQuizzes - Optional array of raw database quizzes objects (only basic info used).
 * @returns The validated Module object.
 * @throws {ZodError} if validation fails.
 */
export function mapDbModuleToModule(
  dbModule: DbModule,
  dbStats?: DbModuleStats,
  dbSources?: DbModuleSource[],
  dbQuizzes?: DbQuiz[]
): Module {
  const mappedModule = {
    id: dbModule.id,
    userId: dbModule.user_id,
    title: dbModule.title,
    overview: dbModule.overview,
    createdAt: dbModule.created_at,
    updatedAt: dbModule.updated_at,
    stats: dbStats ? mapDbModuleStatsToModuleStats(dbStats) : undefined,
    sources: dbSources ? dbSources.map(mapDbModuleSourceToModuleSource) : [],
    // Explicitly call mapDbQuizToQuiz with only the quiz object.
    // Nested questions/submissions will be empty arrays as handled by mapDbQuizToQuiz.
    quizzes: dbQuizzes ? dbQuizzes.map((quiz) => mapDbQuizToQuiz(quiz)) : [],
  }
  return moduleSchema.parse(mappedModule)
}
