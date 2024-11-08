import { electronAPI } from '@electron-toolkit/preload'
import type { NogginElectronAPI } from '@noggin/types/electron-types'
import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api: NogginElectronAPI = {
    db: {
        execute: (sql: string, params: any[], method: 'run' | 'all' | 'values' | 'get') =>
            ipcRenderer.invoke('db:execute', sql, params, method),
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
