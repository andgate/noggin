import { AbortableGenerativeFunction } from '@renderer/hooks/use-generative'
import { zodResponseFormat } from 'openai/helpers/zod.mjs'
import { z } from 'zod'
import {
    GradedResponse,
    gradedResponseSchema,
    GradedSubmission,
    gradedSubmissionSchema,
    PartialGradedSubmission,
} from '../types/quiz-generation-types'
import { Question, Quiz } from '../types/quiz-view-types'
import { generateChatCompletion } from './openai-service'

const generateGradedSubmissionPrompt = (
    sources: string[],
    quiz: Quiz,
    responses: GradedResponse[]
): string => `\
    ---
    Sources
    ---
    Please focus on the following source material(s):
    \n\n${sources.join('\n\n---\n\n')}

    ---
    Student Quiz Submission
    ---
    Quiz Title: ${quiz.title}
    Questions and Responses:
    ${quiz.questions
        .map(
            (q, i) => `
    Question ${i + 1}: ${q.question}
    Response: ${responses[i]}
    ${
        q.questionType === 'multiple_choice'
            ? `Options:\n${q.choices.map((c) => `- ${c.optionText}${c.isCorrect ? ' (correct)' : ''}`).join('\n')}`
            : ''
    }
    `
        )
        .join('\n---\n')}

    ---
    Grading Instructions
    ---

    Please grade the following quiz responses. For each response:
    - Provide a score between 0 and 100
    - Provide specific feedback explaining the score
    - Consider the source material (see above) carefully when evaluating answers
`

export interface GenerateGradesOptions {
    quiz: Quiz
    responses: GradedResponse[]
    controller?: AbortController
}

export const generateGradedSubmission: AbortableGenerativeFunction<
    GenerateGradesOptions,
    PartialGradedSubmission
> = async function* ({ quiz, responses, controller }, signal) {
    // Initialize responses array with undefined values
    let gradedResponses: (GradedResponse | undefined)[] = Array(responses.length).fill(undefined)

    // Grade each response one at a time
    for (let i = 0; i < responses.length; i++) {
        if (signal.aborted) break

        const response = await generateGradedResponses(
            quiz.sources.map((source) => source.content),
            quiz,
            gradedResponses.filter((r): r is GradedResponse => !!r),
            controller
        )

        gradedResponses[i] = response

        // Calculate current grade based on completed responses
        const completedResponses = gradedResponses.filter((r): r is GradedResponse => !!r)
        const currentGrade =
            completedResponses.reduce((acc, curr) => acc + curr.score, 0) / responses.length

        yield {
            responses: gradedResponses,
            grade: currentGrade,
        }
    }

    // Return final graded submission
    const finalGrade =
        gradedResponses.reduce((acc, curr) => acc + (curr?.score || 0), 0) / responses.length
    return {
        responses: gradedResponses as GradedResponse[],
        grade: finalGrade,
    }
}
async function generateGradedResponses(
    sources: string[],
    quiz: Quiz,
    responses: GradedResponse[],
    controller?: AbortController
): Promise<GradedSubmission> {
    console.log('generateGradedResponses called =>', {
        sources,
        quiz,
        responses,
    })
    const prompt = generateGradedSubmissionPrompt(sources, quiz, responses)
    return generateChatCompletion({
        responseFormatName: 'gradedSubmissionResponse',
        schema: gradedSubmissionSchema,
        messages: [
            {
                role: 'system',
                content:
                    'You are a helpful professor. Only use the schema for graded submission responses.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
        controller,
    })
}
