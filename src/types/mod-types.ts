import { z } from 'zod'
import { gradeSchema } from './grading-types'
import { questionSchema, responseSchema } from './quiz-types'

export const sourceExtractSchema = z.object({
    id: z.string(),
    content: z.string(),
    createdAt: z.string(),
})

export const testSchema = z.object({
    id: z.string(),
    originalName: z.string(),
    slug: z.string(),
    title: z.string(),
    questions: z.array(questionSchema),
    createdAt: z.string(),
})

export const submissionSchema = z.object({
    id: z.string(),
    testId: z.string(),
    responses: z.array(responseSchema),
    grade: z.number().optional(),
    completedAt: z.string(),
})

export const topicSchema = z.object({
    slug: z.string(),
    title: z.string(),
    mastery: z.enum(['novice', 'intermediate', 'advanced', 'master']).default('novice'),
    subtopics: z.lazy(() => z.array(topicSchema)).default([]),
})

export const reviewScheduleSchema = z.object({
    nextReviewDate: z.string(),
    reviewInterval: z.number(), // days
    lastReviewDate: z.string().optional(),
})

export const modSchema = z.object({
    id: z.string(),
    name: z.string(),
    path: z.string(),
    extracts: z.array(sourceExtractSchema),
    outline: topicSchema,
    questions: z.array(questionSchema),
    submissions: z.array(submissionSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
    version: z.number().default(1),
    previousVersions: z.array(z.number()).default([]),
    reviewSchedule: reviewScheduleSchema.optional(),
    parentModuleId: z.string().optional(),
    submoduleIds: z.array(z.string()).default([]),
})

export const modOverviewSchema = z.object({
    id: z.string(),
    name: z.string(),
    path: z.string(),
    sourcesCount: z.number(),
    testsCount: z.number(),
    submissionsCount: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
})

export const modGradeSchema = z.object({
    grade: gradeSchema,
    attempts: z.number(),
    lastAttemptDate: z.string(),
})

export const modGradesFileSchema = z.object({
    quizzes: z.record(z.string(), modGradeSchema),
})

export type SourceExtract = z.infer<typeof sourceExtractSchema>
export type Mod = z.infer<typeof modSchema>
export type ModOverview = z.infer<typeof modOverviewSchema>
export type ModGradesFile = z.infer<typeof modGradesFileSchema>
