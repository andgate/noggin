import { test as base } from '@playwright/test'
import { resolve } from 'path'
import { ElectronApplication, Page, _electron as electron } from 'playwright'

// Extend basic test fixture with our app-specific context
export type TestFixtures = {
    electronApp: ElectronApplication
    appWindow: Page
}

// Declare test with our custom fixtures
export const test = base.extend<TestFixtures>({
    // Set up electron app fixture
    electronApp: async ({}, use) => {
        const app = await electron.launch({
            args: [resolve('.')],
        })
        await use(app)
        await app.close()
    },

    // Set up main window fixture
    appWindow: async ({ electronApp }, use) => {
        const window = await electronApp.firstWindow()
        await window.waitForLoadState('domcontentloaded')
        await use(window)
    },
})

export { expect } from '@playwright/test'
