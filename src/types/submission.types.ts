import { z } from 'zod'
import { responseSchema } from './response.types'

// Corresponds to DB submissions table, but nests responses
export const submissionSchema = z.object({
  id: z.string().uuid(),
  quizId: z.string().uuid(),
  moduleId: z.string().uuid(),
  userId: z.string().uuid(), // Keep for potential future use
  attemptNumber: z.number().int().min(1),
  submittedAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  timeElapsedSeconds: z.number().int().min(0).nullable(),
  gradePercent: z.number().min(0).max(100).nullable(), // Overall grade %
  letterGrade: z.string().length(1).nullable(), // Overall letter grade
  status: z.enum(['pending', 'graded']), // Status of the submission grading
  responses: z.array(responseSchema), // Array of responses for this submission
})

export type Submission = z.infer<typeof submissionSchema>
