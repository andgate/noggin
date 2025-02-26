import { moduleMetadataSchema } from '@noggin/types/module-types'
import * as fs from 'fs/promises'
import { glob } from 'glob'
import * as path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readJsonFile } from '../common/fs-utils'
import { getAllLibraries, getRegisteredLibraries } from './library-service'
import {
    getAllModulePaths,
    getModuleOverviews,
    resolveModulePath,
    scanLibraryModulePaths,
} from './module-discovery-service'

// Mock dependencies - only mock application modules, not system modules that are globally mocked
vi.mock('./library-service')
vi.mock('../common/fs-utils')
vi.mock('@noggin/shared/slug', () => ({
    createModuleId: vi.fn((slug, createdAt) => `${slug}-${createdAt.replace(/[-:]/g, '')}`),
}))

describe('ModuleDiscoveryService', () => {
    // Mock data
    const mockLibraryId = 'test-library'
    const mockLibraryPath = '/test/library'
    const mockModuleId = 'test-module-20240101T000000Z'
    const mockModulePath = `${mockLibraryPath}/test-module`

    const mockLibraries = [
        {
            path: mockLibraryPath,
            metadata: {
                name: 'Test Library',
                description: 'Test Library Description',
                createdAt: '2024-01-01T00:00:00Z',
                slug: mockLibraryId,
            },
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
        vi.mocked(getAllLibraries).mockResolvedValue(mockLibraries)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('getAllModulePaths', () => {
        it('should return all module paths from all libraries', async () => {
            // Arrange
            vi.mocked(scanLibraryModulePaths).mockResolvedValueOnce([
                `${mockLibraryPath}/module1`,
                `${mockLibraryPath}/module2`,
            ])

            // Act
            const result = await getAllModulePaths()

            // Assert
            expect(getRegisteredLibraries).toHaveBeenCalled()
            expect(result).toEqual([`${mockLibraryPath}/module1`, `${mockLibraryPath}/module2`])
        })

        it('should return empty array if no modules found', async () => {
            // Arrange
            vi.mocked(scanLibraryModulePaths).mockResolvedValueOnce([])

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

            vi.mocked(glob).mockResolvedValueOnce(mockModPaths)

            // Mock path.dirname to return parent directory
            vi.mocked(path.dirname).mockImplementation((p) =>
                p.endsWith('.mod') ? p.replace('/.mod', '') : p
            )

            // Act
            const result = await scanLibraryModulePaths(mockLibraryPath)

            // Assert
            expect(glob).toHaveBeenCalledWith('*/.mod', {
                cwd: mockLibraryPath,
                absolute: true,
            })
            expect(result).toEqual([`${mockLibraryPath}/module1`, `${mockLibraryPath}/module2`])
        })

        it('should return empty array if no modules found', async () => {
            // Arrange
            vi.mocked(glob).mockResolvedValueOnce([])

            // Act
            const result = await scanLibraryModulePaths(mockLibraryPath)

            // Assert
            expect(result).toEqual([])
        })
    })

    describe('getModuleOverviews', () => {
        it('should return overview information for all modules in a library', async () => {
            // Arrange
            const modulePaths = [`${mockLibraryPath}/module1`, `${mockLibraryPath}/module2`]

            vi.mocked(scanLibraryModulePaths).mockResolvedValueOnce(modulePaths)

            // Mock readJsonFile to return module metadata
            vi.mocked(readJsonFile).mockImplementation(async (path, schema) => {
                if (schema === moduleMetadataSchema) {
                    if (path.includes('module1')) {
                        return {
                            ...mockModuleMetadata,
                            id: 'module1-id',
                            slug: 'module1',
                        }
                    } else {
                        return {
                            ...mockModuleMetadata,
                            id: 'module2-id',
                            slug: 'module2',
                        }
                    }
                }
                throw new Error('Unexpected schema')
            })

            // Act
            const result = await getModuleOverviews(mockLibraryId)

            // Assert
            expect(getAllLibraries).toHaveBeenCalled()
            expect(scanLibraryModulePaths).toHaveBeenCalledWith(mockLibraryPath)
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
            vi.mocked(getAllLibraries).mockResolvedValueOnce([])

            // Act & Assert
            await expect(getModuleOverviews('non-existent')).rejects.toThrow(
                'Library not found: non-existent'
            )
        })
    })

    describe('resolveModulePath', () => {
        it('should resolve module path from library and module IDs', async () => {
            // Arrange
            const modulePaths = [`${mockLibraryPath}/test-module`]
            vi.mocked(scanLibraryModulePaths).mockResolvedValueOnce(modulePaths)

            // Mock readJsonFile to return module metadata
            vi.mocked(readJsonFile).mockImplementation(async (path, schema) => {
                if (schema === moduleMetadataSchema) {
                    return {
                        ...mockModuleMetadata,
                        slug: 'test-module',
                        createdAt: '2024-01-01T00:00:00Z',
                        id: mockModuleId,
                    }
                }
                throw new Error('Unexpected schema')
            })

            // Act
            const result = await resolveModulePath(mockLibraryId, mockModuleId)

            // Assert
            expect(getAllLibraries).toHaveBeenCalled()
            expect(scanLibraryModulePaths).toHaveBeenCalledWith(mockLibraryPath)
            expect(result).toBe(`${mockLibraryPath}/test-module`)
        })

        it('should throw error if library not found', async () => {
            // Arrange
            vi.mocked(getAllLibraries).mockResolvedValueOnce([])

            // Act & Assert
            await expect(resolveModulePath('non-existent', mockModuleId)).rejects.toThrow(
                'Library not found: non-existent'
            )
        })

        it('should return null if module not found', async () => {
            // Arrange
            const modulePaths = [`${mockLibraryPath}/test-module`]
            vi.mocked(scanLibraryModulePaths).mockResolvedValueOnce(modulePaths)

            // Mock readJsonFile to return different module metadata (non-matching ID)
            vi.mocked(readJsonFile).mockImplementation(async (path, schema) => {
                if (schema === moduleMetadataSchema) {
                    return {
                        ...mockModuleMetadata,
                        slug: 'different-module',
                        createdAt: '2024-01-01T00:00:00Z',
                        id: 'different-module-id',
                    }
                }
                throw new Error('Unexpected schema')
            })

            // Act
            const result = await resolveModulePath(mockLibraryId, 'non-existent-id')

            // Assert
            expect(result).toBeNull()
        })
    })
})
