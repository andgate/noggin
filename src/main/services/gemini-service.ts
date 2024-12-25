import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import { GenerateContentOptions } from '@noggin/types/electron-types'
import { toGeminiSchema } from '../common/gemini-zod'
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

async function uploadFiles(files: { path: string; mimeType: string }[]) {
    const fileManager = new GoogleAIFileManager(getApiKey())

    const uploadedFiles = await Promise.all(
        files.map(async (file) => {
            const response = await fileManager.uploadFile(file.path, {
                mimeType: file.mimeType,
            })
            return {
                uri: response.file.uri,
                mimeType: response.file.mimeType,
            }
        })
    )

    return uploadedFiles
}

export async function generateGeminiContent<T>({
    parts,
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
        const result = await model.generateContent(parts)
        const parsed = schema.parse(JSON.parse(result.response.text()))
        return parsed
    } catch (error) {
        console.error('Error generating structured content:', error)
        throw error
    }
}

export const geminiService = {
    generateContent: generateGeminiContent,
    uploadFiles,
}
