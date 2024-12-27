import { z } from 'zod'

export const choiceSchema = z.object({
    text: z.string(),
})

export const generatedMultipleChoiceQuestionSchema = z.object({
    questionType: z.literal('multiple_choice'),
    question: z.string(),
    choices: choiceSchema.array(),
})

export const generatedWrittenQuestionSchema = z.object({
    questionType: z.literal('written'),
    question: z.string(),
})

export const generatedQuestionSchema = z.discriminatedUnion('questionType', [
    generatedMultipleChoiceQuestionSchema,
    generatedWrittenQuestionSchema,
])

export const generatedQuizSchema = z.object({
    title: z.string(),
    multipleChoiceQuestions: z.array(generatedMultipleChoiceQuestionSchema),
    writtenQuestions: z.array(generatedWrittenQuestionSchema),
})

export const gradedResponseSchema = z.object({
    question: z.string(),
    studentAnswer: z.string(),
    correctAnswer: z.string(),
    isCorrect: z.boolean(),
    feedback: z.string(),
})

export const gradedSubmissionSchema = z.object({
    responses: gradedResponseSchema.array(),
})

export type GeneratedChoice = z.infer<typeof choiceSchema>
export type GeneratedWrittenQuestion = z.infer<typeof generatedWrittenQuestionSchema>
export type GeneratedMultipleChoiceQuestion = z.infer<typeof generatedMultipleChoiceQuestionSchema>
export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>
export type GeneratedQuiz = z.infer<typeof generatedQuizSchema>

export type GradedResponse = z.infer<typeof gradedResponseSchema>
export type GradedSubmission = z.infer<typeof gradedSubmissionSchema>
