import { z } from 'zod'
// Note: We don't import questionSchema here to avoid circular dependencies if questionSchema were to import responseSchema later.
// We'll rely on fetching question details separately when needed.

// Base schema for common response properties
const baseResponseSchema = z.object({
  id: z.string().uuid(),
  submissionId: z.string().uuid(),
  questionId: z.string().uuid(),
  userId: z.string().uuid(), // Keep for potential future use
  studentAnswerText: z.string().default(''), // Student's answer
})

// Schema for a response that hasn't been graded yet
export const pendingResponseSchema = baseResponseSchema.extend({
  status: z.literal('pending'),
})

// Schema for a response that has been graded
export const gradedResponseSchema = baseResponseSchema.extend({
  status: z.literal('graded'),
  isCorrect: z.boolean(),
  feedback: z.string(),
  verdict: z.enum(['pass', 'fail']),
  gradedAt: z.string().datetime().nullable(),
})

// Discriminated union for the Response view type
export const responseSchema = z.discriminatedUnion('status', [
  pendingResponseSchema,
  gradedResponseSchema,
])

export type Response = z.infer<typeof responseSchema>
export type PendingResponse = z.infer<typeof pendingResponseSchema>
export type GradedResponse = z.infer<typeof gradedResponseSchema>
