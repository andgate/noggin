import { Part } from '@google/generative-ai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { z } from 'zod'
import { Library } from './library-types'
import { Module } from './module-types'
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
    createModule: (
        libraryId: string,
        moduleName: string,
        moduleOverview: string,
        sourcePaths: SimpleFile[]
    ) => Promise<string>
    getModule: (moduleId: string) => Promise<Module>
    deleteModule: (moduleId: string) => Promise<void>
}

interface QuizAPI {
    createQuiz: (libraryId: string, moduleId: string, quiz: Quiz) => Promise<string>
    getQuiz: (quizId: string) => Promise<Quiz>
    deleteQuiz: (quizId: string) => Promise<void>
    getQuizAttemptCount: (quizId: string) => Promise<number>
    getQuizByLastAttempt: (moduleId: string) => Promise<Quiz>
}

interface SubmissionAPI {
    createSubmission: (
        libraryId: string,
        moduleId: string,
        submission: Submission
    ) => Promise<string>
    getSubmissionById: (moduleId: string, submissionId: string) => Promise<Submission>
    getSubmissionByAttempt: (moduleId: string, attempt: number) => Promise<Submission>
    getSubmissions: (moduleId: string) => Promise<Submission[]>
    getSubmissionsByQuiz: (quizId: string) => Promise<Submission[]>
    getModuleSubmissions: (libraryId: string, moduleId: string) => Promise<Submission[]>
    getQuizSubmissions: (
        libraryId: string,
        moduleId: string,
        quizId: string
    ) => Promise<Submission[]>
}

interface PracticeFeedAPI {
    getDueModules: () => Promise<Module[]>
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
    showLibraryContextMenu: (libraryId: string) => Promise<void>
}

interface LibraryAPI {
    saveLibrary: (library: Library) => Promise<void>
    readLibrary: (libraryId: string) => Promise<Library>
    readAllLibraries: () => Promise<Library[]>
    deleteLibrary: (libraryId: string) => Promise<void>
}

interface PathAPI {
    join: (...paths: string[]) => Promise<string>
}

export interface NogginElectronAPI {
    store: StoreAPI
    modules: ModuleAPI
    quiz: QuizAPI
    submission: SubmissionAPI
    path: PathAPI
    openai: OpenAIAPI
    filesystem: FilesystemAPI
    gemini: GeminiAPI
    generate: GenerateAPI
    moduleExplorer: ModuleExplorerAPI
    library: LibraryAPI
    practiceFeed: PracticeFeedAPI
}
