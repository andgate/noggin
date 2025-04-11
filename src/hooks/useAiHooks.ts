import type { Part } from '@google/generative-ai'
import { supabase } from '@noggin/app/common/supabase-client'
import type { Tables } from '@noggin/types/database.types'
import type { GeneratedQuiz } from '@noggin/types/quiz-generation-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { aiKeys, submissionKeys } from './query-keys'

// Define Json type helper
type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// --- Actual DB Types ---
type DbQuestion = Tables<'questions'>
type DbSubmission = Tables<'submissions'>
type DbResponse = Tables<'responses'>

// Type for submission including its responses
interface SubmissionWithResponses extends DbSubmission {
  responses?: DbResponse[] // Assuming responses are fetched and attached
}

// --- Placeholder Types (Remove unused ones) ---

// Based on electron-types.ts GradedSubmission
interface GradedResponse {
  responseId: string // Link to the original response in DbSubmission
  questionId: string
  feedback?: string
  score?: number // Points awarded for this response
}

interface GradedSubmission {
  submissionId: string
  overallFeedback: string
  totalScore: number
  gradedResponses: GradedResponse[]
}

// Based on electron-types.ts analyzeContent return type
interface AnalyzedContent {
  title: string
  overview: string
  slug: string
}

// --- AI Call Helper ---

interface CallAiFunctionArgs {
  parts: Part[]
  geminiSchema: Json
}

const callAiFunction = async <TResult>({
  parts,
  geminiSchema,
}: CallAiFunctionArgs): Promise<TResult> => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    throw new Error(`Authentication error: ${sessionError.message}`)
  }
  if (!session) {
    throw new Error('Not authenticated')
  }

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/call-gemini`
  const body = JSON.stringify({ parts, geminiSchema })

  console.log('Calling AI function:', url, 'with body:', body) // For debugging

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body,
  })

  console.log('AI function response status:', response.status) // For debugging

  if (!response.ok) {
    const errorText = await response.text()
    console.error('AI function error response text:', errorText) // For debugging
    throw new Error(
      `AI function call failed: ${response.status} ${response.statusText} - ${errorText}`
    )
  }

  const result = (await response.json()) as TResult
  console.log('AI function success response:', result) // For debugging
  return result
}

// --- Mutations ---

interface UseGenerateModuleInput {
  fileContents: string[]
}

export function useGenerateModule() {
  return useMutation<AnalyzedContent, Error, UseGenerateModuleInput>({
    mutationKey: aiKeys.generateModule,
    mutationFn: async ({ fileContents }) => {
      const parts: Part[] = [
        {
          text: `Analyze the following content extracted from one or more files and provide a concise title, a brief overview (2-3 sentences), and a URL-friendly slug. Content:\n\n---\n${fileContents.join('\n\n---\n')}\n---`,
        },
      ]
      const geminiSchema: Json = {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'A concise, descriptive title for the content.' },
          overview: {
            type: 'string',
            description: 'A brief 2-3 sentence summary of the main topics.',
          },
          slug: {
            type: 'string',
            description: 'A URL-friendly slug (lowercase, hyphens for spaces).',
          },
        },
        required: ['title', 'overview', 'slug'],
      }

      return callAiFunction<AnalyzedContent>({ parts, geminiSchema })
    },
    // Add onSuccess, onError, onSettled as needed for UI feedback
  })
}

// 2. Generate Quiz
interface UseGenerateQuizInput {
  sources: string[] // Text content from source materials
  numQuestions: number
  includeMultipleChoice: boolean
  includeWritten: boolean
  moduleId: string // Keep moduleId for context if needed, though not part of GeneratedQuiz type
}

export function useGenerateQuiz() {
  // Update the return type to the Zod-derived GeneratedQuiz
  return useMutation<GeneratedQuiz, Error, UseGenerateQuizInput>({
    mutationKey: aiKeys.generateQuiz,
    mutationFn: async ({ sources, numQuestions, includeMultipleChoice, includeWritten }) => {
      let questionTypes = ''
      if (includeMultipleChoice && includeWritten) {
        questionTypes = 'a mix of multiple-choice and written questions'
      } else if (includeMultipleChoice) {
        questionTypes = 'multiple-choice questions'
      } else if (includeWritten) {
        questionTypes = 'written questions'
      } else {
        throw new Error('At least one question type (multiple choice or written) must be selected.')
      }

      // Calculate approximate distribution
      let numMc = 0
      let numWritten = 0
      if (includeMultipleChoice && includeWritten) {
        numMc = Math.ceil(numQuestions / 2)
        numWritten = numQuestions - numMc
      } else if (includeMultipleChoice) {
        numMc = numQuestions
      } else {
        numWritten = numQuestions
      }

      const parts: Part[] = [
        {
          text: `Generate a quiz titled appropriately based on the source material(s). The quiz should have exactly ${numQuestions} questions total: ${numMc} multiple-choice questions and ${numWritten} written questions. Cover the key concepts presented. For multiple-choice, provide 4 distinct choices and indicate the correct one.
Source Material:
---
${sources.join('\n\n---\n')}
---`,
        },
      ]
      // Update the schema to match the GeneratedQuiz structure (separate arrays)
      const geminiSchema: Json = {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'A suitable title for the generated quiz.' },
          multipleChoiceQuestions: {
            type: 'array',
            description: `An array of exactly ${numMc} multiple-choice questions.`,
            items: {
              type: 'object',
              properties: {
                questionType: { type: 'string', const: 'multiple_choice' }, // Enforce type
                question: { type: 'string', description: 'The text of the question.' },
                choices: {
                  type: 'array',
                  description:
                    'An array of exactly 4 objects, each with a "text" property for the choice.',
                  items: {
                    type: 'object',
                    properties: { text: { type: 'string' } },
                    required: ['text'],
                  },
                  minItems: 4,
                  maxItems: 4,
                },
                // Assuming AI provides correct answer text matching one choice
                // correctAnswerText: { type: 'string', description: 'The text of the correct choice.' },
              },
              required: ['questionType', 'question', 'choices'],
            },
          },
          writtenQuestions: {
            type: 'array',
            description: `An array of exactly ${numWritten} written-response questions.`,
            items: {
              type: 'object',
              properties: {
                questionType: { type: 'string', const: 'written' }, // Enforce type
                question: { type: 'string', description: 'The text of the question.' },
                // Correct answer for written might be harder for AI, maybe optional
                // correctAnswerText: { type: 'string', description: 'An ideal example answer.' },
              },
              required: ['questionType', 'question'],
            },
          },
        },
        required: ['title', 'multipleChoiceQuestions', 'writtenQuestions'],
      }

      // Call AI function expecting the GeneratedQuiz structure
      const generatedQuizData = await callAiFunction<GeneratedQuiz>({
        parts,
        geminiSchema,
      })

      // Validate counts (optional but recommended)
      if (
        generatedQuizData.multipleChoiceQuestions.length !== numMc ||
        generatedQuizData.writtenQuestions.length !== numWritten
      ) {
        console.warn(
          `AI returned ${generatedQuizData.multipleChoiceQuestions.length} MC and ${generatedQuizData.writtenQuestions.length} written questions, expected ${numMc} and ${numWritten}.`
        )
        // Decide how to handle mismatch: throw error, try again, or proceed with what was returned.
        // For now, proceed.
      }

      // The result directly matches the GeneratedQuiz type
      return generatedQuizData
    },
    onSuccess: (data) => {
      console.log('Quiz generation successful:', data)
    },
    onError: (error) => {
      console.error('Quiz generation failed:', error)
    },
  })
}

// 3. Grade Submission
interface UseGradeSubmissionInput {
  submission: SubmissionWithResponses // Use the combined type
  questions: DbQuestion[] // Contains original questions and correct answers/points
}

export function useGradeSubmission() {
  const queryClient = useQueryClient()

  return useMutation<GradedSubmission, Error, UseGradeSubmissionInput>({
    mutationKey: aiKeys.gradeSubmission,
    mutationFn: async ({ submission, questions }) => {
      // Prepare context for the AI grader
      const gradingContext = questions
        .map((q) => {
          // Explicitly type 'r' using DbResponse
          const response = submission.responses?.find((r: DbResponse) => r.question_id === q.id)
          // Access the correct field for student answer based on DbResponse type
          const userAnswer = response?.student_answer_text

          // Removed reference to q.points as it doesn't exist in the schema
          let questionDetails = `Question ${q.id} (Type: ${q.question_type}):\n${q.question_text}`
          if (q.question_type === 'multiple_choice' && q.choices) {
            // Use 'choices' and 'correct_answer_text' from DbQuestion
            questionDetails += `\nOptions: ${JSON.stringify(q.choices)}` // Assuming choices is stored as JSON
            questionDetails += `\nCorrect Answer: ${q.correct_answer_text}`
          } else if (q.question_type === 'written') {
            questionDetails += `\nCorrect Answer: ${q.correct_answer_text ?? '[Not Provided]'}` // Show correct written answer if available
          }
          questionDetails += `\nStudent Answer: ${userAnswer ?? '[No Answer]'}`
          return questionDetails
        })
        .join('\n\n')

      const parts: Part[] = [
        {
          text: `Grade the following student submission based on the provided questions and answers. For each question, provide specific feedback and assign a score (assume 1 point per question unless context suggests otherwise). Also, provide overall feedback for the entire submission and calculate the total score based on the assigned scores.
Context:
---
${gradingContext}
---`,
        },
      ]
      const geminiSchema: Json = {
        type: 'object',
        properties: {
          overallFeedback: {
            type: 'string',
            description: 'Overall feedback for the student on their submission.',
          },
          totalScore: {
            type: 'number',
            description:
              'The total score calculated by summing the scores for each graded response.',
          },
          gradedResponses: {
            type: 'array',
            description: 'An array containing feedback and score for each question response.',
            items: {
              type: 'object',
              properties: {
                responseId: {
                  type: 'string',
                  description: 'The ID of the original student response being graded.',
                },
                questionId: {
                  type: 'string',
                  description: 'The ID of the question corresponding to the response.',
                },
                feedback: {
                  type: 'string',
                  description: 'Specific feedback for the student on this answer.',
                },
                score: {
                  type: 'number',
                  description: 'The score awarded for this answer (e.g., 0 or 1).', // Adjusted description
                },
              },
              required: ['responseId', 'questionId', 'feedback', 'score'],
            },
          },
        },
        required: ['overallFeedback', 'totalScore', 'gradedResponses'],
      }

      // Need to map response IDs correctly in the result
      const aiGradingResult = await callAiFunction<Omit<GradedSubmission, 'submissionId'>>({
        parts,
        geminiSchema,
      })

      // Ensure response IDs from the input submission are used in the output
      const finalGradedSubmission: GradedSubmission = {
        submissionId: submission.id,
        overallFeedback: aiGradingResult.overallFeedback,
        totalScore: aiGradingResult.totalScore,
        gradedResponses: aiGradingResult.gradedResponses.map((gr) => {
          // Find the original response ID based on the question ID the AI provides
          // Explicitly type 'r' using DbResponse
          const originalResponse = submission.responses?.find(
            (r: DbResponse) => r.question_id === gr.questionId
          )
          return {
            ...gr,
            // Use the actual response ID from the submission object
            responseId: originalResponse?.id ?? `unknown-response-for-q-${gr.questionId}`,
          }
        }),
      }

      // Validate total score matches sum of individual scores?
      const calculatedScore = finalGradedSubmission.gradedResponses.reduce(
        (sum, r) => sum + (r.score ?? 0),
        0
      )
      // We still check this, as the AI might calculate differently than a simple sum
      if (calculatedScore !== finalGradedSubmission.totalScore) {
        console.warn(
          `AI total score (${finalGradedSubmission.totalScore}) does not match calculated sum of scores (${calculatedScore}). Using calculated sum.`
        )
        finalGradedSubmission.totalScore = calculatedScore
      }

      return finalGradedSubmission
    },
    onSuccess: (data, variables) => {
      console.log('Grading successful:', data)
      // Invalidate queries related to this specific submission to refetch its details (including grade)
      queryClient.invalidateQueries({ queryKey: submissionKeys.detail(variables.submission.id) })
      queryClient.invalidateQueries({
        queryKey: submissionKeys.detailWithResponses(variables.submission.id),
      })
      // Optionally invalidate lists if grading status affects list views
      // queryClient.invalidateQueries({ queryKey: submissionKeys.listByQuiz(variables.submission.quiz_id) })
      // queryClient.invalidateQueries({ queryKey: submissionKeys.listByModule(variables.submission.module_id) })
    },
    onError: (error) => {
      console.error('Grading failed:', error)
    },
  })
}
