import { SimpleFile } from '@noggin/types/electron-types'
import { Mod, ModuleMetadata, moduleMetadataSchema } from '@noggin/types/module-types'
import { quizSchema, submissionSchema } from '@noggin/types/quiz-types'
import fs from 'fs/promises'
import path from 'path'
import {
    ensureDir,
    findFiles,
    readJsonFile,
    removeDirectoryRecursively,
    writeJsonFile,
} from '../common/fs-utils'
import { getModuleMetadataPath, getQuizPath, getSubmissionPath } from '../common/module-utils'
import { resolveModulePath } from './module-discovery-service'

/**
 * Read a module's metadata
 */
export async function readModuleMetadata(modPath: string): Promise<ModuleMetadata> {
    const metadataPath = getModuleMetadataPath(modPath)
    try {
        return await readJsonFile(metadataPath, moduleMetadataSchema)
    } catch (error) {
        throw new Error(`Failed to read metadata for module at ${modPath}: ${error}`)
    }
}

/**
 * Write a module's metadata
 */
export async function writeModuleMetadata(
    modPath: string,
    metadata: ModuleMetadata
): Promise<void> {
    const metadataPath = getModuleMetadataPath(modPath)
    await writeJsonFile(metadataPath, metadata)
}

/**
 * Read a module's sources (PDFs, text files)
 */
async function readSources(modPath: string) {
    console.log('Reading sources from', modPath)
    const sources = await findFiles('*.{txt,pdf}', { cwd: modPath, absolute: true })
    console.log('Sources:', sources)
    return sources
}

/**
 * Read a module's quizzes
 */
async function readQuizzes(modPath: string) {
    return findFiles('.mod/quizzes/*.json', { cwd: modPath, absolute: true }).then((files) =>
        Promise.all(files.map((f) => readJsonFile(f, quizSchema)))
    )
}

/**
 * Read a module's submissions
 */
async function readSubmissions(modPath: string) {
    return findFiles('.mod/submissions/*.json', { cwd: modPath, absolute: true }).then((files) =>
        Promise.all(files.map((f) => readJsonFile(f, submissionSchema)))
    )
}

/**
 * Ensure a module's directory structure exists
 */
export async function ensureModuleDirectories(modPath: string) {
    await Promise.all([
        ensureDir(path.join(modPath, '.mod/quizzes')),
        ensureDir(path.join(modPath, '.mod/submissions')),
    ])
}

/**
 * Get module stats (isolated implementation to avoid circular dependencies)
 */
async function getModuleStatsLocal(modPath: string) {
    // Simple default implementation to avoid circular dependencies
    return {
        moduleId: path.basename(modPath),
        currentBox: 1,
        lastReviewDate: new Date().toISOString(),
        nextDueDate: new Date().toISOString(),
    }
}

/**
 * Read all data for a module
 */
export async function readModuleData(modPath: string): Promise<Mod> {
    console.log('Reading module data from', modPath)

    // Get metadata first
    const metadata = await readModuleMetadata(modPath)

    const [quizzes, submissions, sources, stats] = await Promise.all([
        readQuizzes(modPath),
        readSubmissions(modPath),
        readSources(modPath),
        getModuleStatsLocal(modPath),
    ])

    return {
        metadata,
        stats,
        sources,
        quizzes,
        submissions,
    }
}

/**
 * Read a module by its library and module IDs
 */
export async function readModuleById(libraryId: string, moduleId: string): Promise<Mod> {
    const modulePath = await resolveModulePath(libraryId, moduleId)

    if (!modulePath) {
        throw new Error(`Module not found: ${moduleId}`)
    }

    return readModuleData(modulePath)
}

/**
 * Write all data for a module
 */
export async function writeModuleData(modPath: string, mod: Mod): Promise<void> {
    // Ensure module directories exist
    await ensureModuleDirectories(modPath)

    // Write metadata
    await writeModuleMetadata(modPath, mod.metadata)

    // Write quizzes
    if (mod.quizzes && mod.quizzes.length > 0) {
        await Promise.all(
            mod.quizzes.map((quiz) => {
                const quizPath = getQuizPath(modPath, quiz.id)
                return writeJsonFile(quizPath, quiz)
            })
        )
    }

    // Write submissions
    if (mod.submissions && mod.submissions.length > 0) {
        await Promise.all(
            mod.submissions.map((submission) => {
                const subPath = getSubmissionPath(
                    modPath,
                    submission.quizId,
                    submission.attemptNumber
                )
                return writeJsonFile(subPath, submission)
            })
        )
    }

    // Note: We don't write sources here as they are handled separately
    // and shouldn't be overwritten from this function

    console.log(`Successfully wrote module data to ${modPath}`)
}

/**
 * Remove a module
 */
export async function removeModule(modPath: string): Promise<void> {
    try {
        await removeDirectoryRecursively(modPath)
    } catch (error) {
        console.error(`Failed to remove module at ${modPath}:`, error)
        throw error
    }
}

/**
 * Write a source file to a module
 */
export async function writeModuleSource(modPath: string, sourceFile: SimpleFile): Promise<string> {
    const fileName = path.basename(sourceFile.path)
    const targetPath = path.join(modPath, fileName)
    await fs.copyFile(sourceFile.path, targetPath)
    return targetPath
}

/**
 * Delete a source file from a module
 */
export async function deleteModuleSource(sourcePath: string): Promise<void> {
    await fs.unlink(sourcePath)
}
