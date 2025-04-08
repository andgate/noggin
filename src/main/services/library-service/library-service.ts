import { Library } from '@noggin/types/library-types'
import * as fs from 'fs/promises'
import * as path from 'path'
import {
    getLibraryPathBySlug,
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
        await registerLibrary(library.path)
    }
}

export async function readLibrary(librarySlug: string): Promise<Library> {
    const libraryPath = await getLibraryPathBySlug(librarySlug)

    if (!libraryPath) {
        throw new Error(`Library with slug "${librarySlug}" not found`)
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

export async function deleteLibrary(librarySlug: string): Promise<void> {
    const libraryPath = await getLibraryPathBySlug(librarySlug)

    if (!libraryPath) {
        throw new Error(`Library with slug "${librarySlug}" not found`)
    }

    const normalizedPath = path.normalize(libraryPath).replace(/\\/g, '/')

    // Unregister the library
    await unregisterLibrary(normalizedPath)

    // Delete the library directory
    await fs.rm(normalizedPath, { recursive: true, force: true })
}
