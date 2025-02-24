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
import {
    Mod,
    ModuleMetadata,
    moduleMetadataSchema,
    ModuleOverview,
    ModuleStats,
    moduleStatsSchema,
} from '@noggin/types/module-types'
import { Quiz, quizSchema, Submission, submissionSchema } from '@noggin/types/quiz-types'
import fs from 'fs/promises'
import { glob } from 'glob'
import path from 'path'
import { z } from 'zod'
import { calculatePriority } from '../common/spaced-repetition'
import { getAllLibraries, getRegisteredLibraries } from './library-service'

// Helper to read and parse JSON files
async function readJsonFile<T>(filePath: string, schema: z.ZodSchema<T>): Promise<T> {
    const rawData = await fs.readFile(filePath, 'utf-8')
    return schema.parse(JSON.parse(rawData))
}

// Helper to ensure directory exists
async function ensureDir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true })
}

// Module data reading functions
export async function readModuleData(modPath: string): Promise<Mod> {
    console.log('Reading module data from', modPath)

    // Get metadata first to extract the slug
    const metadata = await readModuleMetadata(modPath)

    // Find which library this module belongs to
    const libraries = await getAllLibraries()
    let libraryId = 'nog' // Default fallback

    for (const lib of libraries) {
        if (modPath.startsWith(lib.path)) {
            libraryId = lib.metadata.slug
            break
        }
    }

    const [quizzes, submissions, sources, stats] = await Promise.all([
        readQuizzes(modPath),
        readSubmissions(modPath),
        readSources(modPath),
        getModuleStats(libraryId, metadata.slug),
    ])

    return {
        id: path.basename(modPath, '.mod'),
        path: modPath,
        metadata,
        stats,
        sources,
        quizzes,
        submissions,
    }
}

// Module data writing functions
export async function writeModuleData(libraryPath: string, mod: Mod): Promise<void> {
    console.log('Writing module data to', libraryPath, mod.id)
    const modulePath = path.join(libraryPath, `${mod.id}`)
    await ensureModuleDirectories(modulePath)
    await writeModuleMetadata(modulePath, mod.metadata)
    await writeSubmissions(modulePath, mod.submissions)
    await saveModuleStats(libraryPath, mod.id, mod.stats)
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

export async function resolveModulePath(
    libraryId: string,
    moduleSlug: string
): Promise<string | null> {
    const libraries = await getAllLibraries()
    const library = libraries.find((lib) => lib.metadata.slug === libraryId)
    if (!library) {
        throw new Error(`Library not found: ${libraryId}`)
    }

    // Get all modules in this library
    const modulePaths = await glob('*/.mod', {
        cwd: library.path,
        absolute: true,
    }).then((paths) => paths.map((p) => path.dirname(p)))

    // Read metadata from each module to find the matching slug
    for (const modPath of modulePaths) {
        try {
            const metadata = await readModuleMetadata(modPath)
            if (metadata.slug === moduleSlug) {
                return modPath
            }
        } catch (error) {
            console.error(`Failed to read metadata for ${modPath}:`, error)
        }
    }

    return null
}

export async function readModuleBySlug(libraryId: string, moduleSlug: string): Promise<Mod> {
    const modulePath = await resolveModulePath(libraryId, moduleSlug)

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

export async function saveModuleQuiz(
    libraryId: string,
    moduleSlug: string,
    quiz: Quiz
): Promise<void> {
    const modulePath = await resolveModulePath(libraryId, moduleSlug)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleSlug}`)
    }
    await writeQuiz(modulePath, quiz)
}

export async function deleteModuleQuiz(
    libraryId: string,
    moduleSlug: string,
    quizId: string
): Promise<void> {
    const modulePath = await resolveModulePath(libraryId, moduleSlug)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleSlug}`)
    }
    const quizPath = path.join(modulePath, '.mod/quizzes', `${quizId}.json`)
    await fs.unlink(quizPath)
}

export async function readModuleQuiz(
    libraryId: string,
    moduleSlug: string,
    quizId: string
): Promise<Quiz> {
    const modulePath = await resolveModulePath(libraryId, moduleSlug)
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
    libraryId: string,
    moduleSlug: string,
    submission: Submission
): Promise<void> {
    const modulePath = await resolveModulePath(libraryId, moduleSlug)
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
    libraryId: string,
    moduleSlug: string,
    quizId: string,
    attempt: number
): Promise<Submission> {
    const modulePath = await resolveModulePath(libraryId, moduleSlug)
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

export async function getQuizAttemptCount(
    libraryId: string,
    moduleSlug: string,
    quizId: string
): Promise<number> {
    const modulePath = await resolveModulePath(libraryId, moduleSlug)
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

export async function getLatestModuleQuiz(libraryId: string, moduleSlug: string): Promise<Quiz> {
    const mod = await readModuleBySlug(libraryId, moduleSlug)
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
    libraryId: string,
    moduleSlug: string,
    quizId: string
): Promise<Submission[]> {
    const modulePath = await resolveModulePath(libraryId, moduleSlug)
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

export async function getModuleSubmissions(
    libraryId: string,
    moduleSlug: string
): Promise<Submission[]> {
    const modulePath = await resolveModulePath(libraryId, moduleSlug)
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

export async function getModuleStats(libraryId: string, moduleSlug: string): Promise<ModuleStats> {
    const modulePath = await resolveModulePath(libraryId, moduleSlug)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleSlug}`)
    }

    const statsPath = path.join(modulePath, '.mod', 'stats.json')
    try {
        return await readJsonFile(statsPath, moduleStatsSchema)
    } catch (error) {
        // Return default stats if none exist
        return {
            moduleId: moduleSlug,
            currentBox: 1,
            lastReviewDate: new Date().toISOString(),
            nextDueDate: new Date().toISOString(),
        }
    }
}

export async function saveModuleStats(
    libraryId: string,
    moduleSlug: string,
    stats?: ModuleStats
): Promise<void> {
    const modulePath = await resolveModulePath(libraryId, moduleSlug)
    if (!modulePath) {
        throw new Error(`Module not found: ${moduleSlug}`)
    }

    if (!stats) {
        return // No stats to save
    }

    const statsPath = path.join(modulePath, 'stats.json')
    await ensureDir(path.dirname(statsPath))
    await fs.writeFile(statsPath, JSON.stringify(stats, null, 2))
}

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

export async function getDueModules(): Promise<Mod[]> {
    const libraries = await getAllLibraries()
    const allModules: Mod[] = []

    for (const library of libraries) {
        const libraryId = library.metadata.slug
        const overviews = await getModuleOverviews(libraryId)

        for (const overview of overviews) {
            try {
                const mod = await readModuleBySlug(libraryId, overview.slug)
                const stats = await getModuleStats(libraryId, overview.slug)
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
    const now = new Date()
    return allModules
        .filter((mod) => {
            const nextDue = new Date(mod.stats?.nextDueDate || '')
            return nextDue <= now
        })
        .sort((a, b) => calculatePriority(b.stats) - calculatePriority(a.stats))
}

export async function readModuleMetadata(modPath: string): Promise<ModuleMetadata> {
    const metadataPath = path.join(modPath, '.mod', 'metadata.json')
    try {
        return await readJsonFile(metadataPath, moduleMetadataSchema)
    } catch (error) {
        throw new Error(`Failed to read metadata for module at ${modPath}: ${error}`)
    }
}

export async function writeModuleMetadata(
    modPath: string,
    metadata: ModuleMetadata
): Promise<void> {
    const metadataPath = path.join(modPath, '.mod', 'metadata.json')
    await ensureDir(path.dirname(metadataPath))
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))
}

async function getAllModulePaths(): Promise<string[]> {
    const libraries = await getRegisteredLibraries()
    const modulePaths: string[] = []

    for (const libraryPath of libraries) {
        // Find all .mod directories in the library
        const modules = await glob('*/.mod', {
            cwd: libraryPath,
            absolute: true,
        }).then((paths) => paths.map((p) => path.dirname(p)))
        modulePaths.push(...modules)
    }

    return modulePaths
}

export async function getModuleOverviews(libraryId: string): Promise<ModuleOverview[]> {
    const libraries = await getAllLibraries()
    const library = libraries.find((lib) => lib.metadata.slug === libraryId)
    if (!library) {
        throw new Error(`Library not found: ${libraryId}`)
    }
    console.log('Library Path:', library.path)
    const modulesPaths = await glob('*/.mod', {
        cwd: library.path,
        absolute: true,
    }).then((paths) => paths.map((p) => path.dirname(p)))

    const overviews = await Promise.all(
        modulesPaths.map(async (modPath): Promise<ModuleOverview> => {
            const metadata = await readModuleMetadata(modPath)
            return {
                slug: metadata.slug,
                displayName: metadata.title,
                librarySlug: libraryId,
            }
        })
    )
    return overviews
}
