import { moduleStatsSchema } from '@noggin/types/module-types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readJsonFile, writeJsonFile } from '../../common/fs-utils'
import { getModuleStatsPath } from '../../common/module-utils'
import { getAllLibraries } from '../library-service'
import { getModuleOverviews, resolveModulePath } from './module-discovery-service'
import { getAllModuleStats, getModuleStats, saveModuleStats } from './module-stats-service'

// Mock dependencies - only mock application modules, not system modules that are globally mocked
vi.mock('../../common/fs-utils')
vi.mock('../../common/module-utils')
vi.mock('../library-service')
vi.mock('./module-core-service')
vi.mock('./module-discovery-service')

describe('ModuleStatsService', () => {
    // Mock data
    const mockLibraryId = 'test-library'
    const mockModuleId = 'test-module-20240101T000000Z'
    const mockModulePath = '/test/library/test-module'

    const mockLibrary = {
        path: '/test/library',
        metadata: {
            name: 'Test Library',
            description: 'Test Library Description',
            createdAt: '2024-01-01T00:00:00Z',
            slug: mockLibraryId,
        },
    }

    const mockStats = {
        moduleId: mockModuleId,
        currentBox: 1,
        lastReviewDate: '2024-01-01T00:00:00Z',
        nextDueDate: '2024-01-02T00:00:00Z',
    }

    const mockModuleOverview = {
        id: mockModuleId,
        slug: mockModuleId,
        displayName: 'Test Module',
        librarySlug: mockLibraryId,
    }

    const mockStatsPath = `${mockModulePath}/.mod/stats.json`

    beforeEach(() => {
        vi.resetAllMocks()

        // Common mocks
        vi.mocked(resolveModulePath).mockResolvedValue(mockModulePath)
        vi.mocked(getModuleStatsPath).mockReturnValue(mockStatsPath)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('getModuleStats', () => {
        it('should read stats from the correct path', async () => {
            // Arrange
            vi.mocked(readJsonFile).mockResolvedValueOnce(mockStats)

            // Act
            const result = await getModuleStats(mockLibraryId, mockModuleId)

            // Assert
            expect(resolveModulePath).toHaveBeenCalledWith(mockLibraryId, mockModuleId)
            expect(getModuleStatsPath).toHaveBeenCalledWith(mockModulePath)
            expect(readJsonFile).toHaveBeenCalledWith(mockStatsPath, moduleStatsSchema)
            expect(result).toEqual(mockStats)
        })

        it('should return default stats if no stats file exists', async () => {
            // Arrange
            vi.mocked(readJsonFile).mockRejectedValueOnce(new Error('File not found'))

            // Act
            const result = await getModuleStats(mockLibraryId, mockModuleId)

            // Assert
            expect(result).toEqual({
                moduleId: mockModuleId,
                currentBox: 1,
                lastReviewDate: expect.any(String),
                nextDueDate: expect.any(String),
            })
        })

        it('should throw error if module is not found', async () => {
            // Arrange
            vi.mocked(resolveModulePath).mockResolvedValueOnce(null)

            // Act & Assert
            await expect(getModuleStats(mockLibraryId, 'non-existent')).rejects.toThrow(
                'Module not found: non-existent'
            )
        })
    })

    describe('saveModuleStats', () => {
        it('should save stats to the correct path', async () => {
            // Arrange
            vi.mocked(writeJsonFile).mockResolvedValueOnce(undefined)

            // Act
            await saveModuleStats(mockLibraryId, mockModuleId, mockStats)

            // Assert
            expect(resolveModulePath).toHaveBeenCalledWith(mockLibraryId, mockModuleId)
            expect(getModuleStatsPath).toHaveBeenCalledWith(mockModulePath)
            expect(writeJsonFile).toHaveBeenCalledWith(mockStatsPath, mockStats)
        })

        it('should do nothing if stats is undefined', async () => {
            // Act
            await saveModuleStats(mockLibraryId, mockModuleId, undefined)

            // Assert
            expect(writeJsonFile).not.toHaveBeenCalled()
        })

        it('should throw error if module is not found', async () => {
            // Arrange
            vi.mocked(resolveModulePath).mockResolvedValueOnce(null)

            // Act & Assert
            await expect(saveModuleStats(mockLibraryId, 'non-existent', mockStats)).rejects.toThrow(
                'Module not found: non-existent'
            )
        })
    })

    describe('getAllModuleStats', () => {
        it('should return stats for all modules across all libraries', async () => {
            // Arrange
            const mockStatsPath = `${mockModulePath}/.mod/stats.json`

            vi.mocked(getAllLibraries).mockResolvedValueOnce([mockLibrary])
            vi.mocked(getModuleOverviews).mockResolvedValueOnce([mockModuleOverview])
            vi.mocked(resolveModulePath).mockResolvedValueOnce(mockModulePath)
            vi.mocked(getModuleStatsPath).mockReturnValueOnce(mockStatsPath)
            vi.mocked(readJsonFile).mockResolvedValueOnce(mockStats)

            // Act
            const result = await getAllModuleStats()

            // Assert
            expect(getAllLibraries).toHaveBeenCalled()
            expect(getModuleOverviews).toHaveBeenCalledWith(mockLibraryId)
            expect(resolveModulePath).toHaveBeenCalledWith(mockLibraryId, mockModuleId)
            expect(getModuleStatsPath).toHaveBeenCalledWith(mockModulePath)
            expect(readJsonFile).toHaveBeenCalledWith(mockStatsPath, moduleStatsSchema)
            expect(result).toEqual([mockStats])
        })

        it('should filter out modules that fail to load stats', async () => {
            const mockLibraryId = 'test-library'
            const mockModuleId1 = 'test-module-1'
            const mockModuleId2 = 'test-module-2'
            const mockModulePath1 = '/test/library/test-module-1'

            // Mock library with correct structure
            const mockLibraries = [
                {
                    path: '/test/library',
                    metadata: {
                        name: 'Test Library',
                        description: 'Test Library Description',
                        createdAt: '2024-01-01T00:00:00Z',
                        slug: mockLibraryId,
                    },
                },
            ]

            // Mock module overviews
            const mockModuleOverviews = [
                {
                    id: mockModuleId1,
                    slug: mockModuleId1,
                    displayName: 'Test Module 1',
                    librarySlug: mockLibraryId,
                },
                {
                    id: mockModuleId2,
                    slug: mockModuleId2,
                    displayName: 'Test Module 2',
                    librarySlug: mockLibraryId,
                },
            ]

            // Module 1 stats that will load successfully
            const mockStats1 = {
                moduleId: mockModuleId1,
                currentBox: 1,
                lastReviewDate: '2024-01-01T00:00:00Z',
                nextDueDate: '2024-01-02T00:00:00Z',
            }

            const mockStatsPath1 = `${mockModulePath1}/.mod/stats.json`

            // Set up mocks for each service call
            vi.mocked(getAllLibraries).mockResolvedValueOnce(mockLibraries)
            vi.mocked(getModuleOverviews).mockResolvedValueOnce(mockModuleOverviews)

            // Mock resolveModulePath to succeed for module1 and fail for module2
            vi.mocked(resolveModulePath).mockImplementation(async (_libId, modId) => {
                if (modId === mockModuleId1) {
                    return mockModulePath1
                }
                return null // module2 path resolution fails
            })

            vi.mocked(getModuleStatsPath).mockReturnValueOnce(mockStatsPath1)
            vi.mocked(readJsonFile).mockResolvedValueOnce(mockStats1)

            // Act
            const result = await getAllModuleStats()

            // Assert
            expect(result).toHaveLength(1)
            expect(result[0].moduleId).toBe(mockModuleId1)
            expect(result[0]).toEqual(mockStats1)
        })

        it('should handle multiple libraries and modules', async () => {
            // Arrange
            const library2 = {
                ...mockLibrary,
                path: '/test/library2',
                metadata: {
                    ...mockLibrary.metadata,
                    slug: 'test-library2',
                },
            }

            const moduleOverview2 = {
                ...mockModuleOverview,
                id: 'module2-id',
                librarySlug: 'test-library2',
            }

            const stats2 = {
                ...mockStats,
                moduleId: 'module2-id',
            }

            const mockModulePath2 = '/test/library2/module2'
            const mockStatsPath1 = `${mockModulePath}/.mod/stats.json`
            const mockStatsPath2 = `${mockModulePath2}/.mod/stats.json`

            vi.mocked(getAllLibraries).mockResolvedValueOnce([mockLibrary, library2])
            vi.mocked(getModuleOverviews)
                .mockResolvedValueOnce([mockModuleOverview])
                .mockResolvedValueOnce([moduleOverview2])

            // First module mocks
            vi.mocked(resolveModulePath)
                .mockResolvedValueOnce(mockModulePath) // First call for first module
                .mockResolvedValueOnce(mockModulePath2) // Second call for second module

            vi.mocked(getModuleStatsPath)
                .mockReturnValueOnce(mockStatsPath1) // First call
                .mockReturnValueOnce(mockStatsPath2) // Second call

            vi.mocked(readJsonFile)
                .mockResolvedValueOnce(mockStats) // First call
                .mockResolvedValueOnce(stats2) // Second call

            // Act
            const result = await getAllModuleStats()

            // Assert
            expect(getAllLibraries).toHaveBeenCalled()
            expect(getModuleOverviews).toHaveBeenCalledTimes(2)
            expect(resolveModulePath).toHaveBeenCalledTimes(2)
            expect(getModuleStatsPath).toHaveBeenCalledTimes(2)
            expect(readJsonFile).toHaveBeenCalledTimes(2)
            expect(result).toEqual([mockStats, stats2])
        })
    })
})
