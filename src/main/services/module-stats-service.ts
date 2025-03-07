import { ModuleStats, moduleStatsSchema } from '@noggin/types/module-types'
import { readJsonFile, writeJsonFile } from '../common/fs-utils'
import { getModuleStatsPath } from '../common/module-utils'
import { getAllLibraries } from './library-service'
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
        return await readJsonFile(statsPath, moduleStatsSchema)
    } catch (error) {
        // Return default stats if none exist
        return {
            moduleId: moduleId,
            currentBox: 1,
            lastReviewDate: new Date().toISOString(),
            nextDueDate: new Date().toISOString(),
        }
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
    const libraries = await getAllLibraries()

    // First, collect all promises for module stats
    const statsPromises: Promise<ModuleStats | null>[] = []

    for (const library of libraries) {
        const libraryId = library.metadata.slug
        const overviews = await getModuleOverviews(libraryId)

        for (const overview of overviews) {
            statsPromises.push(
                getModuleStats(libraryId, overview.slug).catch((error) => {
                    console.error(
                        `Failed to get stats for module ${overview.slug} in library ${libraryId}:`,
                        error
                    )
                    return null
                })
            )
        }
    }

    // Resolve all promises and filter out nulls
    const stats = await Promise.all(statsPromises)
    return stats.filter((stat): stat is ModuleStats => stat !== null)
}
