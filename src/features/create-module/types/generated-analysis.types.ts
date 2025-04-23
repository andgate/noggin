import { z } from 'zod'

export const generatedContentAnalysisSchema = z.object({
  title: z.string().describe('A concise, descriptive title for the content.'),
  overview: z.string().describe('A brief 2-3 sentence summary of the main topics.'),
  slug: z.string().describe('A URL-friendly slug (lowercase, hyphens for spaces).'),
})

export type GeneratedContentAnalysis = z.infer<typeof generatedContentAnalysisSchema>
