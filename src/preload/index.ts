import { electronAPI } from '@electron-toolkit/preload'
import type { NogginElectronAPI, SimpleFile } from '@noggin/types/electron-types'
import { LibraryMetadata } from '@noggin/types/library-types'
import { Mod, ModuleMetadata, ModuleStats } from '@noggin/types/module-types'
import { Quiz, Submission } from '@noggin/types/quiz-types'
import { NogginStoreSchema } from '@noggin/types/store-types'
import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api: NogginElectronAPI = {
    store: {
        get: (key: keyof NogginStoreSchema) => ipcRenderer.invoke('store:get', key),
        set: (key: keyof NogginStoreSchema, value: any) =>
            ipcRenderer.invoke('store:set', key as string, value),
        delete: (key: keyof NogginStoreSchema) => ipcRenderer.invoke('store:delete', key as string),
        clear: () => ipcRenderer.invoke('store:clear'),
    },
    modules: {
        readModuleData: (modulePath: string) =>
            ipcRenderer.invoke('modules:readModuleData', modulePath),
        writeModuleData: (modulePath: string, mod: Mod) =>
            ipcRenderer.invoke('modules:writeModuleData', modulePath, mod),
        removeModule: (modulePath: string) =>
            ipcRenderer.invoke('modules:removeModule', modulePath),
        writeModuleSource: (modulePath: string, sourceFile: SimpleFile) =>
            ipcRenderer.invoke('modules:writeModuleSource', modulePath, sourceFile),
        deleteModuleSource: (sourcePath: string) =>
            ipcRenderer.invoke('modules:deleteModuleSource', sourcePath),
        readModuleBySlug: (libraryId: string, moduleSlug: string) =>
            ipcRenderer.invoke('modules:readModuleBySlug', libraryId, moduleSlug),
        saveModuleQuiz: (libraryId: string, moduleSlug: string, quiz: Quiz) =>
            ipcRenderer.invoke('modules:saveModuleQuiz', libraryId, moduleSlug, quiz),
        deleteModuleQuiz: (libraryId: string, moduleSlug: string, quizId: string) =>
            ipcRenderer.invoke('modules:deleteModuleQuiz', libraryId, moduleSlug, quizId),
        readModuleQuiz: (libraryId: string, moduleSlug: string, quizId: string) =>
            ipcRenderer.invoke('modules:readModuleQuiz', libraryId, moduleSlug, quizId),
        readModuleSubmission: (
            libraryId: string,
            moduleSlug: string,
            quizId: string,
            attempt: number
        ) =>
            ipcRenderer.invoke(
                'modules:readModuleSubmission',
                libraryId,
                moduleSlug,
                quizId,
                attempt
            ),
        saveModuleSubmission: (libraryId: string, moduleSlug: string, submission: Submission) =>
            ipcRenderer.invoke('modules:saveModuleSubmission', libraryId, moduleSlug, submission),
        getQuizAttemptCount: (libraryId: string, moduleSlug: string, quizId: string) =>
            ipcRenderer.invoke('modules:getQuizAttemptCount', libraryId, moduleSlug, quizId),
        getLatestModuleQuiz: (libraryId: string, moduleSlug: string) =>
            ipcRenderer.invoke('modules:getLatestModuleQuiz', libraryId, moduleSlug),
        getModuleSubmissions: (libraryId: string, moduleSlug: string) =>
            ipcRenderer.invoke('modules:getModuleSubmissions', libraryId, moduleSlug),
        getQuizSubmissions: (libraryId: string, moduleSlug: string, quizId: string) =>
            ipcRenderer.invoke('modules:getQuizSubmissions', libraryId, moduleSlug, quizId),
        getModuleStats: (libraryId: string, moduleSlug: string) =>
            ipcRenderer.invoke('modules:getModuleStats', libraryId, moduleSlug),
        saveModuleStats: (libraryId: string, moduleSlug: string, stats: ModuleStats) =>
            ipcRenderer.invoke('modules:saveModuleStats', libraryId, moduleSlug, stats),
        getAllModuleStats: () => ipcRenderer.invoke('modules:getAllModuleStats'),
        getDueModules: () => ipcRenderer.invoke('modules:getDueModules'),
        getModuleOverviews: (libraryId: string) =>
            ipcRenderer.invoke('modules:getModuleOverviews', libraryId),
        readModuleMetadata: (modPath: string) =>
            ipcRenderer.invoke('modules:readModuleMetadata', modPath),
        writeModuleMetadata: (modPath: string, metadata: ModuleMetadata) =>
            ipcRenderer.invoke('modules:writeModuleMetadata', modPath, metadata),
    },
    openai: {
        chat: (options) => ipcRenderer.invoke('openai:chat', options),
    },
    filesystem: {
        showDirectoryPicker: () => ipcRenderer.invoke('filesystem:showDirectoryPicker'),
        showFilePicker: () => ipcRenderer.invoke('filesystem:showFilePicker'),
        getFileInfo: (filepath: string, loadData?: boolean) =>
            ipcRenderer.invoke('filesystem:getFileInfo', filepath, loadData),
    },
    gemini: {
        generateContent: (options) => ipcRenderer.invoke('gemini:generate-content', options),
        uploadFiles: (files) => ipcRenderer.invoke('gemini:upload-files', files),
    },
    generate: {
        analyzeContent: (files) => ipcRenderer.invoke('generate:analyzeContent', files),
        generateQuiz: (options): Promise<Quiz> =>
            ipcRenderer.invoke('generate:generateQuiz', options),
        gradeSubmission: (submission) => ipcRenderer.invoke('generate:gradeSubmission', submission),
    },
    moduleExplorer: {
        showModuleContextMenu: (libraryId: string, moduleId: string) =>
            ipcRenderer.invoke('moduleExplorer:showModuleContextMenu', libraryId, moduleId),
        showLibraryContextMenu: (librarySlug: string) =>
            ipcRenderer.invoke('moduleExplorer:showLibraryContextMenu', librarySlug),
    },
    library: {
        getRegisteredLibraries: () => ipcRenderer.invoke('library:getRegisteredLibraries'),
        registerLibrary: (libraryPath: string) =>
            ipcRenderer.invoke('library:registerLibrary', libraryPath),
        unregisterLibrary: (libraryPath: string) =>
            ipcRenderer.invoke('library:unregisterLibrary', libraryPath),
        createLibrary: (libraryPath: string, metadata: LibraryMetadata) =>
            ipcRenderer.invoke('library:createLibrary', libraryPath, metadata),
        readLibrary: (libraryPath: string) =>
            ipcRenderer.invoke('library:readLibrary', libraryPath),
        readLibraryMetadata: (libraryPath: string) =>
            ipcRenderer.invoke('library:readLibraryMetadata', libraryPath),
        getAllLibraries: () => ipcRenderer.invoke('library:getAllLibraries'),
    },
    path: {
        join: (...args: string[]) => ipcRenderer.invoke('path:join', ...args),
    },
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api = api
}
