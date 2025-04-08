import { createModuleId } from '@noggin/shared/slug'
import { Library } from '@noggin/types/library-types'
import { moduleMetadataSchema } from '@noggin/types/module-types'
import * as path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { findFiles, readJsonFile } from '../../common/fs-utils'
import { readAllLibraries } from '../library-service'
import { getRegisteredLibraries } from '../library-service/library-registry'
import {
    getAllModulePaths,
    getModuleOverviews,
    resolveModulePath,
} from './module-discovery-service'

// Mock dependencies - only mock application modules, not system modules that are globally mocked
vi.mock('../library-service')
vi.mock('../library-service/library-registry')
vi.mock('../../common/fs-utils')
vi.mock('../../common/module-utils', async () => {
    const actual = await vi.importActual('../../common/module-utils')
    return {
        ...actual,
        getModuleMetadataPath: vi.fn((modPath) => `${modPath}/.mod/meta.json`),
    }
})
vi.mock('@noggin/shared/slug', () => ({
    createModuleId: vi.fn((slug, createdAt) => `${slug}-${createdAt.replace(/[-:]/g, '')}`),
}))

describe('ModuleDiscoveryService', () => {
    // Mock data
    const mockLibraryId = 'test-library'
    const mockLibraryPath = '/test/library'
    const mockModuleId = 'test-module-20240101T000000Z'
    const mockModulePath = `${mockLibraryPath}/test-module`

    const mockLibraries: Library[] = [
        {
            path: mockLibraryPath,
            name: 'Test Library',
            description: 'Test Library Description',
            createdAt: new Date('2024-01-01T00:00:00Z').getTime(),
            slug: mockLibraryId,
        },
    ]

    const mockModuleMetadata = {
        id: mockModuleId,
        title: 'Test Module',
        slug: 'test-module',
        overview: 'Test Module Overview',
        createdAt: '2024-01-01T00:00:00Z',
        path: mockModulePath,
        updatedAt: '2024-01-01T00:00:00Z',
        libraryId: mockLibraryId,
    }

    beforeEach(() => {
        vi.resetAllMocks()
        vi.mocked(getRegisteredLibraries).mockResolvedValue([mockLibraryPath])
        vi.mocked(readAllLibraries).mockResolvedValue(mockLibraries)

        // Set up path.dirname to convert .mod paths to module paths
        vi.mocked(path.dirname).mockImplementation((p) => {
            if (p.endsWith('/.mod')) {
                return p.replace('/.mod', '')
            }
            return p.split('/').slice(0, -1).join('/') || '.'
        })
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('getAllModulePaths', () => {
        it('should return all module paths from all libraries', async () => {
            // Arrange
            // Mock findFiles to return module directories
            vi.mocked(findFiles).mockResolvedValueOnce([
                `${mockLibraryPath}/module1/.mod`,
                `${mockLibraryPath}/module2/.mod`,
            ])

            // Act
            const result = await getAllModulePaths()

            // Assert
            expect(getRegisteredLibraries).toHaveBeenCalled()
            expect(result).toEqual([`${mockLibraryPath}/module1`, `${mockLibraryPath}/module2`])
        })

        it('should return empty array if no modules found', async () => {
            // Arrange
            vi.mocked(findFiles).mockResolvedValueOnce([])

            // Act
            const result = await getAllModulePaths()

            // Assert
            expect(result).toEqual([])
        })
    })

    describe('scanLibraryModulePaths', () => {
        it('should find all modules in a library', async () => {
            // Arrange
            const mockModPaths = [
                `${mockLibraryPath}/module1/.mod`,
                `${mockLibraryPath}/module2/.mod`,
            ]

            vi.mocked(findFiles).mockResolvedValueOnce(mockModPaths)

            // Act
            // Import scanLibraryModulePaths inside the test to ensure mocks have been set up
            const { scanLibraryModulePaths } = await import('./module-discovery-service')
            const result = await scanLibraryModulePaths(mockLibraryPath)

            // Assert
            expect(findFiles).toHaveBeenCalledWith('*/.mod', {
                cwd: mockLibraryPath,
                absolute: true,
            })
            expect(result).toEqual([`${mockLibraryPath}/module1`, `${mockLibraryPath}/module2`])
        })

        it('should return empty array if no modules found', async () => {
            // Arrange
            vi.mocked(findFiles).mockResolvedValueOnce([])

            // Act
            // Import scanLibraryModulePaths inside the test to ensure mocks have been set up
            const { scanLibraryModulePaths } = await import('./module-discovery-service')
            const result = await scanLibraryModulePaths(mockLibraryPath)

            // Assert
            expect(result).toEqual([])
        })
    })

    describe('getModuleOverviews', () => {
        it('should return overview information for all modules in a library', async () => {
            // Arrange
            const module1Path = `${mockLibraryPath}/module1`
            const module2Path = `${mockLibraryPath}/module2`
            const module1MetaPath = `${module1Path}/.mod/meta.json`
            const module2MetaPath = `${module2Path}/.mod/meta.json`

            vi.mocked(findFiles).mockResolvedValueOnce([
                `${module1Path}/.mod`,
                `${module2Path}/.mod`,
            ])

            // Mock readJsonFile to return module metadata by checking the exact file path
            vi.mocked(readJsonFile).mockImplementation(async (path, schema) => {
                if (schema === moduleMetadataSchema) {
                    if (path === module1MetaPath) {
                        return {
                            ...mockModuleMetadata,
                            id: 'module1-id',
                            slug: 'module1',
                        }
                    } else if (path === module2MetaPath) {
                        return {
                            ...mockModuleMetadata,
                            id: 'module2-id',
                            slug: 'module2',
                        }
                    }
                }
                throw new Error(`Unexpected path: ${path}`)
            })

            // Act
            const result = await getModuleOverviews(mockLibraryId)

            // Assert
            expect(readAllLibraries).toHaveBeenCalled()
            expect(findFiles).toHaveBeenCalledWith('*/.mod', {
                cwd: mockLibraryPath,
                absolute: true,
            })
            expect(result).toHaveLength(2)
            expect(result[0]).toEqual({
                id: 'module1-id',
                slug: 'module1',
                displayName: 'Test Module',
                librarySlug: mockLibraryId,
            })
            expect(result[1]).toEqual({
                id: 'module2-id',
                slug: 'module2',
                displayName: 'Test Module',
                librarySlug: mockLibraryId,
            })
        })

        it('should throw error if library not found', async () => {
            // Arrange
            vi.mocked(readAllLibraries).mockResolvedValueOnce([])

            // Act & Assert
            await expect(getModuleOverviews('non-existent')).rejects.toThrow(
                'Library not found: non-existent'
            )
        })
    })

    describe('resolveModulePath', () => {
        it('should correctly resolve a module path using the moduleId', async () => {
            // Arrange
            const libraryId = 'test-library'
            const moduleSlug = 'test-module'
            const createdAt = '2024-01-01T12:34:56.789Z'
            const moduleId = createModuleId(moduleSlug, createdAt)

            const libraryPath = '/path/to/library'
            const modulePath = '/path/to/library/test-module-20240101T123456Z'

            // Mock getAllLibraries
            vi.mocked(readAllLibraries).mockResolvedValueOnce([
                {
                    path: libraryPath,
                    slug: libraryId,
                    name: 'Test Library',
                    description: 'Test Description',
                    createdAt: new Date('2024-01-01T00:00:00Z').getTime(),
                },
            ])

            // Mock findFiles for scanLibraryModulePaths
            vi.mocked(findFiles).mockResolvedValueOnce([`${modulePath}/.mod`])

            // Mock readJsonFile for metadata
            vi.mocked(readJsonFile).mockImplementationOnce(async (path, _schema) => {
                if (path.includes(modulePath)) {
                    return {
                        id: moduleId,
                        slug: moduleSlug,
                        title: 'Test Module',
                        overview: 'Test Overview',
                        createdAt: createdAt,
                        updatedAt: createdAt,
                        libraryId: libraryId,
                        path: modulePath,
                    }
                }
                throw new Error(`Unexpected path: ${path}`)
            })

            // Act
            const result = await resolveModulePath(libraryId, moduleId)

            // Assert
            expect(result).toBe(modulePath)
        })

        it('should throw error if library not found', async () => {
            // Arrange
            vi.mocked(readAllLibraries).mockResolvedValueOnce([])

            // Act & Assert
            await expect(resolveModulePath('non-existent', mockModuleId)).rejects.toThrow(
                'Library not found: non-existent'
            )
        })

        it('should return null if module not found', async () => {
            // Arrange
            const modulePath = `${mockLibraryPath}/test-module`
            const metadataPath = `${modulePath}/.mod/meta.json`

            vi.mocked(findFiles).mockResolvedValueOnce([`${modulePath}/.mod`])

            // Mock readJsonFile to return different module metadata (non-matching ID)
            vi.mocked(readJsonFile).mockImplementation(async (path, schema) => {
                if (schema === moduleMetadataSchema && path === metadataPath) {
                    return {
                        ...mockModuleMetadata,
                        slug: 'different-module',
                        createdAt: '2024-01-01T00:00:00Z',
                        id: 'different-module-id',
                    }
                }
                throw new Error(`Unexpected path: ${path}`)
            })

            // Act
            const result = await resolveModulePath(mockLibraryId, 'non-existent-id')

            // Assert
            expect(result).toBeNull()
        })
    })
})
