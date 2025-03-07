import { ipcMain } from 'electron'
import { getDueModules, updateReviewSchedule } from '../services/practice-feed-service'

export function registerPracticeFeedIPC(): void {
    ipcMain.handle('practiceFeed:getDueModules', async () => {
        return getDueModules()
    })

    ipcMain.handle(
        'practiceFeed:updateReviewSchedule',
        async (_, libraryId: string, moduleId: string, submission) => {
            return updateReviewSchedule(libraryId, moduleId, submission)
        }
    )
}
