import { Submission, submissionSchema } from '@noggin/types/quiz-types'
import path from 'path'
import { ensureDir, findFiles, readJsonFile, writeJsonFile } from '../common/fs-utils'
import { getSubmissionPath } from '../common/module-utils'
import { updateModuleStats } from '../common/spaced-repetition'
import { resolveModulePath } from './module-discovery-service'
import { getModuleStats, saveModuleStats } from './module-stats-service'

/**
 * Update module stats based on a graded submission
 * This supports the spaced repetition system by adjusting the review schedule
 * based on quiz performance
 */
export async function updateModuleStatsForSubmission(
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
        console.log(`Updated spaced repetition stats for module ${moduleId}, passed: ${isPassing}`)
        return true
    }

    return false
}

/**
 * Save a submission to a module
 */
export async function saveModuleSubmission(
    libraryId: string,
    moduleId: string,
    submission: Submission
): Promise<void> {
    const modulePath = await resolveModulePath(libraryId, moduleId)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleId}`)
    }

    const submissionPath = getSubmissionPath(
        modulePath,
        submission.quizId,
        submission.attemptNumber
    )
    await ensureDir(path.dirname(submissionPath))
    await writeJsonFile(submissionPath, submission)

    // No longer calling updateModuleStatsForSubmission here
    // This should be called separately by the client
}

/**
 * Read a submission from a module
 */
export async function readModuleSubmission(
    libraryId: string,
    moduleId: string,
    quizId: string,
    attempt: number
): Promise<Submission> {
    const modulePath = await resolveModulePath(libraryId, moduleId)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleId}`)
    }

    const submissionPath = getSubmissionPath(modulePath, quizId, attempt)
    console.log('Reading submission from:', submissionPath)

    try {
        return await readJsonFile(submissionPath, submissionSchema)
    } catch (error) {
        console.error(`Failed to read submission ${quizId}-${attempt}:`, error)
        throw new Error(`Submission not found: ${quizId}-${attempt}`)
    }
}

/**
 * Get the number of attempts for a quiz
 */
export async function getQuizAttemptCount(
    libraryId: string,
    moduleId: string,
    quizId: string
): Promise<number> {
    const modulePath = await resolveModulePath(libraryId, moduleId)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleId}`)
    }

    const submissionsPath = path.join(modulePath, '.mod/submissions')
    const files = await findFiles(`${quizId}-*.json`, {
        cwd: submissionsPath,
        absolute: false,
    })

    return files.length
}

/**
 * Get all submissions for a quiz
 */
export async function getQuizSubmissions(
    libraryId: string,
    moduleId: string,
    quizId: string
): Promise<Submission[]> {
    const modulePath = await resolveModulePath(libraryId, moduleId)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleId}`)
    }

    const submissionsPath = path.join(modulePath, '.mod/submissions')
    const files = await findFiles(`${quizId}-*.json`, {
        cwd: submissionsPath,
        absolute: true,
    })

    const submissions = await Promise.all(files.map((file) => readJsonFile(file, submissionSchema)))

    // Sort submissions by completedAt date in descending order (newest first)
    return submissions.sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )
}

/**
 * Get all submissions for a module
 */
export async function getModuleSubmissions(
    libraryId: string,
    moduleId: string
): Promise<Submission[]> {
    const modulePath = await resolveModulePath(libraryId, moduleId)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleId}`)
    }

    const submissionsPath = path.join(modulePath, '.mod/submissions')
    const files = await findFiles('*.json', {
        cwd: submissionsPath,
        absolute: true,
    })

    const submissions = await Promise.all(files.map((file) => readJsonFile(file, submissionSchema)))

    // Sort submissions by completedAt date in descending order (newest first)
    return submissions.sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )
}

/**
 * Write submissions to a module
 */
export async function writeSubmissions(modPath: string, submissions: Submission[]) {
    await Promise.all(
        submissions.map(async (sub) => {
            const subPath = getSubmissionPath(modPath, sub.quizId, sub.attemptNumber)
            await writeJsonFile(subPath, sub)
        })
    )
}
