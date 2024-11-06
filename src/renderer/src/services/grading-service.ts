import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod.mjs'
import { z } from 'zod'
import {
    GradedResponse,
    gradedResponseSchema,
    GradedSubmission,
} from '../types/quiz-generation-types'
import { Question, Quiz } from '../types/quiz-view-types'

const gradeQuizQuestionPrompt = (
    sources: string[],
    question: Question,
    response: string
): string => `\
    \n\n${sources.join('\n\n---\n\n')}

    ---

    Please grade the following question and response based on the content above.

    Question: ${question.question}
    Response: ${response}
`

export interface GradeQuizOptions {
    quiz: Quiz
    responses: string[]
}

export const gradeQuiz = async ({
    quiz,
    responses,
}: GradeQuizOptions): Promise<GradedSubmission> => {
    console.log('grading quiz', { quiz, responses })
    // TODO: Extract OpenAI interaction into a dedicated service
    // TODO: Add retry logic for API calls
    // TODO: Add detailed error logging
    const client = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    })

    const gradedResponses = await Promise.all(
        responses.map((response, i) =>
            gradeResponse(
                client,
                quiz.sources.map((source) => source.content),
                quiz.questions[i],
                response
            )
        )
    )

    // We could also
    const grade = gradedResponses.reduce((acc, curr) => acc + curr.score, 0)

    return { responses: gradedResponses, grade }
}

export const gradeResponse = async (
    client: OpenAI,
    sources: string[],
    question: Question,
    response: string
): Promise<GradedResponse> => {
    const prompt = gradeQuizQuestionPrompt(sources, question, response)
    const completion = await client.beta.chat.completions.parse({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: 'You are a helpful professor. Only use the schema for graded responses.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
        response_format: zodResponseFormat(
            z.object({ newQuestion: gradedResponseSchema }),
            'gradedResponse'
        ),
    })

    const message = completion.choices[0]?.message
    if (message?.parsed) {
        return message.parsed.newQuestion
    } else {
        console.error(message.refusal)
        throw new Error('Failed to generate quiz')
    }
}
