import { useUserSettings } from '@renderer/hooks/use-user-settings'
import { OpenAI } from 'openai'
import { createContext, useContext, useEffect, useMemo } from 'react'

export interface OpenAIContext {
    openai: OpenAI
}

const OpenAIContext = createContext<OpenAIContext | undefined>(undefined)

export function OpenAIProvider({ children }: { children: React.ReactNode }) {
    const { settings } = useUserSettings()
    console.log('OpenAIProvider settings ==>', settings)
    const openai = new OpenAI({
        apiKey: 'My api key',
        dangerouslyAllowBrowser: true,
    })
    const openaiApiKey = useMemo(
        () => import.meta.env.VITE_OPENAI_API_KEY || settings.openaiApiKey || 'My api key',
        [settings]
    )
    useEffect(() => {
        // Note, the api key cannot be null and must have a dummy string
        openai.apiKey = openaiApiKey
        console.log('openaiApiKey ==>', openaiApiKey)
    }, [openaiApiKey])
    return <OpenAIContext.Provider value={{ openai }}>{children}</OpenAIContext.Provider>
}

export function useOpenAI(): OpenAIContext {
    const context = useContext(OpenAIContext)
    if (!context) {
        throw new Error('useOpenAI must be used within an OpenAIProvider')
    }
    return context
}
