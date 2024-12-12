/**
 * A service for managing individual learning modules ("mods").
 *
 * Mods are stored in directories with a .mod extension containing:
 * - Content sources (PDFs, text files) in the root directory
 * - Tests with questions in the quizzes/ subdirectory
 * - Student submissions in the submissions/ subdirectory
 *
 * The service provides functions to:
 * - List all mods that the system has loadedlist)
 * - Load mod data from a directory (load)
 * - Save mod data to a directory (save)
 * - Delete a mod and its contents (delete_)
 */
import { Mod } from '@noggin/types/module-types'
import { quizSchema, submissionSchema } from '@noggin/types/quiz-types'
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
    if (!paths.includes(modPath)) {
        store.set('modulePaths', [...paths, modPath])
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
}

// File system operations
export async function removeModule(modPath: string): Promise<void> {
    await fs.rm(modPath, { recursive: true, force: true })
    await unregisterModulePath(modPath)
}

// New helper functions for better separation
async function readQuizzes(modPath: string) {
    return glob('quizzes/*.json', { cwd: modPath, absolute: true }).then((files) =>
        Promise.all(files.map((f) => readJsonFile(f, quizSchema)))
    )
}

async function readSubmissions(modPath: string) {
    return glob('submissions/*.json', { cwd: modPath, absolute: true }).then((files) =>
        Promise.all(files.map((f) => readJsonFile(f, submissionSchema)))
    )
}

async function readSources(modPath: string) {
    return glob('*.{txt,pdf}', { cwd: modPath, absolute: true })
}

async function ensureModuleDirectories(modPath: string) {
    await Promise.all([
        ensureDir(path.join(modPath, 'quizzes')),
        ensureDir(path.join(modPath, 'submissions')),
    ])
}

async function writeSubmissions(modPath: string, submissions: Mod['submissions']) {
    await Promise.all(
        submissions.map(async (sub) => {
            const subPath = path.join(modPath, 'submissions', `${sub.id}.json`)
            await fs.writeFile(subPath, JSON.stringify(sub, null, 2))
        })
    )
}
