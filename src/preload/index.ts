import { electronAPI } from '@electron-toolkit/preload'
import type { NogginElectronAPI, SimpleFile } from '@noggin/types/electron-types'
import { Mod } from '@noggin/types/module-types'
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
        getRegisteredPaths: () => ipcRenderer.invoke('modules:getRegisteredPaths'),
        registerModulePath: (modulePath: string) =>
            ipcRenderer.invoke('modules:registerModulePath', modulePath),
        unregisterModulePath: (modulePath: string) =>
            ipcRenderer.invoke('modules:unregisterModulePath', modulePath),
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
        readModuleBySlug: (moduleSlug: string) =>
            ipcRenderer.invoke('modules:readModuleBySlug', moduleSlug),
        saveModuleQuiz: (moduleSlug: string, quiz: Quiz) =>
            ipcRenderer.invoke('modules:saveModuleQuiz', moduleSlug, quiz),
        deleteModuleQuiz: (moduleSlug: string, quizId: string) =>
            ipcRenderer.invoke('modules:deleteModuleQuiz', moduleSlug, quizId),
        readModuleQuiz: (moduleSlug: string, quizId: string) =>
            ipcRenderer.invoke('modules:readModuleQuiz', moduleSlug, quizId),
        readModuleSubmission: (moduleSlug: string, quizId: string, attempt: number) =>
            ipcRenderer.invoke('modules:readModuleSubmission', moduleSlug, quizId, attempt),
        saveModuleSubmission: (moduleSlug: string, submission: Submission) =>
            ipcRenderer.invoke('modules:saveModuleSubmission', moduleSlug, submission),
        getQuizAttemptCount: (moduleSlug: string, quizId: string) =>
            ipcRenderer.invoke('modules:getQuizAttemptCount', moduleSlug, quizId),
        getLatestModuleQuiz: (moduleSlug: string) =>
            ipcRenderer.invoke('modules:getLatestModuleQuiz', moduleSlug),
        getModuleSubmissions: (moduleSlug: string) =>
            ipcRenderer.invoke('modules:getModuleSubmissions', moduleSlug),
        getQuizSubmissions: (moduleSlug: string, quizId: string) =>
            ipcRenderer.invoke('modules:getQuizSubmissions', moduleSlug, quizId),
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
