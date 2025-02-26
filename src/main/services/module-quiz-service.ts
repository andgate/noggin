import { Quiz, quizSchema } from '@noggin/types/quiz-types'
import fs from 'fs/promises'
import path from 'path'
import { ensureDir, readJsonFile, writeJsonFile } from '../common/fs-utils'
import { getQuizPath } from '../common/module-utils'
import { readModuleById } from './module-core-service'
import { resolveModulePath } from './module-discovery-service'

/**
 * Save a quiz to a module
 */
export async function saveModuleQuiz(
    libraryId: string,
    moduleId: string,
    quiz: Quiz
): Promise<void> {
    const modulePath = await resolveModulePath(libraryId, moduleId)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleId}`)
    }
    await writeQuiz(modulePath, quiz)
}

/**
 * Write a quiz to a module's quiz directory
 */
async function writeQuiz(modPath: string, quiz: Quiz): Promise<void> {
    const quizPath = getQuizPath(modPath, quiz.id)
    await ensureDir(path.dirname(quizPath))
    await writeJsonFile(quizPath, quiz)
    console.log(`Wrote quiz to ${quizPath}`)
}

/**
 * Delete a quiz from a module
 */
export async function deleteModuleQuiz(
    libraryId: string,
    moduleId: string,
    quizId: string
): Promise<void> {
    const modulePath = await resolveModulePath(libraryId, moduleId)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleId}`)
    }
    const quizPath = getQuizPath(modulePath, quizId)
    await fs.unlink(quizPath)
}

/**
 * Read a quiz from a module
 */
export async function readModuleQuiz(
    libraryId: string,
    moduleId: string,
    quizId: string
): Promise<Quiz> {
    const modulePath = await resolveModulePath(libraryId, moduleId)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleId}`)
    }

    const quizPath = getQuizPath(modulePath, quizId)
    console.log('Reading quiz from:', quizPath)

    try {
        return await readJsonFile(quizPath, quizSchema)
    } catch (error) {
        console.error(`Failed to read quiz ${quizId} from module ${moduleId}:`, error)
        throw new Error(`Quiz not found: ${quizId}`)
    }
}

/**
 * Get the most recent quiz from a module
 */
export async function getLatestModuleQuiz(libraryId: string, moduleId: string): Promise<Quiz> {
    const mod = await readModuleById(libraryId, moduleId)
    if (!mod.quizzes.length) {
        throw new Error('No quizzes available for this module')
    }

    // Sort quizzes by creation date and return the most recent
    const sortedQuizzes = [...mod.quizzes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return sortedQuizzes[0]
}
