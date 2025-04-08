import { Library } from '@noggin/types/library-types'
import * as fs from 'fs/promises'
import * as path from 'path'
import {
    getLibraryPathById,
    getRegisteredLibraries,
    libraryExists,
    registerLibrary,
    unregisterLibrary,
} from './library-registry'
import { extractLibraryMetadata } from './types'
import { readLibraryMetadataFile, writeLibraryMetadataFile } from './utils'

export async function saveLibrary(library: Library) {
    const metadata = extractLibraryMetadata(library)
    await writeLibraryMetadataFile(library.path, metadata)

    // Register the library if it doesn't exist
    const doesLibraryExist = await libraryExists(library.path)
    if (!doesLibraryExist) {
        await registerLibrary(library.path, library.id)
    }
}

export async function readLibrary(libraryId: string): Promise<Library> {
    const libraryPath = await getLibraryPathById(libraryId)

    if (!libraryPath) {
        throw new Error(`Library with ID "${libraryId}" not found`)
    }

    const metadata = await readLibraryMetadataFile(libraryPath)
    return {
        path: libraryPath,
        ...metadata,
    }
}

export async function readAllLibraries(): Promise<Library[]> {
    const paths = await getRegisteredLibraries()
    const libraries = await Promise.all(
        paths.map(async (libraryPath) => {
            const metadata = await readLibraryMetadataFile(libraryPath)
            return {
                path: libraryPath,
                ...metadata,
            }
        })
    )
    return libraries
}

export async function deleteLibrary(libraryId: string): Promise<void> {
    const libraryPath = await getLibraryPathById(libraryId)

    if (!libraryPath) {
        throw new Error(`Library with ID "${libraryId}" not found`)
    }

    // Unregister the library
    await unregisterLibrary(libraryId)

    // Finally, delete the library directory using the path obtained
    const normalizedPath = path.normalize(libraryPath).replace(/\\/g, '/')
    await fs.rm(normalizedPath, { recursive: true, force: true })
}
