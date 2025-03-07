/**
 * A service for managing individual learning modules ("mods").
 *
 * Mods are stored in directories with a .mod extension containing:
 * - Content sources (PDFs, text files) in the root directory
 * - Tests with questions in the quizzes/ subdirectory
 * - Student submissions in the submissions/ subdirectory
 *
 * This file re-exports functions from more focused module services:
 * - module-core-service.ts: Basic module operations
 * - module-discovery-service.ts: Finding and listing modules
 * - module-quiz-service.ts: Quiz management
 * - module-submission-service.ts: Submission management
 * - module-stats-service.ts: Statistics and tracking
 */

// Re-export functions from module core service
export {
    deleteModuleSource,
    ensureModuleDirectories,
    readModuleById,
    readModuleData,
    readModuleMetadata,
    removeModule,
    writeModuleData,
    writeModuleMetadata,
    writeModuleSource,
} from './module-core-service'

// Re-export functions from module discovery service
export {
    getAllModulePaths,
    getModuleOverviews,
    resolveModulePath,
    scanLibraryModulePaths,
} from './module-discovery-service'

// Re-export functions from module quiz service
export {
    deleteModuleQuiz,
    getLatestModuleQuiz,
    readModuleQuiz,
    saveModuleQuiz,
} from './module-quiz-service'

// Re-export functions from module submission service
export {
    getModuleSubmissions,
    getQuizAttemptCount,
    getQuizSubmissions,
    readModuleSubmission,
    saveModuleSubmission,
    updateModuleStatsForSubmission,
    writeSubmissions,
} from './module-submission-service'

// Re-export functions from module stats service
export {
    getAllModuleStats,
    getDueModules,
    getModuleStats,
    saveModuleStats,
} from './module-stats-service'
