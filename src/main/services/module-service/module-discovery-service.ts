import { createModuleId } from '@noggin/shared/slug'
import { moduleMetadataSchema, ModuleOverview } from '@noggin/types/module-types'
import { readJsonFile } from '../../common/fs-utils'
import { getModuleMetadataPath, scanLibraryModulePaths } from '../../common/module-utils'
import { getAllLibraries, getRegisteredLibraries } from '../library-service'

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
    console.log(`getModuleOverviews called for library: ${libraryId}`)
    const libraries = await getAllLibraries()
    const library = libraries.find((lib) => lib.metadata.slug === libraryId)
    if (!library) {
        console.error(`Library not found: ${libraryId}`)
        throw new Error(`Library not found: ${libraryId}`)
    }
    console.log('Library Path:', library.path)
    const modulesPaths = await scanLibraryModulePaths(library.path)
    console.log(`Found ${modulesPaths.length} modules in library ${libraryId}:`, modulesPaths)

    const overviews = await Promise.all(
        modulesPaths.map(async (modPath): Promise<ModuleOverview> => {
            console.log(`Reading metadata for module at: ${modPath}`)
            const metadata = await readModuleMetadataLocal(modPath)
            return {
                id: metadata.id,
                slug: metadata.slug,
                displayName: metadata.title,
                librarySlug: libraryId,
            }
        })
    )

    console.log(`Returning ${overviews.length} module overviews for library ${libraryId}`)
    return overviews
}

/**
 * Resolve a module path from library and module IDs
 */
export async function resolveModulePath(
    libraryId: string,
    moduleId: string
): Promise<string | null> {
    console.log(`resolveModulePath called with: libraryId=${libraryId}, moduleId=${moduleId}`)
    const libraries = await getAllLibraries()
    const library = libraries.find((lib) => lib.metadata.slug === libraryId)
    if (!library) {
        console.error(`Library not found: ${libraryId}`)
        throw new Error(`Library not found: ${libraryId}`)
    }
    console.log(`Found library at path: ${library.path}`)

    // Get all modules in this library
    const modulePaths = await scanLibraryModulePaths(library.path)
    console.log(`Found ${modulePaths.length} modules in library ${libraryId}:`, modulePaths)

    // Read metadata from each module to find the matching slug
    for (const modPath of modulePaths) {
        try {
            console.log(`Checking module at: ${modPath}`)
            const metadata = await readModuleMetadataLocal(modPath)
            console.log(`Module metadata:`, {
                slug: metadata.slug,
                createdAt: metadata.createdAt,
                id: metadata.id,
            })
            const currModuleId = createModuleId(metadata.slug, metadata.createdAt)
            console.log(`Current module ID: ${currModuleId}, looking for: ${moduleId}`)
            if (currModuleId === moduleId) {
                console.log(`✅ Found matching module at: ${modPath}`)
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

    console.log(`❌ No matching module found for ${moduleId} in library ${libraryId}`)
    return null
}
