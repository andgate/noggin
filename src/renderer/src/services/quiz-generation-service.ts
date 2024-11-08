import { AbortableGenerativeFunction } from '@renderer/hooks/use-generative'
import {
    GeneratedQuestion,
    GeneratedQuiz,
    generatedQuizSchema,
    PartialGeneratedQuiz,
} from '../types/quiz-generation-types'
import { generateChatCompletion } from './openai-service'

const generateQuizPrompt = (
    sources: string[],
    questions: GeneratedQuestion[],
    questionCount: number,
    questionTypes: string[]
): string => `\
    ---
    Sources
    ---
    Please focus on the following source material(s):
    \n\n${sources.join('\n\n---\n\n')}

    ---

    We are writing a quiz to test a student's knowledge of the previous content.
    The quiz questions must be of the following types: ${questionTypes.join(', ')}.

    We have already generated the following questions:
    ${questions ? questions.map((question) => question.question).join('\n\n') : 'No questions generated yet.'}

    ---

    Write a quiz with a title and ${questionCount > questions.length ? questionCount - questions.length : 0} questions that are different from the ones listed above.`

export interface GenerateQuizOptions {
    sources: string[]
    existingQuestions: GeneratedQuestion[]
    questionTypes: string[]
    questionCount: number
    signal?: AbortSignal
}

export const generateQuiz: AbortableGenerativeFunction<GenerateQuizOptions, PartialGeneratedQuiz> =
    async function* (options) {
        // Initialize questions array with undefined values.
        // This is to ensure that we can yield partial results.
        let questions: (GeneratedQuestion | undefined)[] = Array(options.questionCount).fill(
            undefined
        )
        let title: string = ''

        while (questions.some((q) => q === undefined)) {
            // Generate batch of questions
            const { title: quizTitle, questions: batchQuestions } = yield generateQuizBatch(options)

            // Add batch questions to questions array, replacing undefined values
            const unfilledIndex = questions.findIndex((q) => q === undefined)
            batchQuestions?.forEach((q, index) => {
                if (unfilledIndex + index < options.questionCount) {
                    questions[unfilledIndex + index] = q
                }
            })

            title = quizTitle || title // take the latest title
            yield { title, questions }
        }

        // Finally, return the full quiz
        return { title, questions }
    }

export interface GenerateQuizBatchOptions {
    sources: string[]
    existingQuestions: GeneratedQuestion[]
    questionTypes: string[]
    questionCount: number
    signal?: AbortSignal
}

export const generateQuizBatch = async ({
    sources,
    existingQuestions,
    questionTypes,
    questionCount,
    signal,
}: GenerateQuizBatchOptions): Promise<GeneratedQuiz> => {
    console.log('generateQuizBatch called =>', {
        sources,
        existingQuestions,
        questionTypes,
        questionCount,
    })
    const prompt = generateQuizPrompt(sources, existingQuestions, questionCount, questionTypes)
    const completion = await generateChatCompletion({
        responseFormatName: 'quizResponse',
        schema: generatedQuizSchema,
        messages: [
            {
                role: 'system',
                content: 'You are a helpful professor. Only use the schema for quiz responses.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
        signal,
    })

    console.log('quiz generated ==>', completion)

    return completion
}
