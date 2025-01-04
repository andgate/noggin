import { Part } from '@google/generative-ai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { z } from 'zod'
import { Mod, ModuleMetadata, ModuleOverview, ModuleStats } from './module-types'
import { GradedSubmission } from './quiz-generation-types'
import { Quiz, Submission } from './quiz-types'
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
    writeModuleSource: (modPath: string, sourceFile: SimpleFile) => Promise<string>
    deleteModuleSource: (sourcePath: string) => Promise<void>
    readModuleBySlug: (moduleSlug: string) => Promise<Mod>
    saveModuleQuiz: (moduleSlug: string, quiz: Quiz) => Promise<void>
    deleteModuleQuiz: (moduleSlug: string, quizId: string) => Promise<void>
    readModuleQuiz: (moduleSlug: string, quizId: string) => Promise<Quiz>
    readModuleSubmission: (
        moduleSlug: string,
        quizId: string,
        attempt: number
    ) => Promise<Submission>
    saveModuleSubmission: (moduleSlug: string, submission: Submission) => Promise<void>
    getQuizAttemptCount: (moduleSlug: string, quizId: string) => Promise<number>
    getLatestModuleQuiz: (moduleSlug: string) => Promise<Quiz>
    getModuleSubmissions: (moduleSlug: string) => Promise<Submission[]>
    getQuizSubmissions: (moduleSlug: string, quizId: string) => Promise<Submission[]>
    getModuleStats: (moduleSlug: string) => Promise<ModuleStats>
    saveModuleStats: (moduleSlug: string, stats: ModuleStats) => Promise<void>
    getAllModuleStats: () => Promise<ModuleStats[]>
    getDueModules: () => Promise<Mod[]>
    getModuleOverviews: () => Promise<ModuleOverview[]>
    readModuleMetadata: (modPath: string) => Promise<ModuleMetadata>
    writeModuleMetadata: (modPath: string, metadata: ModuleMetadata) => Promise<void>
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

export interface GenerateQuizOptions {
    sources: string[]
    numQuestions: number
    includeMultipleChoice: boolean
    includeWritten: boolean
}

interface GenerateAPI {
    analyzeContent: (files: SimpleFile[]) => Promise<{
        title: string
        overview: string
        slug: string
    }>
    generateQuiz: (options: GenerateQuizOptions) => Promise<Quiz>
    gradeSubmission: (submission: Submission) => Promise<GradedSubmission>
}

interface ModuleExplorerAPI {
    showContextMenu: (moduleId: string) => Promise<void>
}

export interface NogginElectronAPI {
    store: StoreAPI
    modules: ModuleAPI
    openai: OpenAIAPI
    filesystem: FilesystemAPI
    gemini: GeminiAPI
    generate: GenerateAPI
    moduleExplorer: ModuleExplorerAPI
}
