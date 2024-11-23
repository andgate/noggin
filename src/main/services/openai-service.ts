import { OpenAI } from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { z } from 'zod'

export type GenerateChatCompletionOptions<T> = {
    apiKey?: string
    responseFormatName: string
    schema: z.ZodType<T>
    messages: ChatCompletionMessageParam[]
    signal?: AbortSignal
}

// TODO Return structured openai error types for better UI.
// That way we can show a specific error message to the user.
export async function generateChatCompletion<T>({
    apiKey,
    messages,
    schema,
    responseFormatName,
    signal,
}: GenerateChatCompletionOptions<T>): Promise<T> {
    // Note, the api key cannot be null and must have a dummy string
    const openai = new OpenAI({ apiKey: apiKey || 'My api key', dangerouslyAllowBrowser: true })
    const completion = await openai.beta.chat.completions.parse(
        {
            model: 'gpt-4o', // NOTE structured outputs are only supported on gpt-4o
            messages,
            response_format: zodResponseFormat(schema, responseFormatName),
        },
        { signal }
    )
    console.debug('Received API response', {
        hasChoices: completion.choices.length > 0,
        hasParsedMessage: !!completion.choices[0]?.message?.parsed,
    })

    if (!completion.choices[0]?.message?.parsed) {
        console.error('API response missing parsed message')
        throw new Error('Failed to generate completion')
    }
    return completion.choices[0].message.parsed
}
