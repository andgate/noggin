import { z } from 'zod'

export const moduleStatsSchema = z.object({
  moduleId: z.string().uuid(),
  userId: z.string().uuid(),
  currentBox: z.number().int().min(1).max(5).default(1),
  nextReviewAt: z.string().datetime(),
})

export type ModuleStats = z.infer<typeof moduleStatsSchema>
