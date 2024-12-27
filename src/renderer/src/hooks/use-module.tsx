import { SimpleFile } from '@noggin/types/electron-types'
import { Mod } from '@noggin/types/module-types'
import { Quiz, Submission } from '@noggin/types/quiz-types'
import { createContext, useContext } from 'react'

export type ModuleContextType = {
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
    getLatestModuleQuiz: (moduleId: string) => Promise<Quiz>
    getModuleSubmissions: (moduleSlug: string) => Promise<Submission[]>
    getQuizSubmissions: (moduleSlug: string, quizId: string) => Promise<Submission[]>
}

export const ModuleContext = createContext<ModuleContextType>({
    ...window.api.modules,
    readModuleBySlug: window.api.modules.readModuleBySlug,
    saveModuleQuiz: window.api.modules.saveModuleQuiz,
    deleteModuleQuiz: window.api.modules.deleteModuleQuiz,
    readModuleQuiz: window.api.modules.readModuleQuiz,
    readModuleSubmission: window.api.modules.readModuleSubmission,
    saveModuleSubmission: window.api.modules.saveModuleSubmission,
    getQuizAttemptCount: window.api.modules.getQuizAttemptCount,
    getLatestModuleQuiz: window.api.modules.getLatestModuleQuiz,
    getModuleSubmissions: window.api.modules.getModuleSubmissions,
    getQuizSubmissions: window.api.modules.getQuizSubmissions,
})

export function ModuleProvider({ children }: { children: React.ReactNode }) {
    return <ModuleContext.Provider value={window.api.modules}>{children}</ModuleContext.Provider>
}

export function useModule() {
    return useContext(ModuleContext)
}
