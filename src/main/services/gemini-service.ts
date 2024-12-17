import { GoogleGenerativeAI } from '@google/generative-ai'
import { GenerateContentOptions } from '@noggin/types/electron-types'
import { toGeminiSchema } from 'gemini-zod'
import { store } from './store-service'

function getApiKey(): string {
    const apiKey = store.get('userSettings.geminiApiKey') as string
    if (typeof apiKey !== 'string') {
        throw new Error('Type error: geminiApiKey must be a string')
    }
    if (apiKey.trim() === '') {
        throw new Error('Gemini API key not found. Please set an API key in settings.')
    }
    return apiKey
}

export async function generateGeminiContent<T>({
    prompt,
    schema,
}: GenerateContentOptions<T>): Promise<T> {
    const genAI = new GoogleGenerativeAI(getApiKey())
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: toGeminiSchema(schema),
        },
    })

    try {
        const result = await model.generateContent(prompt)
        const parsed = schema.parse(JSON.parse(result.response.text()))
        return parsed
    } catch (error) {
        console.error('Error generating structured content:', error)
        throw error
    }
}
