import { z } from 'zod'
import { questionSchema, submissionSchema } from './quiz-types'

export const modSchema = z.object({
    id: z.string(),
    name: z.string(),
    path: z.string(),
    sources: z.array(z.string()),
    questions: z.array(questionSchema),
    submissions: z.array(submissionSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
})

export type Mod = z.infer<typeof modSchema>
