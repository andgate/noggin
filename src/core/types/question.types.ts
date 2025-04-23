import { z } from 'zod'

export type QuestionType = 'multiple_choice' | 'written'

export const choiceSchema = z.object({
  optionText: z.string(),
})

// Base schema for common question properties
const baseQuestionSchema = z.object({
  id: z.string().uuid(),
  quizId: z.string().uuid(),
  userId: z.string().uuid(),
  questionText: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// Schema for multiple choice questions (view model - no answer)
// Expects choices to be an array of strings after potential JSON parsing in mapper
export const multipleChoiceQuestionSchema = baseQuestionSchema.extend({
  questionType: z.literal('multiple_choice'),
  options: z.array(z.string()).length(4, 'Multiple choice questions must have exactly 4 options.'),
})

// Schema for written questions (view model)
export const writtenQuestionSchema = baseQuestionSchema.extend({
  questionType: z.literal('written'),
})

// Discriminated union for the Question view type
export const questionSchema = z.discriminatedUnion('questionType', [
  multipleChoiceQuestionSchema,
  writtenQuestionSchema,
])

export type Question = z.infer<typeof questionSchema>
export type MultipleChoiceQuestion = z.infer<typeof multipleChoiceQuestionSchema>
export type WrittenQuestion = z.infer<typeof writtenQuestionSchema>
