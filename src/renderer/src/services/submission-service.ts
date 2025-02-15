// import { gradeSchema, letterGradeSchema } from '@noggin/types/grading-types'
// import { GradedResponse } from '@noggin/types/quiz-generation-types'
// import { Quiz, Response, responseSchema, Submission, SubmissionId } from '@noggin/types/quiz-types'
// import { asLetterGrade, gradeResponses } from '@renderer/common/grading-helpers'
// import db from '@renderer/db'
// import { z } from 'zod'

// export interface SubmitQuizOptions {
//     quiz: Quiz
//     gradedResponses: GradedResponse[]
//     timeElapsed: number
//     status: 'pending' | 'graded'
//     responses: (typeof responseSchema)[]
// }

// export const storeQuizSubmission = async ({
//     quiz,
//     gradedResponses,
//     timeElapsed,
//     status,
//     responses,
// }: SubmitQuizOptions): Promise<SubmissionId> => {
//     console.log('storing quiz submission', { quiz, status })

//     const grade =
//         status === 'graded' && gradedResponses ? gradeResponses(gradedResponses) : undefined
//     const letterGrade = grade ? asLetterGrade(grade) : undefined

//     // Wrap operations in a transaction
//     const submission = await db.transaction(async (tx) => {
//         // 1. Store the submission in the database
//         const [newSubmission] = await tx
//             .insert(submissionsTable)
//             .values({
//                 quizId: quiz.id,
//                 timeLimit: quiz.timeLimit,
//                 timeElapsed: timeElapsed,
//                 grade: grade,
//                 letterGrade: letterGrade,
//                 status: status,
//             })
//             .returning()

//         // 2. Store the responses in the database
//         await tx.insert(responsesTable).values(
//             responses.map((response, index) => ({
//                 quizId: quiz.id,
//                 submissionId: newSubmission.id,
//                 questionId: quiz.questions[index].id,
//                 studentAnswer: response.studentAnswer,
//                 correctAnswer: response.correctAnswer,
//                 verdict: response.verdict,
//                 feedback: response.feedback,
//             }))
//         )

//         return newSubmission
//     })

//     return submission.id
// }

// export const getSubmission = async (submissionId: SubmissionId): Promise<Submission> => {
//     const submission = await db.query.submissions.findFirst({
//         where: eq(submissionsTable.id, submissionId),
//         with: {
//             quiz: true,
//             responses: {
//                 with: {
//                     question: {
//                         with: {
//                             choices: true,
//                         },
//                     },
//                 },
//             },
//         },
//     })

//     if (!submission) {
//         throw new Error('Submission not found')
//     }

//     return {
//         id: submission.id,
//         completedAt: submission.completedAt,
//         quizTitle: submission.quiz.title,
//         timeElapsed: submission.timeElapsed,
//         timeLimit: submission.timeLimit,
//         grade: gradeSchema.parse(submission.grade),
//         letterGrade: letterGradeSchema.parse(submission.letterGrade),
//         responses: submission.responses.map((response) => ({
//             id: response.id,
//             createdAt: response.createdAt,
//             quizId: submission.quizId,
//             submissionId: submission.id,
//             question:
//                 response.question.questionType === 'multiple_choice'
//                     ? {
//                           questionType: 'multiple_choice',
//                           id: response.question.id,
//                           question: response.question.question,
//                           choices: response.question.choices.map((choice) => ({
//                               id: choice.id,
//                               optionText: choice.optionText,
//                               isCorrect: !!choice.isCorrect,
//                           })),
//                       }
//                     : {
//                           questionType: 'written',
//                           id: response.question.id,
//                           question: response.question.question,
//                       },
//             studentAnswer: response.studentAnswer,
//             correctAnswer: response.correctAnswer,
//             verdict: z
//                 .union([z.literal('pass'), z.literal('fail')])
//                 .optional()
//                 .parse(response.verdict),
//             feedback: response.feedback,
//             status: response.verdict ? 'graded' : 'pending',
//         })),
//     }
// }

// export const getSubmissionsForQuiz = async (quizId: number): Promise<Submission[]> => {
//     const results = await db.query.submissions.findMany({
//         where: eq(submissionsTable.quizId, quizId),
//         orderBy: desc(submissionsTable.completedAt),
//         limit: 10, // Adjust this as needed
//     })

//     if (!results) {
//         return []
//     }

//     // Transform the submissions to match your Submission type
//     return results.map(async (submission) => {
//         const quiz = await db.query.quizzes.findFirst({
//             where: eq(quizzesTable.id, submission.quizId),
//         })
//         const responses: Response[] = (
//             await db.query.responses.findMany({
//                 where: eq(responsesTable.submissionId, submission.id),
//             })
//         ).map(
//             (response): Response => ({
//                 id: response.id,
//                 createdAt: response.createdAt,
//                 quizId: submission.quizId,
//                 submissionId: submission.id,
//                 question:
//                     response.question.questionType === 'multiple_choice'
//                         ? {
//                               questionType: 'multiple_choice',
//                               id: response.question.id,
//                               question: response.question.question,
//                               choices: response.question.choices.map((choice) => ({
//                                   id: choice.id,
//                                   optionText: choice.optionText,
//                                   isCorrect: !!choice.isCorrect,
//                               })),
//                           }
//                         : {
//                               questionType: 'written',
//                               id: response.question.id,
//                               question: response.question.question,
//                           },
//                 studentAnswer: response.studentAnswer,
//                 correctAnswer: response.correctAnswer,
//                 verdict: z
//                     .union([z.literal('pass'), z.literal('fail')])
//                     .optional()
//                     .parse(response.verdict),
//                 feedback: response.feedback,
//                 status: response.verdict ? 'graded' : 'pending',
//             })
//         )

//         return {
//             id: submission.id,
//             completedAt: submission.completedAt,
//             quizTitle: quiz?.title || '',
//             timeElapsed: submission.timeElapsed,
//             timeLimit: submission.timeLimit,
//             grade: submission.grade,
//             letterGrade: submission.letterGrade,
//             responses, // You might want to load these on demand
//             status: submission.grade ? 'graded' : 'pending',
//         }
//     })
// }
