import { z } from 'zod'
import { questionSchema } from './question.types'
import { submissionSchema } from './submission.types'

// Corresponds to DB quizzes table, but nests questions and submissions
export const quizSchema = z.object({
  id: z.string().uuid(),
  moduleId: z.string().uuid(),
  userId: z.string().uuid(), // Keep for potential future use
  title: z.string(),
  timeLimitSeconds: z.number().int().min(0).nullable(), // Optional time limit
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }).nullable(),
  questions: z.array(questionSchema), // Array of questions for this quiz
  submissions: z.array(submissionSchema), // Array of submissions for this quiz
})

export type Quiz = z.infer<typeof quizSchema>
