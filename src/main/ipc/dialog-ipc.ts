import { dialog, ipcMain } from 'electron'
import { existsSync } from 'fs'

export function registerDialogIPC(): void {
    ipcMain.handle('dialog:showDirectoryPicker', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
        })
        return result.canceled ? undefined : result.filePaths[0]
    })

    ipcMain.handle('handle-folder-drop', async (_event, { filePaths }) => {
        const validPaths = filePaths.filter((path) => existsSync(path))
        return validPaths
    })
}
