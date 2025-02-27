import { ipcMain } from 'electron'
import { generateService } from '../services/generate-service'

export function registerGenerateIPC(): void {
    ipcMain.handle('generate:analyzeContent', async (_event, files) => {
        console.log(
            '📟 IPC: generate:analyzeContent received with files:',
            files.map((f) => f.path)
        )
        try {
            console.log('📟 Calling generateService.analyzeContent')
            const result = await generateService.analyzeContent(files)
            console.log('📟 generateService.analyzeContent succeeded with result:', result)
            return result
        } catch (error) {
            console.error('📟 Content analysis error:', error)
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

    ipcMain.handle('generate:gradeSubmission', async (_event, submission) => {
        try {
            return await generateService.gradeSubmission(submission)
        } catch (error) {
            console.error('Submission grading error:', error)
            throw error
        }
    })
}
