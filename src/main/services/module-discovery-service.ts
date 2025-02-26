import { createModuleId } from '@noggin/shared/slug'
import { moduleMetadataSchema, ModuleOverview } from '@noggin/types/module-types'
import path from 'path'
import { readJsonFile } from '../common/fs-utils'
import { getModuleMetadataPath, scanLibraryModulePaths } from '../common/module-utils'
import { getAllLibraries, getRegisteredLibraries } from './library-service'

/**
 * Get all module paths across all libraries
 */
export async function getAllModulePaths(): Promise<string[]> {
    const libraries = await getRegisteredLibraries()
    const allModulePaths: string[] = []

    for (const libraryPath of libraries) {
        const modulePaths = await scanLibraryModulePaths(libraryPath)
        allModulePaths.push(...modulePaths)
    }

    return allModulePaths
}

/**
 * Export the scanLibraryModulePaths from module-utils
 */
export { scanLibraryModulePaths }

/**
 * Read a module's metadata (isolated implementation to avoid circular dependencies)
 */
async function readModuleMetadataLocal(modPath: string) {
    const metadataPath = getModuleMetadataPath(modPath)
    try {
        return await readJsonFile(metadataPath, moduleMetadataSchema)
    } catch (error) {
        throw new Error(`Failed to read metadata for module at ${modPath}: ${error}`)
    }
}

/**
 * Get overview information for all modules in a library
 */
export async function getModuleOverviews(libraryId: string): Promise<ModuleOverview[]> {
    const libraries = await getAllLibraries()
    const library = libraries.find((lib) => lib.metadata.slug === libraryId)
    if (!library) {
        throw new Error(`Library not found: ${libraryId}`)
    }
    console.log('Library Path:', library.path)
    const modulesPaths = await scanLibraryModulePaths(library.path)

    const overviews = await Promise.all(
        modulesPaths.map(async (modPath): Promise<ModuleOverview> => {
            const metadata = await readModuleMetadataLocal(modPath)
            return {
                id: metadata.id,
                slug: metadata.slug,
                displayName: metadata.title,
                librarySlug: libraryId,
            }
        })
    )

    return overviews
}

/**
 * Resolve a module path from library and module IDs
 */
export async function resolveModulePath(
    libraryId: string,
    moduleId: string
): Promise<string | null> {
    const libraries = await getAllLibraries()
    const library = libraries.find((lib) => lib.metadata.slug === libraryId)
    if (!library) {
        throw new Error(`Library not found: ${libraryId}`)
    }

    // Get all modules in this library
    const modulePaths = await scanLibraryModulePaths(library.path)

    // Read metadata from each module to find the matching slug
    for (const modPath of modulePaths) {
        try {
            const metadata = await readModuleMetadataLocal(modPath)
            const currModuleId = createModuleId(metadata.slug, metadata.createdAt)
            if (currModuleId === moduleId) {
                return modPath
            } else {
                console.error(`Failed to read metadata for ${modPath}:`, {
                    libraryId,
                    moduleId,
                    metadata,
                })
            }
        } catch (error) {
            console.error(`Failed to read metadata for ${modPath}:`, error)
        }
    }

    return null
}
