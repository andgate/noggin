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
    getRegisteredPaths,
    readModuleBySlug,
    readModuleData,
    readModuleMetadata,
    readModuleQuiz,
    readModuleSubmission,
    registerModulePath,
    removeModule,
    saveModuleQuiz,
    saveModuleStats,
    saveModuleSubmission,
    unregisterModulePath,
    writeModuleData,
    writeModuleMetadata,
    writeModuleSource,
} from '../services/mod-service'

export function registerModuleIPC(): void {
    ipcMain.handle('modules:getRegisteredPaths', async () => {
        return getRegisteredPaths()
    })

    ipcMain.handle('modules:registerModulePath', async (_, modulePath: string) => {
        await registerModulePath(modulePath)
    })

    ipcMain.handle('modules:unregisterModulePath', async (_, modulePath: string) => {
        await unregisterModulePath(modulePath)
    })

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

    ipcMain.handle('modules:readModuleBySlug', async (_, moduleSlug: string) => {
        return readModuleBySlug(moduleSlug)
    })

    ipcMain.handle('modules:saveModuleQuiz', async (_, moduleSlug: string, quiz: Quiz) => {
        await saveModuleQuiz(moduleSlug, quiz)
    })

    ipcMain.handle('modules:deleteModuleQuiz', async (_, moduleSlug: string, quizId: string) => {
        await deleteModuleQuiz(moduleSlug, quizId)
    })

    ipcMain.handle('modules:readModuleQuiz', async (_, moduleSlug: string, quizId: string) => {
        return readModuleQuiz(moduleSlug, quizId)
    })

    ipcMain.handle(
        'modules:saveModuleSubmission',
        async (_, moduleSlug: string, submission: Submission) => {
            await saveModuleSubmission(moduleSlug, submission)
        }
    )

    ipcMain.handle(
        'modules:readModuleSubmission',
        async (_, moduleSlug: string, quizId: string, attempt: number) => {
            return readModuleSubmission(moduleSlug, quizId, attempt)
        }
    )

    ipcMain.handle('modules:getQuizAttemptCount', async (_, moduleSlug: string, quizId: string) => {
        return getQuizAttemptCount(moduleSlug, quizId)
    })

    ipcMain.handle('modules:getLatestModuleQuiz', async (_, moduleSlug: string) => {
        return getLatestModuleQuiz(moduleSlug)
    })

    ipcMain.handle('modules:getModuleSubmissions', async (_, moduleSlug: string) => {
        return getModuleSubmissions(moduleSlug)
    })

    ipcMain.handle('modules:getQuizSubmissions', async (_, moduleSlug: string, quizId: string) => {
        return getQuizSubmissions(moduleSlug, quizId)
    })

    ipcMain.handle('modules:getModuleStats', async (_, moduleSlug: string) => {
        return getModuleStats(moduleSlug)
    })

    ipcMain.handle('modules:saveModuleStats', async (_, moduleSlug: string, stats: ModuleStats) => {
        await saveModuleStats(moduleSlug, stats)
    })

    ipcMain.handle('modules:getAllModuleStats', async () => {
        return getAllModuleStats()
    })

    ipcMain.handle('modules:getDueModules', async () => {
        return getDueModules()
    })

    ipcMain.handle('modules:getModuleOverviews', () => getModuleOverviews())

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
