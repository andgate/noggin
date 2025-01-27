import { z } from 'zod'
import { quizSchema, submissionSchema } from './quiz-types'

export const moduleMetadataSchema = z.object({
    title: z.string(),
    slug: z.string(),
    overview: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
})

export const moduleStatsSchema = z.object({
    moduleId: z.string(),
    currentBox: z.number().min(1).max(5),
    lastReviewDate: z.string(), // ISO date string
    nextDueDate: z.string(), // ISO date string
})

export const modSchema = z.object({
    id: z.string(),
    path: z.string(),
    metadata: moduleMetadataSchema,
    stats: moduleStatsSchema.optional(),
    sources: z.array(z.string()),
    quizzes: z.array(quizSchema),
    submissions: z.array(submissionSchema),
})

export type ModuleMetadata = z.infer<typeof moduleMetadataSchema>
export type ModuleStats = z.infer<typeof moduleStatsSchema>
export type Mod = z.infer<typeof modSchema>

export const moduleOverviewSchema = z.object({
    slug: z.string(),
    displayName: z.string(),
    librarySlug: z.string().optional(),
})

export type ModuleOverview = z.infer<typeof moduleOverviewSchema>
