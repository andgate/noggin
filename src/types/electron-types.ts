import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { z } from 'zod'
import { NogginStoreSchema } from './store-types'

export interface NogginElectronAPI {
    store: {
        get: (key: keyof NogginStoreSchema) => Promise<any>
        set: (key: keyof NogginStoreSchema, value: any) => Promise<void>
        delete: (key: keyof NogginStoreSchema) => Promise<void>
        clear: () => Promise<void>
    }
    modkit: {
        list: () => Promise<string[]>
        load: (modkitPath: string) => Promise<any>
        add: (modkitPath: string) => Promise<void>
        delete: (modkitPath: string) => Promise<void>
    }
    openai: {
        chat: <T>(options: {
            apiKey?: string
            messages: ChatCompletionMessageParam[]
            schema: z.ZodType<T>
            responseFormatName: string
            signal?: AbortSignal
        }) => Promise<T>
    }
}
