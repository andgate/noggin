import { z } from 'zod'

export const userSettingsSchema = z.object({
  geminiApiKey: z.string().optional(),
})

export type UserSettings = z.infer<typeof userSettingsSchema>
