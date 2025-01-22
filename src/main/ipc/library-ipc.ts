import { Library, LibraryMetadata } from '@noggin/types/library-types'
import { ipcMain } from 'electron'
import {
    createLibrary,
    getAllLibraries,
    getRegisteredLibraries,
    readLibrary,
    readLibraryMetadata,
    registerLibrary,
    unregisterLibrary,
} from '../services/library-service'

export function registerLibraryIPC(): void {
    ipcMain.handle(
        'library:getRegisteredLibraries',
        (): Promise<string[]> => getRegisteredLibraries()
    )

    ipcMain.handle(
        'library:registerLibrary',
        (_, libraryPath: string): Promise<void> => registerLibrary(libraryPath)
    )

    ipcMain.handle(
        'library:unregisterLibrary',
        (_, libraryPath: string): Promise<void> => unregisterLibrary(libraryPath)
    )

    ipcMain.handle(
        'library:createLibrary',
        (_, libraryPath: string, metadata: LibraryMetadata): Promise<void> =>
            createLibrary(libraryPath, metadata)
    )

    ipcMain.handle(
        'library:readLibrary',
        (_, libraryPath: string): Promise<Library> => readLibrary(libraryPath)
    )

    ipcMain.handle(
        'library:readLibraryMetadata',
        (_, libraryPath: string): Promise<LibraryMetadata> => readLibraryMetadata(libraryPath)
    )

    ipcMain.handle('library:getAllLibraries', (): Promise<Library[]> => getAllLibraries())
}
