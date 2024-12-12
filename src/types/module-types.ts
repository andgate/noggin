import { z } from 'zod'
import { quizSchema, submissionSchema } from './quiz-types'

export const modSchema = z.object({
    id: z.string(),
    name: z.string(),
    path: z.string(),
    sources: z.array(z.string()),
    quizzes: z.array(quizSchema),
    submissions: z.array(submissionSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
})

export type Mod = z.infer<typeof modSchema>
