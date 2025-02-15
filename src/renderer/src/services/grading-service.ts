// import {
//     GradedResponse,
//     GradedSubmission,
//     gradedSubmissionSchema,
// } from '@noggin/types/quiz-generation-types'
// import { Question, Quiz } from '@noggin/types/quiz-types'
// import { gradeResponses } from '@renderer/common/grading-helpers'
// import { AbortableGenerativeFunction } from '@renderer/hooks/use-generative'
// import { generateChatCompletion } from '../../../main/services/openai-service'

// export const BATCH_SIZE = 30 // Number of questions to grade at a time

// const generateGradedSubmissionPrompt = (
//     sources: string[],
//     quizTitle: string,
//     questions: Question[],
//     studentResponses: string[]
// ): string => `\
//     ---
//     Sources
//     ---
//     Please focus on the following source material(s):
//     \n\n${sources.join('\n\n---\n\n')}

//     ---
//     Grading Instructions
//     ---

//     Please grade the following submission from a student.

//     For each question response from the student:
//     - Provide a score between 0 and 100
//     - Provide specific feedback explaining the score
//     - Consider the source material (see above) carefully when evaluating answers

//     ---
//     Student Quiz Submission
//     ---

//     Now please grade the following student responses from a quiz submission.

//     Quiz Title: ${quizTitle}
//     Questions and Responses:
//     ${questions
//         .map(
//             (q, i) => `
//     Question ${i + 1}: ${q.question}
//     ${q.questionType === 'multiple_choice' ? `Options:\n${q.choices.map((c) => `- ${c.optionText}`).join('\n')}` : ''}
//     Response: ${studentResponses[i]}
//     `
//         )
//         .join('\n---\n')}
// `

// export interface GenerateGradesOptions {
//     apiKey?: string
//     quiz: Quiz
//     studentResponses: string[]
//     signal?: AbortSignal
// }

// export const generateGradedSubmission: AbortableGenerativeFunction<
//     GenerateGradesOptions,
//     GradedSubmission
// > = async function* ({ apiKey, quiz, studentResponses, signal }) {
//     // Initialize responses array with undefined values
//     let gradedResponses: GradedResponse[] = []

//     const numBatches = Math.ceil(quiz.questions.length / BATCH_SIZE)

//     // Grade submission in batches
//     for (let i = 0; i < numBatches; i++) {
//         if (signal && signal.aborted) break

//         const startIndex = i * BATCH_SIZE
//         const endIndex = startIndex + BATCH_SIZE

//         const submissionBatch = await generateGradedSubmissionBatch({
//             apiKey,
//             sources: quiz.sources.map((source) => source.content),
//             quizTitle: quiz.title,
//             questions: quiz.questions.slice(startIndex, endIndex),
//             studentResponses: studentResponses.slice(startIndex, endIndex),
//             signal,
//         })

//         gradedResponses.push(...submissionBatch.responses)

//         yield {
//             responses: gradedResponses,
//             grade: gradeResponses(gradedResponses),
//         }
//     }

//     return {
//         responses: gradedResponses,
//         grade: gradeResponses(gradedResponses),
//     }
// }

// export interface GenerateGradedSubmissionBatchOptions {
//     apiKey?: string
//     sources: string[]
//     quizTitle: string
//     questions: Question[]
//     studentResponses: string[]
//     signal?: AbortSignal
// }

// async function generateGradedSubmissionBatch({
//     apiKey,
//     sources,
//     quizTitle,
//     questions,
//     studentResponses,
//     signal,
// }: GenerateGradedSubmissionBatchOptions): Promise<GradedSubmission> {
//     console.log('generateGradedResponses called =>', {
//         sources,
//         quizTitle,
//         questions,
//         studentResponses,
//     })
//     const prompt = generateGradedSubmissionPrompt(sources, quizTitle, questions, studentResponses)
//     const completion = await generateChatCompletion({
//         apiKey,
//         responseFormatName: 'gradedSubmissionResponse',
//         schema: gradedSubmissionSchema,
//         messages: [
//             {
//                 role: 'system',
//                 content:
//                     'You are a helpful professor. Only use the schema for graded submission responses.',
//             },
//             {
//                 role: 'user',
//                 content: prompt,
//             },
//         ],
//         signal,
//     })

//     console.log('gradedSubmission generated ==>', completion)

//     return completion
// }
