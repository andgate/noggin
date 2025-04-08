import { Library } from '@noggin/types/library-types'
import { ipcMain } from 'electron'
import {
    deleteLibrary,
    readAllLibraries,
    readLibrary,
    saveLibrary,
} from '../services/library-service'

export function registerLibraryIPC(): void {
    ipcMain.handle(
        'library:saveLibrary',
        (_, library: Library): Promise<void> => saveLibrary(library)
    )

    ipcMain.handle(
        'library:readLibrary',
        (_, librarySlug: string): Promise<Library> => readLibrary(librarySlug)
    )

    ipcMain.handle('library:readAllLibraries', (): Promise<Library[]> => readAllLibraries())

    ipcMain.handle(
        'library:deleteLibrary',
        (_, librarySlug: string): Promise<void> => deleteLibrary(librarySlug)
    )
}
