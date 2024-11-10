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
    apiKey: string
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
        console.log('Starting quiz generation with options:', {
            questionCount: options.questionCount,
            questionTypes: options.questionTypes,
            existingQuestionsCount: options.existingQuestions.length,
        })

        let questions: (GeneratedQuestion | undefined)[] = Array(options.questionCount).fill(
            undefined
        )
        let title: string = ''

        console.log('Initialized questions array with length:', questions.length)

        while (questions.some((q) => q === undefined)) {
            // Generate batch of questions
            const remainingQuestions = questions.filter((q) => q === undefined).length
            console.log(`Generating batch, ${remainingQuestions} questions remaining`)

            const { title: quizTitle, questions: batchQuestions } = yield generateQuizBatch(options)

            console.log('Received batch:', {
                title: quizTitle,
                batchSize: batchQuestions?.length ?? 0,
            })

            if (!batchQuestions) {
                console.error('Failed to generate questions batch')
                throw new Error('Failed to generate questions!')
            }

            // Add batch questions to questions array, replacing undefined values
            const unfilledIndex = questions.findIndex((q) => q === undefined)
            console.log('Filling questions starting at index:', unfilledIndex)

            batchQuestions?.forEach((q, index) => {
                if (unfilledIndex + index < options.questionCount) {
                    questions[unfilledIndex + index] = q
                }
            })

            title = quizTitle || title // take the latest title, if any
            console.log('Updated quiz state:', {
                title,
                completedQuestions: questions.filter((q) => q !== undefined).length,
                totalQuestions: questions.length,
            })

            yield { title, questions }
        }

        console.log('Quiz generation completed')
        return { title, questions }
    }

export interface GenerateQuizBatchOptions {
    apiKey: string
    sources: string[]
    existingQuestions: GeneratedQuestion[]
    questionTypes: string[]
    questionCount: number
    signal?: AbortSignal
}

export const generateQuizBatch = async ({
    apiKey,
    sources,
    existingQuestions,
    questionTypes,
    questionCount,
    signal,
}: GenerateQuizBatchOptions): Promise<GeneratedQuiz> => {
    console.log('generateQuizBatch called =>', {
        sourcesCount: sources.length,
        existingQuestionsCount: existingQuestions.length,
        questionTypes,
        questionCount,
    })
    const prompt = generateQuizPrompt(sources, existingQuestions, questionCount, questionTypes)
    const completion = await generateChatCompletion({
        apiKey,
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

    console.log('quiz generated ==>', {
        title: completion.title,
        questionCount: completion.questions?.length,
    })

    return completion
}
