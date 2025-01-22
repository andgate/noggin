import { Library, LibraryMetadata } from '@noggin/types/library-types'
import { createContext, useContext } from 'react'

export type LibraryContextType = {
    getRegisteredLibraries: () => Promise<string[]>
    registerLibrary: (libraryPath: string) => Promise<void>
    unregisterLibrary: (libraryPath: string) => Promise<void>
    createLibrary: (libraryPath: string, metadata: LibraryMetadata) => Promise<void>
    readLibrary: (libraryPath: string) => Promise<Library>
    readLibraryMetadata: (libraryPath: string) => Promise<LibraryMetadata>
    getAllLibraries: () => Promise<Library[]>
}

export const LibraryContext = createContext<LibraryContextType>({
    ...window.api.library,
})

export function LibraryProvider({ children }: { children: React.ReactNode }) {
    return <LibraryContext.Provider value={window.api.library}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
    return useContext(LibraryContext)
}
