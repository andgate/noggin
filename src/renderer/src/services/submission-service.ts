import { responses, submissions } from '@noggin/drizzle/schema'
import db from '@renderer/db'
import { Quiz, Submission, SubmissionId } from '@renderer/types/quiz-view-types'
import { eq } from 'drizzle-orm'
import { GradedSubmission } from '../types/quiz-generation-types'

export interface SubmitQuizOptions {
    quiz: Quiz
    gradedSubmission: GradedSubmission
}

export const submitQuiz = async ({
    quiz,
    gradedSubmission,
}: SubmitQuizOptions): Promise<SubmissionId> => {
    console.log('evaluating quiz', { quiz, gradedSubmission })
    // Wrap operations in a transaction
    const submission = await db.transaction(async (tx) => {
        // 1. Store the submission in the database
        const [newSubmission] = await tx
            .insert(submissions)
            .values({
                quizId: quiz.id,
                grade: gradedSubmission.grade,
            })
            .returning()

        // 2. Store the responses in the database
        await tx.insert(responses).values(
            gradedSubmission.responses.map((response, index) => ({
                quizId: quiz.id,
                submissionId: newSubmission.id,
                questionId: quiz.questions[index].id,
                response: response.response,
                score: response.score,
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
        createdAt: submission.createdAt,
        quizTitle: submission.quiz.title,
        grade: submission.grade,
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
            response: response.response,
            score: response.score,
            feedback: response.feedback,
        })),
    }
}
