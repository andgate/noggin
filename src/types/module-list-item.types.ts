import { z } from 'zod'

// Define the structure for the nested stats needed in the list item
const moduleListItemStatsSchema = z
  .object({
    currentBox: z.number().int().min(1).max(5).default(1),
    nextReviewAt: z.string().datetime({ offset: true }).nullable().default(null),
    // Add other minimal stats if needed for list view, e.g., quizAttempts
  })
  .optional() // Stats might not exist yet

// Define the schema for the module list item itself
export const moduleListItemSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(), // Still useful for context/potential filtering
  title: z.string(),
  // Include only the necessary subset of stats
  stats: moduleListItemStatsSchema,
  // We don't need overview, sources, quizzes, full stats etc. for the list
})

export type ModuleListItem = z.infer<typeof moduleListItemSchema>
// Optional: Export the stats subset type if needed elsewhere
export type ModuleListItemStats = z.infer<typeof moduleListItemStatsSchema>
