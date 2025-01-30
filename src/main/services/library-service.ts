import { ensureDir } from '@noggin/shared/fs-extra'
import { slugify } from '@noggin/shared/slug'
import { Library, LibraryMetadata } from '@noggin/types/library-types'
import * as fs from 'fs/promises'
import * as path from 'path'
import { getStoreValue, setStoreValue } from './store-service'

export async function getRegisteredLibraries(): Promise<string[]> {
    const settings = await getStoreValue('userSettings')
    return settings.libraryPaths
}

export async function registerLibrary(libraryPath: string): Promise<void> {
    const settings = await getStoreValue('userSettings')
    const normalizedPath = path.normalize(libraryPath).replace(/\\/g, '/')
    if (
        !settings.libraryPaths.some((p) => path.normalize(p).replace(/\\/g, '/') === normalizedPath)
    ) {
        setStoreValue('userSettings', {
            ...settings,
            libraryPaths: [...settings.libraryPaths, libraryPath],
        })
    }
}

export async function unregisterLibrary(libraryPath: string): Promise<void> {
    const settings = await getStoreValue('userSettings')
    setStoreValue('userSettings', {
        ...settings,
        libraryPaths: settings.libraryPaths.filter((p) => p !== libraryPath),
    })
}

export async function createLibrary(libraryPath: string, metadata: LibraryMetadata): Promise<void> {
    const normalizedPath = path.normalize(libraryPath).replace(/\\/g, '/')
    // Ensure the library directory exists
    await ensureDir(normalizedPath)
    const libPath = path.join(normalizedPath, '.lib').replace(/\\/g, '/')
    await ensureDir(libPath)

    // Write metadata
    const metadataPath = path.join(normalizedPath, '.lib', 'meta.json').replace(/\\/g, '/')
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
