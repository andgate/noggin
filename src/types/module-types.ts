import { z } from 'zod'
import { quizSchema, submissionSchema } from './quiz-types'

export const moduleMetadataSchema = z.object({
    libraryId: z.string(),
    id: z.string(),
    path: z.string(),
    title: z.string(),
    slug: z.string(),
    overview: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
})

export const moduleStatsSchema = z.object({
    moduleId: z.string(),
    currentBox: z.number().min(1).max(5),
    nextReviewDate: z.string(), // ISO date string - The date on/after which the module should be reviewed
})

export const modSchema = z.object({
    metadata: moduleMetadataSchema,
    stats: moduleStatsSchema,
    sources: z.array(z.string()),
    quizzes: z.array(quizSchema),
    submissions: z.array(submissionSchema),
})

export type ModuleMetadata = z.infer<typeof moduleMetadataSchema>
export type ModuleStats = z.infer<typeof moduleStatsSchema>
export type Mod = z.infer<typeof modSchema>

export const moduleOverviewSchema = z.object({
    id: z.string(),
    slug: z.string(),
    displayName: z.string(),
    libraryId: z.string(),
})

export type ModuleOverview = z.infer<typeof moduleOverviewSchema>
