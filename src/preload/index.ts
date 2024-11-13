import { electronAPI } from '@electron-toolkit/preload'
import type { NogginElectronAPI } from '@noggin/types/electron-types'
import { NogginStoreSchema } from '@noggin/types/store-types'
import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api: NogginElectronAPI = {
    db: {
        execute: (sql: string, params: any[], method: 'run' | 'all' | 'values' | 'get') =>
            ipcRenderer.invoke('db:execute', sql, params, method),
    },
    store: {
        get: (key: keyof NogginStoreSchema) => ipcRenderer.invoke('store:get', key),
        set: (key: keyof NogginStoreSchema, value: any) =>
            ipcRenderer.invoke('store:set', key as string, value),
        delete: (key: keyof NogginStoreSchema) => ipcRenderer.invoke('store:delete', key as string),
        clear: () => ipcRenderer.invoke('store:clear'),
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
