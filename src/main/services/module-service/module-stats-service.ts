import { ModuleStats, moduleStatsSchema } from '@noggin/types/module-types'
import { readJsonFile, writeJsonFile } from '../../common/fs-utils'
import { createModuleStats, getModuleStatsPath } from '../../common/module-utils'
import { readAllLibraries } from '../library-service'
import { getModuleOverviews, resolveModulePath } from './module-discovery-service'

/**
 * Get statistics for a module
 */
export async function getModuleStats(libraryId: string, moduleId: string): Promise<ModuleStats> {
    const modulePath = await resolveModulePath(libraryId, moduleId)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleId}`)
    }

    const statsPath = getModuleStatsPath(modulePath)
    try {
        // Attempt to read existing stats, validating against the updated schema
        return await readJsonFile(statsPath, moduleStatsSchema)
    } catch (error) {
        // Only create and save default stats if file doesn't exist
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            console.log(`Stats file not found for ${moduleId}, creating default stats.`)
            // createModuleStats now creates stats without lastReviewDate and with nextReviewDate
            const defaultStats = await createModuleStats(modulePath)
            await writeJsonFile(statsPath, defaultStats)
            return defaultStats
        }
        // Rethrow other errors (e.g., validation errors against the new schema)
        console.error(`Error reading or validating stats for ${moduleId}:`, error)
        throw error
    }
}

/**
 * Save statistics for a module
 */
export async function saveModuleStats(
    libraryId: string,
    moduleId: string,
    stats?: ModuleStats
): Promise<void> {
    const modulePath = await resolveModulePath(libraryId, moduleId)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleId}`)
    }

    if (!stats) {
        return // No stats to save
    }

    const statsPath = getModuleStatsPath(modulePath)
    await writeJsonFile(statsPath, stats)
}

/**
 * Get all module stats from all libraries
 */
export async function getAllModuleStats(): Promise<ModuleStats[]> {
    const libraries = await readAllLibraries()
    const statsPromises: Promise<ModuleStats | null>[] = []

    for (const library of libraries) {
        const libraryId = library.id
        const overviews = await getModuleOverviews(libraryId)

        for (const overview of overviews) {
            statsPromises.push(
                getModuleStats(libraryId, overview.id).catch((error) => {
                    // Use overview.id
                    console.error(
                        `Failed to get stats for module ${overview.id} in library ${libraryId}:`,
                        error
                    )
                    return null
                })
            )
        }
    }

    const stats = await Promise.all(statsPromises)
    return stats.filter((stat): stat is ModuleStats => stat !== null)
}
