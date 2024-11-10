import { OpenAI } from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { z } from 'zod'

export type GenerateChatCompletionOptions<T> = {
    apiKey: string
    responseFormatName: string
    schema: z.ZodType<T>
    messages: ChatCompletionMessageParam[]
    signal?: AbortSignal
}

export async function generateChatCompletion<T>({
    apiKey,
    messages,
    schema,
    responseFormatName,
    signal,
}: GenerateChatCompletionOptions<T>): Promise<T> {
    const openai = new OpenAI({ apiKey })
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
