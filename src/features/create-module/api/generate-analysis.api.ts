import { toGeminiSchema } from '@/shared/utils/gemini-zod'
import { Part } from '@google/genai'
import {
  GeneratedContentAnalysis,
  generatedContentAnalysisSchema,
} from '../types/generated-analysis.types'

export type AnalyzeContentInput = {
  apiKey: string
  files: File[] // Expecting raw text content
}

/**
 * Analyzes content to generate title, overview, and slug.
 */
export async function generateContentAnalysis({
  apiKey,
  files,
}: AnalyzeContentInput): Promise<GeneratedContentAnalysis> {
  // Convert files to parts
  console.log('>>> aiService.analyzeContent called')
  const parts: Part[] = [
    {
      text: `Analyze the following content extracted from one or more files and provide a concise title, a brief overview (2-3 sentences), and a URL-friendly slug. Content:\n\n---\n${fileContents.join('\n\n---\n')}\n---`,
    },
  ]
  const geminiSchema = toGeminiSchema(generatedContentAnalysisSchema)

  return callAiFunction({
    parts,
    geminiSchema,
    zodSchema: generatedContentAnalysisSchema,
  })
}
