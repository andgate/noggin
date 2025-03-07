import { Mod } from '@noggin/types/module-types'
import { Submission } from '@noggin/types/quiz-types'
import { getCurrentDate } from '../common/date-utils'
import { calculatePriority, updateModuleStats } from '../common/spaced-repetition'
import { getAllLibraries } from './library-service'
import { readModuleById } from './module-service/module-core-service'
import { getModuleOverviews } from './module-service/module-discovery-service'
import { getModuleStats, saveModuleStats } from './module-service/module-stats-service'

/**
 * Updates the review schedule for a module based on a completed submission
 * This implements spaced repetition by adjusting when the module will next appear
 * in the practice feed based on the user's performance
 *
 * @param libraryId - The library containing the module
 * @param moduleId - The module to update
 * @param submission - The graded submission to base the schedule update on
 * @returns Boolean indicating if the schedule was updated
 */
export async function updateReviewSchedule(
    libraryId: string,
    moduleId: string,
    submission: Submission
): Promise<boolean> {
    // Only process graded submissions with a grade
    if (submission.status !== 'graded' || submission.grade === undefined) {
        return false
    }

    // Consider a passing grade to be 60% or higher (D or better)
    const isPassing = submission.grade >= 60

    // Get current module stats
    const currentStats = await getModuleStats(libraryId, moduleId)

    // Check if this submission is more recent than the last review
    const submissionDate = new Date(submission.completedAt)
    const lastReviewDate = new Date(currentStats.lastReviewDate)

    if (submissionDate > lastReviewDate) {
        // Update the stats based on whether the student passed
        const updatedStats = updateModuleStats(currentStats, isPassing)
        await saveModuleStats(libraryId, moduleId, updatedStats)
        console.log(`Updated review schedule for module ${moduleId}, passed: ${isPassing}`)
        return true
    }

    return false
}

/**
 * Get all modules that are due for review
 * This is the core function for the practice feed, determining what content
 * should be reviewed based on spaced repetition schedules
 */
export async function getDueModules(): Promise<Mod[]> {
    const libraries = await getAllLibraries()
    const allModules: Mod[] = []

    for (const library of libraries) {
        const libraryId = library.metadata.slug
        const overviews = await getModuleOverviews(libraryId)

        for (const overview of overviews) {
            try {
                const mod = await readModuleById(libraryId, overview.id)
                const stats = await getModuleStats(libraryId, overview.id)
                allModules.push({
                    ...mod,
                    stats,
                })
            } catch (error) {
                console.error(
                    `Failed to read module ${overview.slug} in library ${libraryId}:`,
                    error
                )
            }
        }
    }

    // Filter and sort due modules
    const now = getCurrentDate()
    return allModules
        .filter((mod) => {
            const nextDue = new Date(mod.stats?.nextDueDate || '')
            return nextDue <= now
        })
        .sort((a, b) => calculatePriority(b.stats) - calculatePriority(a.stats))
}
