import { ipcMain } from 'electron'
import { generateService } from '../services/generate-service'

export function registerGenerateIPC(): void {
    ipcMain.handle('generate:analyzeContent', async (_event, files) => {
        try {
            return await generateService.analyzeContent(files)
        } catch (error) {
            console.error('Content analysis error:', error)
            throw error
        }
    })
}
