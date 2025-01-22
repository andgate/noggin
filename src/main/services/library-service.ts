import { ensureDir } from '@noggin/common/fs-extra'
import { slugify } from '@noggin/common/slug'
import { Library, LibraryMetadata } from '@noggin/types/library-types'
import * as fs from 'fs/promises'
import * as path from 'path'
import { store } from './store-service'

// Update store schema to use library paths instead of module paths
const LIBRARY_PATHS_KEY = 'libraryPaths'

export async function getRegisteredLibraries(): Promise<string[]> {
    return store.get(LIBRARY_PATHS_KEY, [])
}

export async function registerLibrary(libraryPath: string): Promise<void> {
    const paths = await getRegisteredLibraries()
    const normalizedPath = path.normalize(libraryPath)
    if (!paths.includes(normalizedPath)) {
        store.set(LIBRARY_PATHS_KEY, [...paths, normalizedPath])
    }
}

export async function unregisterLibrary(libraryPath: string): Promise<void> {
    const paths = await getRegisteredLibraries()
    store.set(
        LIBRARY_PATHS_KEY,
        paths.filter((p) => p !== libraryPath)
    )
}

export async function createLibrary(libraryPath: string, metadata: LibraryMetadata): Promise<void> {
    // Ensure the library directory exists
    await ensureDir(libraryPath)
    await ensureDir(path.join(libraryPath, '.lib'))

    // Write metadata
    const metadataPath = path.join(libraryPath, '.lib', 'meta.json')
    const metadataWithSlug = {
        ...metadata,
        slug: slugify(metadata.name),
    }
    await fs.writeFile(metadataPath, JSON.stringify(metadataWithSlug, null, 2))

    // Register the library
    await registerLibrary(libraryPath)
}

export async function readLibraryMetadata(libraryPath: string): Promise<LibraryMetadata> {
    const metadataPath = path.join(libraryPath, '.lib', 'meta.json')
    const data = await fs.readFile(metadataPath, 'utf-8')
    return JSON.parse(data)
}

export async function readLibrary(libraryPath: string): Promise<Library> {
    const metadata = await readLibraryMetadata(libraryPath)
    return {
        path: libraryPath,
        metadata,
    }
}

export async function getAllLibraries(): Promise<Library[]> {
    const paths = await getRegisteredLibraries()
    const libraries = await Promise.all(
        paths.map(async (path) => {
            try {
                return await readLibrary(path)
            } catch (error) {
                console.error(`Failed to read library at ${path}:`, error)
                return null
            }
        })
    )
    return libraries.filter((lib): lib is Library => lib !== null)
}
