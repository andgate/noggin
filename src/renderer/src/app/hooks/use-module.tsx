import { SimpleFile } from '@noggin/types/electron-types'
import { Mod, ModuleStats } from '@noggin/types/module-types'
import { Quiz, Submission } from '@noggin/types/quiz-types'
import { createContext, useContext } from 'react'

export type ModuleContextType = {
    readModuleData: (modulePath: string) => Promise<Mod>
    writeModuleData: (modulePath: string, mod: Mod) => Promise<void>
    removeModule: (modulePath: string) => Promise<void>
    writeModuleSource: (modPath: string, sourceFile: SimpleFile) => Promise<string>
    deleteModuleSource: (sourcePath: string) => Promise<void>
    readModuleBySlug: (libraryId: string, moduleSlug: string) => Promise<Mod>
    saveModuleQuiz: (libraryId: string, moduleSlug: string, quiz: Quiz) => Promise<void>
    deleteModuleQuiz: (libraryId: string, moduleSlug: string, quizId: string) => Promise<void>
    readModuleQuiz: (libraryId: string, moduleSlug: string, quizId: string) => Promise<Quiz>
    readModuleSubmission: (
        libraryId: string,
        moduleSlug: string,
        quizId: string,
        attempt: number
    ) => Promise<Submission>
    saveModuleSubmission: (
        libraryId: string,
        moduleSlug: string,
        submission: Submission
    ) => Promise<void>
    getQuizAttemptCount: (libraryId: string, moduleSlug: string, quizId: string) => Promise<number>
    getLatestModuleQuiz: (libraryId: string, moduleSlug: string) => Promise<Quiz>
    getModuleSubmissions: (libraryId: string, moduleSlug: string) => Promise<Submission[]>
    getQuizSubmissions: (
        libraryId: string,
        moduleSlug: string,
        quizId: string
    ) => Promise<Submission[]>
    getModuleStats: (libraryId: string, moduleSlug: string) => Promise<ModuleStats>
    saveModuleStats: (libraryId: string, moduleSlug: string, stats: ModuleStats) => Promise<void>
    getAllModuleStats: () => Promise<ModuleStats[]>
    getDueModules: () => Promise<Mod[]>
}

export const ModuleContext = createContext<ModuleContextType>(window.api.modules)

export function ModuleProvider({ children }: { children: React.ReactNode }) {
    return <ModuleContext.Provider value={window.api.modules}>{children}</ModuleContext.Provider>
}

export function useModule() {
    return useContext(ModuleContext)
}
