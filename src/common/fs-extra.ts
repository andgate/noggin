import * as fs from 'fs/promises'

/**
 * Ensures a directory exists, creating it and any necessary parent directories
 * @param dirPath - The directory path to ensure exists
 * @throws {Error} If directory creation fails for reasons other than 'already exists'
 */
export async function ensureDir(dirPath: string): Promise<void> {
    try {
        await fs.mkdir(dirPath, { recursive: true })
    } catch (error) {
        // If directory already exists, that's fine
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
            throw error
        }
    }
}
