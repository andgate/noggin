import { z } from 'zod'

export const userSettingsSchema = z.object({
    openaiApiKey: z.string().optional(),
})

export type UserSettings = z.infer<typeof userSettingsSchema>
