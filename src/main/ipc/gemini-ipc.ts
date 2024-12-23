import { ipcMain } from 'electron'
import { geminiService } from '../services/gemini-service'

export function registerGeminiIPC(): void {
    ipcMain.handle('gemini:generate-content', async (_event, options) => {
        try {
            return await geminiService.generateContent(options)
        } catch (error) {
            console.error('Gemini content generation error:', error)
            throw error
        }
    })

    ipcMain.handle('gemini:upload-files', async (_event, files) => {
        try {
            return await geminiService.uploadFiles(files)
        } catch (error) {
            console.error('Gemini file upload error:', error)
            throw error
        }
    })
}
