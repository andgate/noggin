import { z } from 'zod'

export const generatedGradedResponseSchema = z.object({
  question: z.string(),
  studentAnswer: z.string(),
  correctAnswer: z.string(),
  isCorrect: z.boolean(),
  feedback: z.string(),
  verdict: z.enum(['pass', 'fail']),
})

export const generatedGradesSchema = z.object({
  responses: generatedGradedResponseSchema.array(),
})

export type GeneratedGradedResponse = z.infer<typeof generatedGradedResponseSchema>
export type GeneratedGrades = z.infer<typeof generatedGradesSchema>
