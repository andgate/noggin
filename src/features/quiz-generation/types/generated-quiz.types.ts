import { z } from 'zod'

export const generatedMultipleChoiceQuestionSchema = z.object({
  questionType: z.literal('multiple_choice'),
  question: z.string(),
  options: z.string().array().length(4, 'Multiple choice questions must have exactly 4 options.'),
})

export const generatedWrittenQuestionSchema = z.object({
  questionType: z.literal('written'),
  question: z.string(),
})

export const generatedQuizSchema = z.object({
  title: z.string(),
  multipleChoiceQuestions: z.array(generatedMultipleChoiceQuestionSchema).default([]),
  writtenQuestions: z.array(generatedWrittenQuestionSchema).default([]),
})

export type GeneratedWrittenQuestion = z.infer<typeof generatedWrittenQuestionSchema>
export type GeneratedMultipleChoiceQuestion = z.infer<typeof generatedMultipleChoiceQuestionSchema>
export type GeneratedQuestion = GeneratedMultipleChoiceQuestion | GeneratedWrittenQuestion

export type GeneratedQuiz = z.infer<typeof generatedQuizSchema>
