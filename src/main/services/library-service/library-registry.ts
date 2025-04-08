import { slugify } from '@noggin/shared/slug'
import * as path from 'path'
import { getStoreValue, setStoreValue } from '../store-service'

export async function getRegisteredLibraries(): Promise<string[]> {
    const settings = getStoreValue('userSettings')
    return settings.libraryPaths
}

export async function registerLibrary(libraryPath: string): Promise<void> {
    try {
        // Update libraryPaths in userSettings
        const settings = getStoreValue('userSettings')
        const normalizedPath = path.normalize(libraryPath).replace(/\\/g, '/')
        const libraryPathsSet = new Set([...settings.libraryPaths, normalizedPath])
        const libraryPaths = Array.from(libraryPathsSet)
        setStoreValue('userSettings', { ...settings, libraryPaths })

        // Compute the slug from the library path
        const slug = slugify(libraryPath)
        // Update librarySlugIndex
        const slugIndex = getStoreValue('librarySlugIndex')
        setStoreValue('librarySlugIndex', {
            ...slugIndex,
            [slug]: normalizedPath,
        })
    } catch (error: any) {
        console.error(`Error registering library at ${libraryPath}:`, error)
        throw new Error(`Failed to register library: ${error.message}`)
    }
}

export async function unregisterLibrary(libraryPath: string): Promise<void> {
    try {
        // Update libraryPaths in userSettings
        const settings = getStoreValue('userSettings')
        const normalizedPath = path.normalize(libraryPath).replace(/\\/g, '/')
        setStoreValue('userSettings', {
            ...settings,
            libraryPaths: settings.libraryPaths.filter((p) => p !== normalizedPath),
        })

        // Compute the slug from the library path
        const slug = slugify(libraryPath)
        // Update librarySlugIndex
        const slugIndex = getStoreValue('librarySlugIndex')
        delete slugIndex[slug]
        setStoreValue('librarySlugIndex', slugIndex)
    } catch (error: any) {
        console.error(`Error unregistering library at ${libraryPath}:`, error)
        throw new Error(`Failed to unregister library: ${error.message}`)
    }
}

export async function getLibraryPathBySlug(slug: string): Promise<string | undefined> {
    const slugIndex = getStoreValue('librarySlugIndex')
    return slugIndex[slug]
}

export async function libraryExists(libraryPath: string): Promise<boolean> {
    const settings = getStoreValue('userSettings')
    return settings.libraryPaths.some((p) => p === libraryPath)
}
