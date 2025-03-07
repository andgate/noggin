import { Part } from '@google/generative-ai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { z } from 'zod'
import { Library, LibraryMetadata } from './library-types'
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
    readModuleData: (modulePath: string) => Promise<Mod>
    writeModuleData: (modulePath: string, mod: Mod) => Promise<void>
    removeModule: (modulePath: string) => Promise<void>
    writeModuleSource: (modPath: string, sourceFile: SimpleFile) => Promise<string>
    deleteModuleSource: (sourcePath: string) => Promise<void>
    readModuleById: (libraryId: string, moduleId: string) => Promise<Mod>
    saveModuleQuiz: (libraryId: string, moduleId: string, quiz: Quiz) => Promise<void>
    deleteModuleQuiz: (libraryId: string, moduleId: string, quizId: string) => Promise<void>
    readModuleQuiz: (libraryId: string, moduleId: string, quizId: string) => Promise<Quiz>
    readModuleSubmission: (
        libraryId: string,
        moduleId: string,
        quizId: string,
        attempt: number
    ) => Promise<Submission>
    saveModuleSubmission: (
        libraryId: string,
        moduleId: string,
        submission: Submission
    ) => Promise<void>
    getQuizAttemptCount: (libraryId: string, moduleId: string, quizId: string) => Promise<number>
    getLatestModuleQuiz: (libraryId: string, moduleId: string) => Promise<Quiz>
    getModuleSubmissions: (libraryId: string, moduleId: string) => Promise<Submission[]>
    getQuizSubmissions: (
        libraryId: string,
        moduleId: string,
        quizId: string
    ) => Promise<Submission[]>
    getModuleStats: (libraryId: string, moduleId: string) => Promise<ModuleStats>
    saveModuleStats: (libraryId: string, moduleId: string, stats: ModuleStats) => Promise<void>
    getAllModuleStats: () => Promise<ModuleStats[]>
    getModuleOverviews: (libraryId: string) => Promise<ModuleOverview[]>
    readModuleMetadata: (modPath: string) => Promise<ModuleMetadata>
    writeModuleMetadata: (modPath: string, metadata: ModuleMetadata) => Promise<void>
}

interface PracticeFeedAPI {
    getDueModules: () => Promise<Mod[]>
    updateReviewSchedule: (
        libraryId: string,
        moduleId: string,
        submission: Submission
    ) => Promise<boolean>
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
    showModuleContextMenu: (libraryId: string, moduleId: string) => Promise<void>
    showLibraryContextMenu: (librarySlug: string) => Promise<void>
}

interface LibraryAPI {
    getRegisteredLibraries: () => Promise<string[]>
    registerLibrary: (libraryPath: string) => Promise<void>
    unregisterLibrary: (libraryPath: string) => Promise<void>
    createLibrary: (libraryPath: string, metadata: LibraryMetadata) => Promise<void>
    readLibrary: (libraryPath: string) => Promise<Library>
    readLibraryMetadata: (libraryPath: string) => Promise<LibraryMetadata>
    getAllLibraries: () => Promise<Library[]>
}

interface PathAPI {
    join: (...paths: string[]) => Promise<string>
}

export interface NogginElectronAPI {
    store: StoreAPI
    modules: ModuleAPI
    path: PathAPI
    openai: OpenAIAPI
    filesystem: FilesystemAPI
    gemini: GeminiAPI
    generate: GenerateAPI
    moduleExplorer: ModuleExplorerAPI
    library: LibraryAPI
    practiceFeed: PracticeFeedAPI
}
