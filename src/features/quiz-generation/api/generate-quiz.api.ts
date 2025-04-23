import { toGeminiSchema } from '@/shared/utils/gemini-zod'
import type { Part } from '@google/genai'
import { GeneratedQuiz, generatedQuizSchema } from '../types/generated-quiz.types'

export type GenerateQuizInput = {
  apiKey: string
  contentIds: string[] // Expecting id
  numQuestions: number
  includeMultipleChoice: boolean
  includeWritten: boolean
}

/**
 * Generates a quiz based on source content.
 * Returns the raw generated quiz data, conforming to GeneratedQuiz type.
 */
export async function generateQuiz({
  contentIds,
  numQuestions,
  includeMultipleChoice,
  includeWritten,
}: GenerateQuizInput): Promise<GeneratedQuiz> {
  // TODO Download files from bucket, so we can uplaod them to gemini
  // Alternatively, we can pass the content ids to the gemini edge function call and let it handle the download

  // TODO more complex part generation?
  const parts: Part[] = [
    {
      text: `Generate a quiz titled appropriately based on the source material(s). The quiz should have exactly ${numQuestions} questions total: ${numMc} multiple-choice questions and ${numWritten} written questions. Cover the key concepts presented. For multiple-choice, provide 4 distinct choices.
  Source Material:
  ---
  ${sources.join('\n\n---\n')}
  ---`,
    },
  ]

  const geminiSchema = toGeminiSchema(generatedQuizSchema)

  const generatedQuizData = await callAiFunction({
    parts,
    geminiSchema,
    zodSchema: generatedQuizSchema,
  })

  if (
    generatedQuizData.multipleChoiceQuestions.length !== numMc ||
    generatedQuizData.writtenQuestions.length !== numWritten
  ) {
    console.warn(
      `AI returned ${generatedQuizData.multipleChoiceQuestions.length} MC and ${generatedQuizData.writtenQuestions.length} written questions, expected ${numMc} and ${numWritten}. Proceeding with generated data.`
    )
  }

  return generatedQuizData
}
