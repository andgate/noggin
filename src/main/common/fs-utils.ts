import fs from 'fs/promises'
import { glob } from 'glob'
import path from 'path'
import { z } from 'zod'

/**
 * Helper to ensure a directory exists
 */
export async function ensureDir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true })
}

/**
 * Helper to read and parse JSON files
 */
export async function readJsonFile<T>(filePath: string, schema: z.ZodSchema<T>): Promise<T> {
    const rawData = await fs.readFile(filePath, 'utf-8')
    return schema.parse(JSON.parse(rawData))
}

/**
 * Helper to write JSON files
 */
export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
    await ensureDir(path.dirname(filePath))
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

/**
 * Safely remove a directory and all its contents
 */
export async function removeDirectoryRecursively(dirPath: string): Promise<void> {
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

/**
 * Find files using glob patterns with standardized options
 */
export async function findFiles(
    pattern: string,
    options: { cwd: string; absolute: boolean }
): Promise<string[]> {
    return glob(pattern, options)
}
