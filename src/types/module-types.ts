import { z } from 'zod'
import { quizSchema, submissionSchema } from './quiz-types'

export const moduleStatsSchema = z.object({
    moduleId: z.string(),
    currentBox: z.number().min(1).max(5),
    lastReviewDate: z.string(), // ISO date string
    nextDueDate: z.string(), // ISO date string
})

export const modSchema = z.object({
    id: z.string(),
    name: z.string(),
    path: z.string(),
    sources: z.array(z.string()),
    quizzes: z.array(quizSchema),
    submissions: z.array(submissionSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
    stats: moduleStatsSchema.optional(),
})

export type ModuleStats = z.infer<typeof moduleStatsSchema>
export type Mod = z.infer<typeof modSchema>
