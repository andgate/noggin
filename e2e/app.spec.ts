import { ElectronApplication, _electron as electron, expect, test } from '@playwright/test'

let electronApp: ElectronApplication

test.describe('Application Launch', () => {
    test.beforeEach(async () => {
        electronApp = await electron.launch({ args: ['./out/main/index.js'] })
    })

    test.afterEach(async () => {
        await electronApp.close()
    })

    test('should launch successfully', async () => {
        expect(electronApp).toBeDefined()
    })

    test('should display correct window title', async () => {
        const page = await electronApp.firstWindow()
        await expect(page).toHaveTitle(/Noggin/)
    })

    test('should show module explorer by default', async () => {
        const page = await electronApp.firstWindow()
        await expect(page.getByText('Module Explorer')).toBeVisible()
    })
})
