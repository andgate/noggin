/**
 * A service for managing individual learning modules ("mods").
 *
 * Mods are stored in directories with a .mod extension containing:
 * - Content sources (PDFs, text files) in the root directory
 * - Tests with questions in the quizzes/ subdirectory
 * - Student submissions in the submissions/ subdirectory
 *
 * The service provides functions to:
 * - List all mods that the system has loaded
 * - Load mod data from a directory
 * - Save mod data to a directory
 * - Delete a mod and its contents
 */
import { SimpleFile } from '@noggin/types/electron-types'
import { Mod } from '@noggin/types/module-types'
import { Quiz, quizSchema, Submission, submissionSchema } from '@noggin/types/quiz-types'
import fs from 'fs/promises'
import { glob } from 'glob'
import path from 'path'
import { z } from 'zod'
import { store } from './store-service'

// Helper to read and parse JSON files
async function readJsonFile<T>(filePath: string, schema: z.ZodSchema<T>): Promise<T> {
    const rawData = await fs.readFile(filePath, 'utf-8')
    return schema.parse(JSON.parse(rawData))
}

// Helper to ensure directory exists
async function ensureDir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true })
}

// Path management functions
export async function getRegisteredPaths(): Promise<string[]> {
    return store.get('modulePaths', [])
}

export async function registerModulePath(modPath: string): Promise<void> {
    const paths = await getRegisteredPaths()
    const normalizedPath = path.normalize(modPath)
    if (!paths.includes(modPath)) {
        store.set('modulePaths', [...paths, normalizedPath])
    }
}

export async function unregisterModulePath(modPath: string): Promise<void> {
    const paths = await getRegisteredPaths()
    store.set(
        'modulePaths',
        paths.filter((p) => p !== modPath)
    )
}

// Module data reading functions
export async function readModuleData(modPath: string): Promise<Mod> {
    console.log('Reading module data from', modPath)
    const [quizzes, submissions, sources] = await Promise.all([
        readQuizzes(modPath),
        readSubmissions(modPath),
        readSources(modPath),
    ])

    return {
        id: path.basename(modPath, '.mod'),
        name: path.basename(modPath, '.mod'),
        path: modPath,
        sources,
        quizzes,
        submissions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
}

// Module data writing functions
export async function writeModuleData(modPath: string, mod: Mod): Promise<void> {
    await ensureModuleDirectories(modPath)
    await writeSubmissions(modPath, mod.submissions)
    // Only write metadata, don't touch sources
}

// File system operations
async function removeDirectoryRecursively(dirPath: string): Promise<void> {
    try {
        await fs.rm(dirPath, {
            recursive: true,
            force: true,
            maxRetries: 3,
            retryDelay: 100,
        })
    } catch (error) {
        console.error(`Error removing directory ${dirPath}:`, error)
        throw error
    }
}

export async function removeModule(modPath: string): Promise<void> {
    try {
        await removeDirectoryRecursively(modPath)
        await unregisterModulePath(modPath)
    } catch (error) {
        console.error(`Failed to remove module at ${modPath}:`, error)
        throw error
    }
}

// New helper functions for better separation
async function readQuizzes(modPath: string) {
    return glob('.mod/quizzes/*.json', { cwd: modPath, absolute: true }).then((files) =>
        Promise.all(files.map((f) => readJsonFile(f, quizSchema)))
    )
}

async function readSubmissions(modPath: string) {
    return glob('.mod/submissions/*.json', { cwd: modPath, absolute: true }).then((files) =>
        Promise.all(files.map((f) => readJsonFile(f, submissionSchema)))
    )
}

async function readSources(modPath: string) {
    console.log('Reading sources from', modPath)
    const sources = await glob('*.{txt,pdf}', { cwd: modPath, absolute: true })
    console.log('Sources:', sources)
    return sources
}

async function ensureModuleDirectories(modPath: string) {
    await Promise.all([
        ensureDir(path.join(modPath, '.mod/quizzes')),
        ensureDir(path.join(modPath, '.mod/submissions')),
    ])
}

async function writeSubmissions(modPath: string, submissions: Submission[]) {
    await Promise.all(
        submissions.map(async (sub) => {
            const subPath = path.join(
                modPath,
                '.mod/submissions',
                `${sub.quizId}-${sub.attemptNumber}.json`
            )
            await fs.writeFile(subPath, JSON.stringify(sub, null, 2))
        })
    )
}

// Source management functions
export async function writeModuleSource(modPath: string, sourceFile: SimpleFile): Promise<string> {
    const fileName = path.basename(sourceFile.path)
    const targetPath = path.join(modPath, fileName)
    await fs.copyFile(sourceFile.path, targetPath)
    return targetPath
}

export async function deleteModuleSource(sourcePath: string): Promise<void> {
    await fs.unlink(sourcePath)
}

async function resolveModulePath(moduleSlug: string): Promise<string | null> {
    const paths = await getRegisteredPaths()
    return paths.find((p) => path.basename(p) === moduleSlug) || null
}

export async function readModuleBySlug(moduleSlug: string): Promise<Mod> {
    const modulePath = await resolveModulePath(moduleSlug)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleSlug}`)
    }
    return readModuleData(modulePath)
}

async function writeQuiz(modPath: string, quiz: Quiz): Promise<void> {
    const quizPath = path.join(modPath, '.mod/quizzes', `${quiz.id}.json`)
    await ensureDir(path.dirname(quizPath))
    await fs.writeFile(quizPath, JSON.stringify(quiz, null, 2))
    console.log(`Wrote quiz to ${quizPath}`)
}

export async function saveModuleQuiz(moduleSlug: string, quiz: Quiz): Promise<void> {
    const modulePath = await resolveModulePath(moduleSlug)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleSlug}`)
    }
    await writeQuiz(modulePath, quiz)
}

export async function deleteModuleQuiz(moduleSlug: string, quizId: string): Promise<void> {
    const modulePath = await resolveModulePath(moduleSlug)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleSlug}`)
    }
    const quizPath = path.join(modulePath, '.mod/quizzes', `${quizId}.json`)
    await fs.unlink(quizPath)
}

export async function readModuleQuiz(moduleSlug: string, quizId: string): Promise<Quiz> {
    const modulePath = await resolveModulePath(moduleSlug)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleSlug}`)
    }

    const quizPath = path.join(modulePath, '.mod/quizzes', `${quizId}.json`)
    console.log('Reading quiz from:', quizPath)

    try {
        return await readJsonFile(quizPath, quizSchema)
    } catch (error) {
        console.error(`Failed to read quiz ${quizId} from module ${moduleSlug}:`, error)
        throw new Error(`Quiz not found: ${quizId}`)
    }
}

export async function saveModuleSubmission(
    moduleSlug: string,
    submission: Submission
): Promise<void> {
    const modulePath = await resolveModulePath(moduleSlug)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleSlug}`)
    }

    const submissionPath = path.join(
        modulePath,
        '.mod/submissions',
        `${submission.quizId}-${submission.attemptNumber}.json`
    )

    await ensureDir(path.dirname(submissionPath))
    await fs.writeFile(submissionPath, JSON.stringify(submission, null, 2))
}

export async function readModuleSubmission(
    moduleSlug: string,
    quizId: string,
    attempt: number
): Promise<Submission> {
    const modulePath = await resolveModulePath(moduleSlug)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleSlug}`)
    }

    const submissionPath = path.join(modulePath, '.mod/submissions', `${quizId}-${attempt}.json`)
    console.log('Reading submission from:', submissionPath)

    try {
        return await readJsonFile(submissionPath, submissionSchema)
    } catch (error) {
        console.error(`Failed to read submission ${quizId}-${attempt}:`, error)
        throw new Error(`Submission not found: ${quizId}-${attempt}`)
    }
}

export async function getQuizAttemptCount(moduleSlug: string, quizId: string): Promise<number> {
    const modulePath = await resolveModulePath(moduleSlug)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleSlug}`)
    }

    const submissionsPath = path.join(modulePath, '.mod/submissions')
    const files = await glob(`${quizId}-*.json`, {
        cwd: submissionsPath,
        absolute: false,
    })

    return files.length
}

export async function getLatestModuleQuiz(moduleSlug: string): Promise<Quiz> {
    const mod = await readModuleBySlug(moduleSlug)
    if (!mod.quizzes.length) {
        throw new Error('No quizzes available for this module')
    }

    // Sort quizzes by creation date and return the most recent
    const sortedQuizzes = [...mod.quizzes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return sortedQuizzes[0]
}

export async function getQuizSubmissions(
    moduleSlug: string,
    quizId: string
): Promise<Submission[]> {
    const modulePath = await resolveModulePath(moduleSlug)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleSlug}`)
    }

    const submissionsPath = path.join(modulePath, '.mod/submissions')
    const files = await glob(`${quizId}-*.json`, {
        cwd: submissionsPath,
        absolute: true,
    })

    const submissions = await Promise.all(files.map((file) => readJsonFile(file, submissionSchema)))

    // Sort submissions by completedAt date in descending order (newest first)
    return submissions.sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )
}

export async function getModuleSubmissions(moduleSlug: string): Promise<Submission[]> {
    const modulePath = await resolveModulePath(moduleSlug)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleSlug}`)
    }

    const submissionsPath = path.join(modulePath, '.mod/submissions')
    const files = await glob('*.json', {
        cwd: submissionsPath,
        absolute: true,
    })

    const submissions = await Promise.all(files.map((file) => readJsonFile(file, submissionSchema)))

    // Sort submissions by completedAt date in descending order (newest first)
    return submissions.sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )
}
