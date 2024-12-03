import { z } from 'zod'
import { gradeSchema } from './grading-types'
import { questionSchema, responseSchema } from './quiz-types'

export const contentSourceSchema = z.object({
    type: z.enum(['pdf', 'text', 'url']),
    originalName: z.string(),
    slug: z.string(),
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

export const modSchema = z.object({
    id: z.string(),
    name: z.string(),
    sources: z.array(contentSourceSchema),
    tests: z.array(testSchema),
    submissions: z.array(submissionSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
})

export const modkitSchema = z.object({
    id: z.string(),
    name: z.string(),
    path: z.string(),
    mods: z.array(modSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
})

export const modKitOverviewSchema = z.object({
    id: z.string(),
    name: z.string(),
    path: z.string(),
    modCount: z.number(),
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

export type Mod = z.infer<typeof modSchema>
export type Modkit = z.infer<typeof modkitSchema>
export type ModKitOverview = z.infer<typeof modKitOverviewSchema>
export type ModGradesFile = z.infer<typeof modGradesFileSchema>
