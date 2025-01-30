/// <reference path="../../src/renderer/index.d.ts" />

import { Page } from '@playwright/test'
import { tmpdir } from 'os'
import { join } from 'path'

// Selectors used across tests
export const selectors = {
    // Navigation
    settingsButton: 'button[aria-label="Settings"]',

    // Common buttons
    createButton: 'button:has-text("Create")',
    confirmButton: 'button:has-text("Confirm")',
    cancelButton: 'button:has-text("Cancel")',

    // Library management
    createLibraryButton: 'button:has-text("Create Library")',
    libraryNameInput: 'input[aria-label="Library Name"]',
    libraryDescInput: 'textarea[aria-label="Description"]',
    libraryPathText: 'text=Selected:',

    // Notifications
    successNotification: '[role="alert"]:has-text("success")',
    errorNotification: '[role="alert"]:has-text("error")',
}

// Helper functions
export const testHelpers = {
    // Generate unique test library path
    getTestLibraryPath: () => join(tmpdir(), `noggin-test-${Date.now()}`),

    // Common actions
    async openSettings(page: Page) {
        await page.click(selectors.settingsButton)
    },

    async createLibrary(page: Page, { name, description }: { name: string; description: string }) {
        await page.click(selectors.createLibraryButton)
        await page.fill(selectors.libraryNameInput, name)
        await page.fill(selectors.libraryDescInput, description)

        // Mock directory picker response
        const testPath = testHelpers.getTestLibraryPath()
        await page.evaluate((path) => {
            window.electron.ipcRenderer.invoke('showDirectoryPicker').then(() => path)
        }, testPath)

        await page.click(selectors.createButton)
        return testPath
    },

    // Wait for notifications
    async waitForSuccess(page: Page) {
        await page.waitForSelector(selectors.successNotification)
    },

    async waitForError(page: Page) {
        await page.waitForSelector(selectors.errorNotification)
    },
}
