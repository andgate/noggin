import { gradeSchema, letterGradeSchema } from '@noggin/types/grading-types'
import { z } from 'zod'

export type QuestionType = 'multiple-choice' | 'written'

export const choiceSchema = z.object({
    optionText: z.string(),
})

export const multipleChoiceQuestionSchema = z.object({
    questionType: z.literal('multiple_choice'),
    question: z.string(),
    choices: z.array(choiceSchema),
})

export const writtenQuestionSchema = z.object({
    questionType: z.literal('written'),
    question: z.string(),
})

export const questionSchema = z.discriminatedUnion('questionType', [
    multipleChoiceQuestionSchema,
    writtenQuestionSchema,
])

export const quizIdSchema = z.string()

export const quizSchema = z.object({
    id: quizIdSchema,
    createdAt: z.string(),
    title: z.string(),
    timeLimit: z.number(),
    sources: z.string().array(),
    questions: z.array(questionSchema),
})

export const ungradedResponseSchema = z.object({
    createdAt: z.string(),
    quizId: z.string(),
    submissionId: z.number(),
    question: questionSchema,
    studentAnswer: z.string(),
})

export const gradedResponseSchema = z.object({
    createdAt: z.string(),
    quizId: z.string(),
    submissionId: z.number(),
    question: questionSchema,
    studentAnswer: z.string(),
    correctAnswer: z.string(),
    verdict: z.union([z.literal('pass'), z.literal('fail')]),
    feedback: z.string(),
    status: z.literal('graded'),
})

export const responseSchema = z.discriminatedUnion('status', [
    ungradedResponseSchema.extend({ status: z.literal('pending') }),
    gradedResponseSchema,
])

// Add a new submission status enum
export const submissionStatusSchema = z.enum(['pending', 'graded'])

// TODO: Add validation for score ranges
// TODO: Consider adding custom type guards
// TODO: Add serialization helpers
// TODO: Implement stricter validation rules
export const submissionSchema = z.object({
    quizId: z.string(),
    attemptNumber: z.number(),
    completedAt: z.string(),
    quizTitle: z.string(),
    timeElapsed: z.number(),
    timeLimit: z.number(),
    libraryId: z.string(),
    moduleSlug: z.string(),
    // Grade out of 100
    grade: gradeSchema.optional(),
    letterGrade: letterGradeSchema.optional(),
    responses: responseSchema.array(),
    status: submissionStatusSchema,
})

export type Choice = z.infer<typeof choiceSchema>
export type Question = z.infer<typeof questionSchema>
export type QuizId = z.infer<typeof quizIdSchema>
export type Quiz = z.infer<typeof quizSchema>
export type Submission = z.infer<typeof submissionSchema>
export type Response = z.infer<typeof responseSchema>
