import { ipcMain } from 'electron'
import { generateGeminiContent } from '../services/gemini-service'

export function registerGeminiIPC(): void {
    ipcMain.handle('gemini:generate-content', async (_event, { prompt, schema }) => {
        try {
            return await generateGeminiContent({ prompt, schema })
        } catch (error) {
            console.error('Gemini content generation error:', error)
            throw error
        }
    })
}
