import { SimpleFile } from '@noggin/types/electron-types'
import { Mod, ModuleMetadata, ModuleStats } from '@noggin/types/module-types'
import { Quiz, Submission } from '@noggin/types/quiz-types'
import { ipcMain } from 'electron'
import {
    deleteModuleQuiz,
    deleteModuleSource,
    getAllModuleStats,
    getLatestModuleQuiz,
    getModuleOverviews,
    getModuleStats,
    getModuleSubmissions,
    getQuizAttemptCount,
    getQuizSubmissions,
    readModuleById,
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

    ipcMain.handle('modules:readModuleById', async (_, libraryId: string, moduleId: string) => {
        return readModuleById(libraryId, moduleId)
    })

    ipcMain.handle(
        'modules:saveModuleQuiz',
        async (_, libraryId: string, moduleId: string, quiz: Quiz) => {
            await saveModuleQuiz(libraryId, moduleId, quiz)
        }
    )

    ipcMain.handle(
        'modules:deleteModuleQuiz',
        async (_, libraryId: string, moduleId: string, quizId: string) => {
            await deleteModuleQuiz(libraryId, moduleId, quizId)
        }
    )

    ipcMain.handle(
        'modules:readModuleQuiz',
        async (_, libraryId: string, moduleId: string, quizId: string) => {
            return readModuleQuiz(libraryId, moduleId, quizId)
        }
    )

    ipcMain.handle(
        'modules:saveModuleSubmission',
        async (_, libraryId: string, moduleId: string, submission: Submission) => {
            await saveModuleSubmission(libraryId, moduleId, submission)
        }
    )

    ipcMain.handle(
        'modules:readModuleSubmission',
        async (_, libraryId: string, moduleId: string, quizId: string, attempt: number) => {
            return readModuleSubmission(libraryId, moduleId, quizId, attempt)
        }
    )

    ipcMain.handle(
        'modules:getQuizAttemptCount',
        async (_, libraryId: string, moduleId: string, quizId: string) => {
            return getQuizAttemptCount(libraryId, moduleId, quizId)
        }
    )

    ipcMain.handle(
        'modules:getLatestModuleQuiz',
        async (_, libraryId: string, moduleId: string) => {
            return getLatestModuleQuiz(libraryId, moduleId)
        }
    )

    ipcMain.handle(
        'modules:getModuleSubmissions',
        async (_, libraryId: string, moduleId: string) => {
            return getModuleSubmissions(libraryId, moduleId)
        }
    )

    ipcMain.handle(
        'modules:getQuizSubmissions',
        async (_, libraryId: string, moduleId: string, quizId: string) => {
            return getQuizSubmissions(libraryId, moduleId, quizId)
        }
    )

    ipcMain.handle('modules:getModuleStats', async (_, libraryId: string, moduleId: string) => {
        return getModuleStats(libraryId, moduleId)
    })

    ipcMain.handle(
        'modules:saveModuleStats',
        async (_, libraryId: string, moduleId: string, stats: ModuleStats) => {
            await saveModuleStats(libraryId, moduleId, stats)
        }
    )

    ipcMain.handle('modules:getAllModuleStats', async () => {
        return getAllModuleStats()
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
