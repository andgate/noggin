// TODO openai TOO MANY REQUESTS errors
// Saw this error in the console when I was testing the app.
// This should be handled by p-queue.
// Maybe we need to adjust the settings on p-queue?
import { OpenAI } from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import PQueue from 'p-queue'
import { z } from 'zod'

// Service stats interface
interface ServiceStats {
    totalRequests: number
    totalErrors: number
    responseTimes: number[]
}

// Initialize stats
const stats: ServiceStats = {
    totalRequests: 0,
    totalErrors: 0,
    responseTimes: [],
}

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    /** todo: remove this */
    dangerouslyAllowBrowser: true,
})

// Configure queue with rate limiting
const queue = new PQueue({
    concurrency: 1, // 1 request at a time
    interval: 1000, // 1 second
    intervalCap: 3, // 3 requests per second
})

// Helper to track request timing and stats
const trackRequest = async <T>(promise: Promise<T>): Promise<T> => {
    const startTime = Date.now()
    try {
        stats.totalRequests++
        const result = await promise
        stats.responseTimes.push(Date.now() - startTime)
        return result
    } catch (error) {
        stats.totalErrors++
        throw error
    }
}

export type GenerateChatCompletionOptions<T> = {
    responseFormatName: string
    schema: z.ZodType<T>
    messages: ChatCompletionMessageParam[]
    controller?: AbortController
}

export async function generateChatCompletion<T>({
    messages,
    schema,
    responseFormatName,
    controller,
}: GenerateChatCompletionOptions<T>): Promise<T> {
    const result: NonNullable<T> | void = await queue.add(
        ({ signal }) =>
            trackRequest(
                openai.beta.chat.completions
                    .parse(
                        {
                            model: 'gpt-4o',
                            messages,
                            response_format: zodResponseFormat(schema, responseFormatName),
                        },
                        { signal }
                    )
                    .then((completion) => {
                        if (!completion.choices[0]?.message?.parsed)
                            throw new Error('Failed to generate completion')
                        return completion.choices[0].message.parsed
                    })
            ),
        { signal: controller?.signal }
    )

    if (!result) throw new Error('Failed to generate completion')

    return result
}

// Stats retrieval functions
export const getServiceStats = () => ({
    ...stats,
    averageResponseTime:
        stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length || 0,
    queueSize: queue.size,
    queuePending: queue.pending,
})

export const resetServiceStats = () => {
    stats.totalRequests = 0
    stats.totalErrors = 0
    stats.responseTimes = []
}
