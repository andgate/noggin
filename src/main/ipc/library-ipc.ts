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
        (_, libraryId: string): Promise<Library> => readLibrary(libraryId)
    )

    ipcMain.handle('library:readAllLibraries', (): Promise<Library[]> => readAllLibraries())

    ipcMain.handle(
        'library:deleteLibrary',
        (_, libraryId: string): Promise<void> => deleteLibrary(libraryId)
    )
}
