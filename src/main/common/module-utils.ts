/**
 * Internal utilities shared between module services
 * Used to break circular dependencies between service files
 */

import path from 'path'
import { findFiles } from './fs-utils'

/**
 * Find all module paths within a specific library
 */
export async function scanLibraryModulePaths(libraryPath: string): Promise<string[]> {
    // Find all .mod directories under the given library path
    return findFiles('*/.mod', {
        cwd: libraryPath,
        absolute: true,
    }).then((paths) => paths.map((p) => path.dirname(p)))
}

/**
 * Get module dir path from module ID and library path
 * This is used to avoid circular dependencies with resolveModulePath
 */
export function getModuleDirPath(libraryPath: string, moduleSlug: string): string {
    return path.join(libraryPath, moduleSlug)
}

/**
 * Get module metadata path
 */
export function getModuleMetadataPath(modulePath: string): string {
    return path.join(modulePath, '.mod', 'meta.json')
}

/**
 * Get module stats path
 */
export function getModuleStatsPath(modulePath: string): string {
    return path.join(modulePath, '.mod', 'stats.json')
}

/**
 * Get path to a quiz file
 */
export function getQuizPath(modulePath: string, quizId: string): string {
    return path.join(modulePath, '.mod/quizzes', `${quizId}.json`)
}

/**
 * Get path to a submission file
 */
export function getSubmissionPath(
    modulePath: string,
    quizId: string,
    attemptNumber: number
): string {
    return path.join(modulePath, '.mod/submissions', `${quizId}-${attemptNumber}.json`)
}

/**
 * Create default module stats
 */
export async function createModuleStats(modulePath: string) {
    const now = new Date()
    // Set initial nextReviewDate to now, making it immediately available
    return {
        moduleId: path.basename(modulePath),
        currentBox: 1,
        nextReviewDate: now.toISOString(),
    }
}
