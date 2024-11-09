import { responses, submissions } from '@noggin/drizzle/schema'
import { asLetterGrade, gradeResponses } from '@renderer/common/grading-helpers'
import db from '@renderer/db'
import { gradeSchema, letterGradeSchema } from '@renderer/types/grade-types'
import { Quiz, Submission, SubmissionId } from '@renderer/types/quiz-view-types'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { GradedResponse } from '../types/quiz-generation-types'

export interface SubmitQuizOptions {
    quiz: Quiz
    gradedResponses: GradedResponse[]
    timeElapsed: number
}

export const storeQuizSubmission = async ({
    quiz,
    gradedResponses,
    timeElapsed,
}: SubmitQuizOptions): Promise<SubmissionId> => {
    console.log('storing quiz submission', { quiz, gradedResponses })
    const grade = gradeResponses(gradedResponses)
    const letterGrade = asLetterGrade(grade)
    // Wrap operations in a transaction
    const submission = await db.transaction(async (tx) => {
        // 1. Store the submission in the database
        const [newSubmission] = await tx
            .insert(submissions)
            .values({
                quizId: quiz.id,
                timeLimit: quiz.timeLimit,
                timeElapsed: timeElapsed,
                grade: grade,
                letterGrade: letterGrade,
            })
            .returning()

        // 2. Store the responses in the database
        await tx.insert(responses).values(
            gradedResponses.map((response, index) => ({
                quizId: quiz.id,
                submissionId: newSubmission.id,
                questionId: quiz.questions[index].id,
                studentAnswer: response.studentAnswer,
                correctAnswer: response.correctAnswer,
                verdict: response.verdict,
                feedback: response.feedback,
            }))
        )

        return newSubmission
    })

    return submission.id
}

export const getSubmission = async (submissionId: SubmissionId): Promise<Submission> => {
    const submission = await db.query.submissions.findFirst({
        where: eq(submissions.id, submissionId),
        with: {
            quiz: true,
            responses: {
                with: {
                    question: {
                        with: {
                            choices: true,
                        },
                    },
                },
            },
        },
    })

    if (!submission) {
        throw new Error('Submission not found')
    }

    return {
        id: submission.id,
        completedAt: submission.completedAt,
        quizTitle: submission.quiz.title,
        timeElapsed: submission.timeElapsed,
        timeLimit: submission.timeLimit,
        grade: gradeSchema.parse(submission.grade),
        letterGrade: letterGradeSchema.parse(submission.letterGrade),
        responses: submission.responses.map((response) => ({
            id: response.id,
            createdAt: response.createdAt,
            quizId: submission.quizId,
            submissionId: submission.id,
            question:
                response.question.questionType === 'multiple_choice'
                    ? {
                          questionType: 'multiple_choice',
                          id: response.question.id,
                          question: response.question.question,
                          choices: response.question.choices.map((choice) => ({
                              id: choice.id,
                              optionText: choice.optionText,
                              isCorrect: !!choice.isCorrect,
                          })),
                      }
                    : {
                          questionType: 'written',
                          id: response.question.id,
                          question: response.question.question,
                      },
            studentAnswer: response.studentAnswer,
            correctAnswer: response.correctAnswer,
            verdict: z.union([z.literal('pass'), z.literal('fail')]).parse(response.verdict),
            feedback: response.feedback,
        })),
    }
}
