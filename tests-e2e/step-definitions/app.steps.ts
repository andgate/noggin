import { Then, When } from '@wdio/cucumber-framework'
import { $, browser, expect } from '@wdio/globals'

When('I launch the application', async () => {
    // The application launches automatically with WebdriverIO
    await browser.waitUntil(async () => {
        return (await browser.getTitle()) !== ''
    })
})

Then('I should see the application title {string}', async (expectedTitle: string) => {
    const title = await browser.getTitle()
    expect(title).toBe(expectedTitle)
})

Then('I should see the main application shell', async () => {
    const appShell = await $('[data-testid="app-shell"]')
    await expect(appShell).toBeExisting()
})
