import { z } from 'zod'

export const userSettingsSchema = z.object({
    geminiApiKey: z.string().optional(),
    libraryPaths: z.array(z.string()),
})

export type UserSettings = z.infer<typeof userSettingsSchema>
