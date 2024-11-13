import { gradeSchema, letterGradeSchema } from '@noggin/types/grading-types'
import { z } from 'zod'

export type QuestionType = 'multiple-choice' | 'written'

export const sourceSchema = z.object({
    id: z.number(),
    content: z.string(),
    createdAt: z.string(),
})

export const choiceSchema = z.object({
    id: z.number(),
    optionText: z.string(),
    isCorrect: z.boolean(),
})

export const multipleChoiceQuestionSchema = z.object({
    questionType: z.literal('multiple_choice'),
    id: z.number(),
    question: z.string(),
    choices: z.array(choiceSchema),
})

export const writtenQuestionSchema = z.object({
    questionType: z.literal('written'),
    id: z.number(),
    question: z.string(),
})

export const questionSchema = z.discriminatedUnion('questionType', [
    multipleChoiceQuestionSchema,
    writtenQuestionSchema,
])

export const quizIdSchema = z.number()

export const quizSchema = z.object({
    id: quizIdSchema,
    createdAt: z.string(),
    title: z.string(),
    timeLimit: z.number(),
    sources: sourceSchema.array(),
    questions: z.array(questionSchema),
})

export const ungradedResponseSchema = z.object({
    id: z.number(),
    createdAt: z.string(),
    quizId: z.number(),
    submissionId: z.number(),
    question: questionSchema,
    studentAnswer: z.string(),
})

export const gradedResponseSchema = z.object({
    id: z.number(),
    createdAt: z.string(),
    quizId: z.number(),
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

export const submissionIdSchema = z.number()

// Add a new submission status enum
export const submissionStatusSchema = z.enum(['pending', 'graded'])

// TODO: Add validation for score ranges
// TODO: Consider adding custom type guards
// TODO: Add serialization helpers
// TODO: Implement stricter validation rules
// Update the submission schema
export const submissionSchema = z.object({
    id: submissionIdSchema,
    completedAt: z.string(),
    quizTitle: z.string(),
    timeElapsed: z.number(),
    timeLimit: z.number(),
    // Grade out of 100
    grade: gradeSchema.optional(),
    letterGrade: letterGradeSchema.optional(),
    responses: responseSchema.array(),
    status: submissionStatusSchema,
})

export type Source = z.infer<typeof sourceSchema>
export type Choice = z.infer<typeof choiceSchema>
export type Question = z.infer<typeof questionSchema>
export type QuizId = z.infer<typeof quizIdSchema>
export type Quiz = z.infer<typeof quizSchema>
export type Submission = z.infer<typeof submissionSchema>
export type SubmissionId = z.infer<typeof submissionIdSchema>
export type Response = z.infer<typeof responseSchema>
