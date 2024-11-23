import { ipcMain } from 'electron'
import { generateChatCompletion } from '../services/openai-service'

export function registerOpenAIIPC(): void {
    ipcMain.handle(
        'openai:chat',
        async (_event, { apiKey, messages, schema, responseFormatName, signal }) => {
            try {
                return await generateChatCompletion({
                    apiKey,
                    messages,
                    schema,
                    responseFormatName,
                    signal,
                })
            } catch (error) {
                console.error('OpenAI chat error:', error)
                throw error
            }
        }
    )
}
