import { ipcMain } from 'electron'
import { addModkit, deleteModkit, listModkits, loadModkit } from '../services/modkit-service'

export function registerModkitIPC(): void {
    // List all modkits
    ipcMain.handle('modkit:list', async () => {
        return await listModkits()
    })

    // Load complete modkit data
    ipcMain.handle('modkit:load', async (_event, modkitPath: string) => {
        return await loadModkit(modkitPath)
    })

    // Add new modkit
    ipcMain.handle('modkit:add', async (_event, modkitPath: string) => {
        return await addModkit(modkitPath)
    })

    // Delete existing modkit
    ipcMain.handle('modkit:delete', async (_event, modkitPath: string) => {
        return await deleteModkit(modkitPath)
    })
}
