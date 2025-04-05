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
    console.log(`updateReviewSchedule called for module ${moduleId} in library ${libraryId}`)
    console.log(`Submission status: ${submission.status}, grade: ${submission.grade}`)

    // Only process graded submissions with a grade
    if (submission.status !== 'graded' || submission.grade === undefined) {
        console.log(
            `Skipping update for module ${moduleId}: Submission not graded or grade missing.`
        )
        return false
    }

    // Consider a passing grade to be 60% or higher (D or better)
    const isPassing = submission.grade >= 60
    console.log(`Submission passed: ${isPassing} (grade: ${submission.grade})`)

    try {
        // Get current module stats (now without lastReviewDate)
        const currentStats = await getModuleStats(libraryId, moduleId)
        console.log(`Current module stats:`, currentStats)

        // Update the stats (updateModuleStats now handles the new structure)
        const updatedStats = updateModuleStats(currentStats, isPassing)
        console.log(`Updated module stats:`, updatedStats)

        await saveModuleStats(libraryId, moduleId, updatedStats)
        console.log(
            `Successfully saved updated review schedule for module ${moduleId}. New box: ${updatedStats.currentBox}, Next review: ${updatedStats.nextReviewDate}, Passed: ${isPassing}`
        )
        return true
    } catch (error) {
        console.error(`Error updating review schedule for module ${moduleId}:`, error)
        return false
    }
}

/**
 * Get all modules that are due for review
 * This is the core function for the practice feed, determining what content
 * should be reviewed based on spaced repetition schedules
 */
export async function getDueModules(): Promise<Mod[]> {
    console.log(`getDueModules called - retrieving modules due for review`)
    const libraries = await getAllLibraries()
    const allModules: Mod[] = []

    for (const library of libraries) {
        const libraryId = library.metadata.slug
        console.log(`Processing library: ${libraryId}`)
        const overviews = await getModuleOverviews(libraryId)
        console.log(`Found ${overviews.length} modules in library ${libraryId}`)

        for (const overview of overviews) {
            try {
                const mod = await readModuleById(libraryId, overview.id)
                // Get stats (now without lastReviewDate)
                const stats = await getModuleStats(libraryId, overview.id)
                console.log(
                    `Module ${overview.id}: nextReviewDate = ${stats.nextReviewDate}, currentBox = ${stats.currentBox}`
                )
                allModules.push({
                    ...mod,
                    stats, // stats object now has the updated structure
                })
            } catch (error) {
                console.error(
                    `Failed to read module ${overview.slug} in library ${libraryId}:`,
                    error
                )
            }
        }
    }

    // Filter and sort due modules based on nextReviewDate
    const now = getCurrentDate()
    console.log(`Current date for due date comparison: ${now.toISOString()}`)

    const dueModules = allModules
        .filter((mod) => {
            // Ensure stats exist before accessing nextReviewDate
            if (!mod.stats) {
                console.warn(`Module ${mod.metadata.id} is missing stats. Skipping filter.`)
                return false
            }
            const nextReview = new Date(mod.stats.nextReviewDate)
            const isDue = nextReview <= now
            console.log(
                `Module ${mod.metadata.id}: nextReview = ${nextReview.toISOString()}, isDue = ${isDue}`
            )
            return isDue
        })
        .sort((a, b) => calculatePriority(b.stats) - calculatePriority(a.stats))

    console.log(
        `Found ${dueModules.length} modules due for review out of ${allModules.length} total modules`
    )
    return dueModules
}
