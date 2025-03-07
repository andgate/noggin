import { Submission, submissionSchema } from '@noggin/types/quiz-types'
import path from 'path'
import { ensureDir, findFiles, readJsonFile, writeJsonFile } from '../common/fs-utils'
import { getSubmissionPath } from '../common/module-utils'
import { resolveModulePath } from './module-discovery-service'

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
