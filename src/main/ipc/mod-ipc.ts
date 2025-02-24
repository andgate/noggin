import { SimpleFile } from '@noggin/types/electron-types'
import { Mod, ModuleMetadata, ModuleStats } from '@noggin/types/module-types'
import { Quiz, Submission } from '@noggin/types/quiz-types'
import { ipcMain } from 'electron'
import {
    deleteModuleQuiz,
    deleteModuleSource,
    getAllModuleStats,
    getDueModules,
    getLatestModuleQuiz,
    getModuleOverviews,
    getModuleStats,
    getModuleSubmissions,
    getQuizAttemptCount,
    getQuizSubmissions,
    readModuleBySlug,
    readModuleData,
    readModuleMetadata,
    readModuleQuiz,
    readModuleSubmission,
    removeModule,
    saveModuleQuiz,
    saveModuleStats,
    saveModuleSubmission,
    writeModuleData,
    writeModuleMetadata,
    writeModuleSource,
} from '../services/mod-service'

export function registerModuleIPC(): void {
    ipcMain.handle('modules:readModuleData', async (_, modulePath: string) => {
        return readModuleData(modulePath)
    })

    ipcMain.handle('modules:writeModuleData', async (_, modulePath: string, mod: Mod) => {
        await writeModuleData(modulePath, mod)
    })

    ipcMain.handle('modules:removeModule', async (_, modulePath: string) => {
        await removeModule(modulePath)
    })

    ipcMain.handle(
        'modules:writeModuleSource',
        async (_, modPath: string, sourceFile: SimpleFile) => {
            return writeModuleSource(modPath, sourceFile)
        }
    )

    ipcMain.handle('modules:deleteModuleSource', async (_, sourcePath: string) => {
        await deleteModuleSource(sourcePath)
    })

    ipcMain.handle('modules:readModuleBySlug', async (_, libraryId: string, moduleSlug: string) => {
        return readModuleBySlug(libraryId, moduleSlug)
    })

    ipcMain.handle(
        'modules:saveModuleQuiz',
        async (_, libraryId: string, moduleSlug: string, quiz: Quiz) => {
            await saveModuleQuiz(libraryId, moduleSlug, quiz)
        }
    )

    ipcMain.handle(
        'modules:deleteModuleQuiz',
        async (_, libraryId: string, moduleSlug: string, quizId: string) => {
            await deleteModuleQuiz(libraryId, moduleSlug, quizId)
        }
    )

    ipcMain.handle(
        'modules:readModuleQuiz',
        async (_, libraryId: string, moduleSlug: string, quizId: string) => {
            return readModuleQuiz(libraryId, moduleSlug, quizId)
        }
    )

    ipcMain.handle(
        'modules:saveModuleSubmission',
        async (_, libraryId: string, moduleSlug: string, submission: Submission) => {
            await saveModuleSubmission(libraryId, moduleSlug, submission)
        }
    )

    ipcMain.handle(
        'modules:readModuleSubmission',
        async (_, libraryId: string, moduleSlug: string, quizId: string, attempt: number) => {
            return readModuleSubmission(libraryId, moduleSlug, quizId, attempt)
        }
    )

    ipcMain.handle(
        'modules:getQuizAttemptCount',
        async (_, libraryId: string, moduleSlug: string, quizId: string) => {
            return getQuizAttemptCount(libraryId, moduleSlug, quizId)
        }
    )

    ipcMain.handle(
        'modules:getLatestModuleQuiz',
        async (_, libraryId: string, moduleSlug: string) => {
            return getLatestModuleQuiz(libraryId, moduleSlug)
        }
    )

    ipcMain.handle(
        'modules:getModuleSubmissions',
        async (_, libraryId: string, moduleSlug: string) => {
            return getModuleSubmissions(libraryId, moduleSlug)
        }
    )

    ipcMain.handle(
        'modules:getQuizSubmissions',
        async (_, libraryId: string, moduleSlug: string, quizId: string) => {
            return getQuizSubmissions(libraryId, moduleSlug, quizId)
        }
    )

    ipcMain.handle('modules:getModuleStats', async (_, libraryId: string, moduleSlug: string) => {
        return getModuleStats(libraryId, moduleSlug)
    })

    ipcMain.handle(
        'modules:saveModuleStats',
        async (_, libraryId: string, moduleSlug: string, stats: ModuleStats) => {
            await saveModuleStats(libraryId, moduleSlug, stats)
        }
    )

    ipcMain.handle('modules:getAllModuleStats', async () => {
        return getAllModuleStats()
    })

    ipcMain.handle('modules:getDueModules', async () => {
        return getDueModules()
    })

    ipcMain.handle('modules:getModuleOverviews', async (_, libraryId: string) => {
        return getModuleOverviews(libraryId)
    })

    ipcMain.handle('modules:readModuleMetadata', async (_, modPath: string) => {
        return readModuleMetadata(modPath)
    })

    ipcMain.handle(
        'modules:writeModuleMetadata',
        async (_, modPath: string, metadata: ModuleMetadata) => {
            await writeModuleMetadata(modPath, metadata)
        }
    )
}
