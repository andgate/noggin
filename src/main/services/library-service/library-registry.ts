import * as path from 'path'
import { getStoreValue, setStoreValue } from '../store-service'

export async function getRegisteredLibraries(): Promise<string[]> {
    const settings = getStoreValue('userSettings')
    return settings.libraryPaths
}

export async function registerLibrary(libraryPath: string, libraryId: string): Promise<void> {
    try {
        // Update libraryPaths in userSettings
        const settings = getStoreValue('userSettings')
        const normalizedPath = path.normalize(libraryPath).replace(/\\/g, '/')
        const libraryPathsSet = new Set([...settings.libraryPaths, normalizedPath])
        const libraryPaths = Array.from(libraryPathsSet)
        setStoreValue('userSettings', { ...settings, libraryPaths })

        // Update libraryIndex
        const index = getStoreValue('libraryIndex')
        setStoreValue('libraryIndex', {
            ...index,
            [libraryId]: normalizedPath,
        })
    } catch (error: any) {
        console.error(`Error registering library with ID ${libraryId} at ${libraryPath}:`, error)
        throw new Error(`Failed to register library: ${error.message}`)
    }
}

export async function unregisterLibrary(libraryId: string): Promise<void> {
    try {
        const index = getStoreValue('libraryIndex')
        const libraryPathToRemove = index[libraryId]

        // Update libraryIndex
        delete index[libraryId]
        setStoreValue('libraryIndex', index)

        if (!libraryPathToRemove) {
            console.warn(`Library with ID ${libraryId} not found in index during unregistration.`)
            // Optionally throw an error or return early depending on desired behavior
            return
        }

        // Update libraryPaths in userSettings
        const settings = getStoreValue('userSettings')
        const normalizedPathToRemove = path.normalize(libraryPathToRemove).replace(/\\/g, '/')
        setStoreValue('userSettings', {
            ...settings,
            libraryPaths: settings.libraryPaths.filter((p) => p !== normalizedPathToRemove),
        })
    } catch (error: any) {
        console.error(`Error unregistering library with ID ${libraryId}:`, error)
        throw new Error(`Failed to unregister library: ${error.message}`)
    }
}

export async function getLibraryPathById(libraryId: string): Promise<string | undefined> {
    const index = getStoreValue('libraryIndex')
    return index[libraryId]
}

export async function libraryExists(libraryPath: string): Promise<boolean> {
    const settings = getStoreValue('userSettings')
    // This function still relies on path, which might need reconsideration later
    // if we want purely ID-based existence checks at this level.
    // For now, keeping it as is based on the original structure.
    const normalizedPath = path.normalize(libraryPath).replace(/\\/g, '/')
    return settings.libraryPaths.some((p) => p === normalizedPath)
}
