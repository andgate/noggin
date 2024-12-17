import { electronAPI } from '@electron-toolkit/preload'
import type { NogginElectronAPI } from '@noggin/types/electron-types'
import { Mod } from '@noggin/types/module-types'
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
    },
    openai: {
        chat: (options) => ipcRenderer.invoke('openai:chat', options),
    },
    dialog: {
        showDirectoryPicker: () => ipcRenderer.invoke('dialog:showDirectoryPicker'),
        handleFolderDrop: (paths: string[]) => ipcRenderer.invoke('dialog:handleFolderDrop', paths),
    },
    gemini: {
        generateContent: (options: { apiKey?: string; prompt: string }) =>
            ipcRenderer.invoke('gemini:generate-content', options),
        generateWithImage: (options: {
            apiKey?: string
            prompt: string
            imageData: string
            mimeType: string
        }) => ipcRenderer.invoke('gemini:generate-with-image', options),
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
