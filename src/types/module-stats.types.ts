import { z } from 'zod'

export const moduleStatsSchema = z.object({
  moduleId: z.string().uuid(),
  userId: z.string().uuid(), // Keep userId for potential future use, though RLS handles access
  currentBox: z.number().int().min(1).max(5).default(1),
  lastReviewedAt: z.string().datetime({ offset: true }).nullable().default(null),
  nextReviewAt: z.string().datetime({ offset: true }).nullable().default(null),
  quizAttempts: z.number().int().min(0).default(0),
  reviewCount: z.number().int().min(0).default(0),
})

export type ModuleStats = z.infer<typeof moduleStatsSchema>
