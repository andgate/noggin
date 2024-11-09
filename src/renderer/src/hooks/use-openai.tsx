import { useUserSettings } from '@renderer/hooks/use-user-settings'
import { OpenAI } from 'openai'
import { createContext, useContext } from 'react'

export interface OpenAIContext {
    openai: OpenAI
}

const OpenAIContext = createContext<OpenAIContext | undefined>(undefined)

export function OpenAIProvider({ children }: { children: React.ReactNode }) {
    const { settings } = useUserSettings()
    console.log('OpenAIProvider settings ==>', settings)
    const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY || settings.openaiApiKey || undefined,
        dangerouslyAllowBrowser: true,
    })
    return <OpenAIContext.Provider value={{ openai }}>{children}</OpenAIContext.Provider>
}

export function useOpenAI(): OpenAIContext {
    const context = useContext(OpenAIContext)
    if (!context) {
        throw new Error('useOpenAI must be used within an OpenAIProvider')
    }
    return context
}
