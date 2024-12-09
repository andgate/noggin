import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { z } from 'zod'
import { NogginStoreSchema } from './store-types'

interface StoreAPI {
    get: (key: keyof NogginStoreSchema) => Promise<any>
    set: (key: keyof NogginStoreSchema, value: any) => Promise<void>
    delete: (key: keyof NogginStoreSchema) => Promise<void>
    clear: () => Promise<void>
}

interface ModuleAPI {
    list: () => Promise<string[]>
    load: (modulePath: string) => Promise<any>
    add: (modulePath: string) => Promise<void>
    delete: (modulePath: string) => Promise<void>
}

interface OpenAIChatOptions<T> {
    apiKey?: string
    messages: ChatCompletionMessageParam[]
    schema: z.ZodType<T>
    responseFormatName: string
    signal?: AbortSignal
}

interface OpenAIAPI {
    chat: <T>(options: OpenAIChatOptions<T>) => Promise<T>
}

interface DialogAPI {
    showDirectoryPicker: () => Promise<string | undefined>
    handleFolderDrop: (paths: string[]) => Promise<string[]>
}

export interface NogginElectronAPI {
    store: StoreAPI
    modules: ModuleAPI
    openai: OpenAIAPI
    dialog: DialogAPI
}
