import { Part } from '@google/generative-ai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { z } from 'zod'
import { Mod } from './module-types'
import { NogginStoreSchema } from './store-types'

interface StoreAPI {
    get: (key: keyof NogginStoreSchema) => Promise<any>
    set: (key: keyof NogginStoreSchema, value: any) => Promise<void>
    delete: (key: keyof NogginStoreSchema) => Promise<void>
    clear: () => Promise<void>
}

interface ModuleAPI {
    getRegisteredPaths: () => Promise<string[]>
    registerModulePath: (modulePath: string) => Promise<void>
    unregisterModulePath: (modulePath: string) => Promise<void>
    readModuleData: (modulePath: string) => Promise<Mod>
    writeModuleData: (modulePath: string, mod: Mod) => Promise<void>
    removeModule: (modulePath: string) => Promise<void>
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

export interface SimpleFile {
    path: string
    name: string
    size: number
    modifiedAt: number
    isDirectory: boolean
    data?: string
}

interface FilesystemAPI {
    showDirectoryPicker: () => Promise<SimpleFile[]>
    showFilePicker: (fileTypes?: { name: string; extensions: string[] }[]) => Promise<SimpleFile[]>
    getFileInfo: (filepath: string, loadData?: boolean) => Promise<SimpleFile>
}

export type GenerateContentOptions<T> = {
    parts: Part[]
    schema: z.ZodType<T>
}

interface GeminiAPI {
    generateContent: <T>(options: GenerateContentOptions<T>) => Promise<T>
    uploadFiles: (files: { path: string; mimeType: string }[]) => Promise<
        Array<{
            uri: string
            mimeType: string
        }>
    >
}

interface GenerateAPI {
    analyzeContent: (files: SimpleFile[]) => Promise<{
        title: string
        overview: string
        slug: string
    }>
}

export interface NogginElectronAPI {
    store: StoreAPI
    modules: ModuleAPI
    openai: OpenAIAPI
    filesystem: FilesystemAPI
    gemini: GeminiAPI
    generate: GenerateAPI
}
