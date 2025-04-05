import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import { GenerateContentOptions } from '@noggin/types/electron-types'
import { toGeminiSchema } from '../common/gemini-zod'
import { getStoreValue } from './store-service'

function getApiKey(): string {
    const settings = getStoreValue('userSettings')
    if (!settings) {
        throw new Error('User settings not found. Please restart the application.')
    }

    const apiKey = settings.geminiApiKey as string
    if (!apiKey) {
        throw new Error(
            'Gemini API key not set. Please set an API key in Settings > AI Configuration.'
        )
    }

    if (typeof apiKey !== 'string') {
        throw new Error('Type error: geminiApiKey must be a string')
    }

    if (apiKey.trim() === '') {
        throw new Error(
            'Gemini API key is empty. Please set a valid API key in Settings > AI Configuration.'
        )
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

export const geminiService = {
    async generateContent<T>({ parts, schema }: GenerateContentOptions<T>): Promise<T> {
        console.log('🤖 geminiService.generateContent called')
        return await generateGeminiContent({ parts, schema })
    },

    async uploadFiles(
        files: { path: string; mimeType: string }[]
    ): Promise<{ uri: string; mimeType: string }[]> {
        return await uploadFiles(files)
    },
}

export async function generateGeminiContent<T>({
    parts,
    schema,
}: GenerateContentOptions<T>): Promise<T> {
    console.log('🤖 generateGeminiContent called with schema:', schema)
    console.log(
        '🤖 Content parts summary:',
        parts.map((p) =>
            p.text
                ? `text: ${p.text.substring(0, 30)}...`
                : p.fileData
                  ? `file: ${p.fileData.mimeType}`
                  : 'unknown part'
        )
    )

    try {
        // Check API key first
        const apiKey = getApiKey()
        console.log('🤖 API key validated, proceeding to initialize model')

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-pro-preview-03-25',
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: toGeminiSchema(schema),
            },
        })

        console.log('🤖 Calling model.generateContent')

        // Create a timeout promise to avoid hanging indefinitely
        const timeout = new Promise<never>((_, reject) => {
            setTimeout(
                () => reject(new Error('Gemini API request timed out after 30 seconds')),
                30000
            )
        })

        try {
            // Race the API call against the timeout
            const result = (await Promise.race([model.generateContent(parts), timeout])) as any

            console.log('🤖 model.generateContent returned successful response')

            if (!result || !result.response) {
                throw new Error('Empty response from Gemini API')
            }

            const responseText = result.response.text()
            console.log('🤖 Parsing response text:', responseText.substring(0, 100) + '...')

            try {
                const jsonData = JSON.parse(responseText)
                const parsed = schema.parse(jsonData)
                console.log('🤖 Schema validation passed, returning parsed result')
                return parsed
            } catch (parseError: unknown) {
                console.error('🤖 JSON parse or schema validation error:', parseError)
                console.error('🤖 Raw response text:', responseText)
                throw new Error(
                    `Failed to parse Gemini response: ${parseError instanceof Error ? parseError.message : String(parseError)}`
                )
            }
        } catch (callError: unknown) {
            console.error('🤖 Error during model.generateContent call:', callError)

            // Check for network-related errors
            if (callError instanceof Error) {
                if (callError.message.includes('timed out')) {
                    throw new Error(
                        `Gemini API request timed out. Please check your internet connection and try again with a smaller file.`
                    )
                }

                if (
                    callError.message.includes('network') ||
                    callError.message.includes('ECONNREFUSED')
                ) {
                    throw new Error(
                        `Network error connecting to Gemini API: ${callError.message}. Please check your internet connection.`
                    )
                }
            }

            throw callError
        }
    } catch (error: unknown) {
        console.error('🤖 Error generating structured content:', error)
        if (error instanceof Error && error.message?.includes('api key')) {
            throw new Error('Invalid or missing Gemini API key. Please check your settings.')
        }
        throw error
    }
}
