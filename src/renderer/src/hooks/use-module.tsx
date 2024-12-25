import { SimpleFile } from '@noggin/types/electron-types'
import { Mod } from '@noggin/types/module-types'
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
}

export const ModuleContext = createContext<ModuleContextType>(window.api.modules)

export function ModuleProvider({ children }: { children: React.ReactNode }) {
    return <ModuleContext.Provider value={window.api.modules}>{children}</ModuleContext.Provider>
}

export function useModule() {
    return useContext(ModuleContext)
}
