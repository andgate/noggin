import { z } from 'zod'
import { moduleSourceSchema } from './module-source.types'
import { moduleStatsSchema } from './module-stats.types'
import { quizSchema } from './quiz.types'

// Corresponds to DB modules table, but nests related data
export const moduleSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(), // Keep for potential future use
  title: z.string(),
  overview: z.string(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }).nullable(),
  // Nested data structures
  stats: moduleStatsSchema,
  sources: z.array(moduleSourceSchema),
  quizzes: z.array(quizSchema),
  // Note: Submissions are nested within Quizzes in this model
})

export type Module = z.infer<typeof moduleSchema>
