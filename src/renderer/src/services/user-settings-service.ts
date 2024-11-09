import { userSettings } from '@noggin/drizzle/schema'
import { db } from '@renderer/db'
import { UserSettings } from '@renderer/types/user-settings-types'
import { eq } from 'drizzle-orm'

async function createUserSettings(): Promise<void> {
    await db.insert(userSettings).values([{ id: 1, openaiApiKey: null }])
}

async function checkUserSettings(): Promise<boolean> {
    const result = await db.query.userSettings.findFirst({
        where: eq(userSettings.id, 1),
    })
    console.log('checkUserSettings result ==>', result)
    return result?.id !== undefined
}

async function ensureUserSettings(): Promise<void> {
    if (!(await checkUserSettings())) {
        await createUserSettings()
    }
}

export async function getUserSettings(): Promise<UserSettings> {
    await ensureUserSettings()
    const result = await db.query.userSettings.findFirst()
    return { openaiApiKey: result?.openaiApiKey ?? undefined }
}

export async function updateUserSettings(settings: UserSettings): Promise<void> {
    if (!(await checkUserSettings())) {
        await createUserSettings()
    }

    await db.update(userSettings).set({ openaiApiKey: settings.openaiApiKey || null })
}
