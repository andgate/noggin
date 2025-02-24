import { SimpleFile } from '@noggin/types/electron-types'
import { dialog, ipcMain } from 'electron'
import { promises as fs } from 'fs'
import * as path from 'path'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB in bytes

async function getFileInfo(filepath: string, loadData = false): Promise<SimpleFile> {
    const stats = await fs.stat(filepath)
    const baseInfo: SimpleFile = {
        path: filepath,
        name: path.basename(filepath),
        size: stats.size,
        modifiedAt: stats.mtimeMs,
        isDirectory: stats.isDirectory(),
    }

    if (loadData && !stats.isDirectory() && stats.size < MAX_FILE_SIZE) {
        try {
            const buffer = await fs.readFile(filepath)
            const base64Data = buffer.toString('base64')
            baseInfo.data = base64Data
        } catch (error) {
            console.error(`Failed to read file data for ${filepath}:`, error)
        }
    }

    return baseInfo
}

export function registerFilesystemIPC(): void {
    ipcMain.handle('path:join', (_event, ...paths: string[]) => {
        return path.join(...paths)
    })

    ipcMain.handle('filesystem:showDirectoryPicker', async (): Promise<SimpleFile[]> => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
        })
        if (result.canceled) return []

        return Promise.all(result.filePaths.map((filepath) => getFileInfo(filepath, true)))
    })

    ipcMain.handle(
        'filesystem:showFilePicker',
        async (
            _event: any,
            fileTypes?: { name: string; extensions: string[] }[]
        ): Promise<SimpleFile[]> => {
            const result = await dialog.showOpenDialog({
                properties: ['openFile', 'multiSelections'],
                filters: fileTypes || [{ name: 'All Files', extensions: ['*'] }],
            })
            if (result.canceled) return []

            return Promise.all(result.filePaths.map((filepath) => getFileInfo(filepath, true)))
        }
    )

    ipcMain.handle(
        'filesystem:getFileInfo',
        async (_event: any, filepath: string, loadData = false): Promise<SimpleFile> => {
            return getFileInfo(filepath, loadData)
        }
    )
}
