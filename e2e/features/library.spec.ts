import { _electron as electron, ElectronApplication, expect, test } from '@playwright/test'
import { existsSync } from 'fs'
import { mkdir, rm, writeFile } from 'fs/promises'
import * as path from 'path'

let electronApp: ElectronApplication
const TEST_LIBRARIES_PATH = path.join(process.cwd(), 'test-libraries')

test.describe('Library Management', () => {
    test.beforeEach(async () => {
        // Create test directory
        await mkdir(TEST_LIBRARIES_PATH, { recursive: true })

        // Launch app with TEST_ENV configuration
        electronApp = await electron.launch({
            args: ['./out/main/index.js'],
            env: {
                ...process.env,
                TEST_ENV: 'true',
                TEST_LIBRARIES_PATH,
            },
        })
    })

    test.afterEach(async () => {
        await electronApp.close()
        // Clean up test directory
        await rm(TEST_LIBRARIES_PATH, { recursive: true, force: true })
    })

    test('should create a new library', async () => {
        const page = await electronApp.firstWindow()

        // Click create library button
        await page.getByRole('button', { name: 'Create New Library' }).click()

        // Fill library details
        await page.getByLabel('Library Name').fill('Test Library')
        await page.getByLabel('Description').fill('A test library')
        await page.getByRole('button', { name: 'Select Directory' }).click()
        await page.getByRole('button', { name: path.join(TEST_LIBRARIES_PATH, 'test-lib') }).click()

        // Submit form
        await page.getByRole('button', { name: 'Create Library' }).click()

        // Verify library was created
        await expect(page.getByText('Test Library')).toBeVisible()
        await expect(page.getByText('A test library')).toBeVisible()

        // Verify library structure in memfs
        expect(existsSync(path.join(TEST_LIBRARIES_PATH, 'test-lib/library.json'))).toBeTruthy()
    })

    test('should configure library paths', async () => {
        const page = await electronApp.firstWindow()

        // Create initial library
        await page.getByRole('button', { name: 'Create New Library' }).click()
        await page.getByLabel('Library Name').fill('Test Library')
        await page.getByRole('button', { name: 'Select Directory' }).click()
        await page.getByRole('button', { name: path.join(TEST_LIBRARIES_PATH, 'test-lib') }).click()
        await page.getByRole('button', { name: 'Create Library' }).click()

        // Open settings
        await page.getByRole('button', { name: 'Settings' }).click()

        // Add new library path
        await page.getByRole('button', { name: 'Add Library Path' }).click()
        await page.getByRole('button', { name: 'Select Directory' }).click()
        await page
            .getByRole('button', { name: path.join(TEST_LIBRARIES_PATH, 'another-lib') })
            .click()

        // Save settings
        await page.getByRole('button', { name: 'Save Settings' }).click()

        // Verify paths are saved
        await expect(page.getByText(path.join(TEST_LIBRARIES_PATH, 'test-lib'))).toBeVisible()
        await expect(page.getByText(path.join(TEST_LIBRARIES_PATH, 'another-lib'))).toBeVisible()
    })

    test('should rename an existing library', async () => {
        const page = await electronApp.firstWindow()

        // Create initial library
        await page.getByRole('button', { name: 'Create New Library' }).click()
        await page.getByLabel('Library Name').fill('Old Name')
        await page.getByRole('button', { name: 'Select Directory' }).click()
        await page.getByRole('button', { name: path.join(TEST_LIBRARIES_PATH, 'test-lib') }).click()
        await page.getByRole('button', { name: 'Create Library' }).click()

        // Open library context menu
        await page.getByText('Old Name').click({ button: 'right' })
        await page.getByRole('menuitem', { name: 'Rename' }).click()

        // Enter new name
        await page.getByLabel('New Name').fill('New Name')
        await page.getByRole('button', { name: 'Save' }).click()

        // Verify rename
        await expect(page.getByText('New Name')).toBeVisible()
        await expect(page.getByText('Old Name')).not.toBeVisible()
    })

    test('should delete a library', async () => {
        const page = await electronApp.firstWindow()

        // Create library to delete
        await page.getByRole('button', { name: 'Create New Library' }).click()
        await page.getByLabel('Library Name').fill('To Delete')
        await page.getByRole('button', { name: 'Select Directory' }).click()
        await page
            .getByRole('button', { name: path.join(TEST_LIBRARIES_PATH, 'delete-lib') })
            .click()
        await page.getByRole('button', { name: 'Create Library' }).click()

        // Delete library
        await page.getByText('To Delete').click({ button: 'right' })
        await page.getByRole('menuitem', { name: 'Delete' }).click()
        await page.getByRole('button', { name: 'Confirm' }).click()

        // Verify deletion
        await expect(page.getByText('To Delete')).not.toBeVisible()
        expect(existsSync(path.join(TEST_LIBRARIES_PATH, 'delete-lib'))).toBeFalsy()
    })

    test('should prevent duplicate library slugs', async () => {
        const page = await electronApp.firstWindow()

        // Create first library
        await page.getByRole('button', { name: 'Create New Library' }).click()
        await page.getByLabel('Library Name').fill('Test Library')
        await page.getByRole('button', { name: 'Select Directory' }).click()
        await page.getByRole('button', { name: path.join(TEST_LIBRARIES_PATH, 'lib1') }).click()
        await page.getByRole('button', { name: 'Create Library' }).click()

        // Try to create library with same name
        await page.getByRole('button', { name: 'Create New Library' }).click()
        await page.getByLabel('Library Name').fill('Test Library')
        await page.getByRole('button', { name: 'Select Directory' }).click()
        await page.getByRole('button', { name: path.join(TEST_LIBRARIES_PATH, 'lib2') }).click()
        await page.getByRole('button', { name: 'Create Library' }).click()

        // Verify error message
        await expect(page.getByText('A library with this name already exists')).toBeVisible()
    })

    test('should browse library contents', async () => {
        const page = await electronApp.firstWindow()

        // Create library with content
        await page.getByRole('button', { name: 'Create New Library' }).click()
        await page.getByLabel('Library Name').fill('Browse Test')
        await page.getByRole('button', { name: 'Select Directory' }).click()
        await page
            .getByRole('button', { name: path.join(TEST_LIBRARIES_PATH, 'browse-lib') })
            .click()
        await page.getByRole('button', { name: 'Create Library' }).click()

        // Add test content using fs/promises
        const browsePath = path.join(TEST_LIBRARIES_PATH, 'browse-lib')
        await writeFile(path.join(browsePath, 'test.txt'), 'Test content')
        await mkdir(path.join(browsePath, 'subfolder'))
        await writeFile(path.join(browsePath, 'subfolder', 'nested.txt'), 'Nested content')

        // Open library
        await page.getByText('Browse Test').click()

        // Verify content is visible
        await expect(page.getByText('test.txt')).toBeVisible()
        await expect(page.getByText('subfolder')).toBeVisible()

        // Navigate to subfolder
        await page.getByText('subfolder').click()
        await expect(page.getByText('nested.txt')).toBeVisible()
    })
})
