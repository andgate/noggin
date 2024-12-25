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

    ipcMain.handle('generate:generateQuiz', async (_event, options) => {
        try {
            return await generateService.generateQuiz(options)
        } catch (error) {
            console.error('Quiz generation error:', error)
            throw error
        }
    })
}
